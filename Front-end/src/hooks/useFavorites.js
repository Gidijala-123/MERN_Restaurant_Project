import { useState, useEffect, useCallback, useRef } from "react";

const API = (import.meta.env.VITE_API_URL || 
  (typeof window !== "undefined" && window.location.hostname !== "localhost" ? window.location.origin : "http://localhost:1111")
).replace(/\/$/, "");
const LS_KEY = "menuFavorites";

function writeLocal(ids) {
  // Store as array in localStorage for simplicity
  try { localStorage.setItem(LS_KEY, JSON.stringify(ids)); } catch { }
}

function readLocalIds() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    let ids;
    if (Array.isArray(parsed)) {
      ids = parsed.map(String);
    } else {
      ids = Object.entries(parsed).filter(([, v]) => v === true).map(([k]) => k);
    }
    // Filter out MongoDB ObjectId strings (24-char hex) — only keep numeric itemIds
    return ids.filter((id) => /^\d+$/.test(id));
  } catch { return []; }
}

let cachedCsrf = null;
async function getCsrf() {
  if (cachedCsrf) return cachedCsrf;
  try {
    const data = await fetch(`${API}/api/csrf`, { credentials: "include" }).then((r) => r.json());
    cachedCsrf = data;
    // Expire cache after 50 minutes (token lasts 60m)
    setTimeout(() => { cachedCsrf = null; }, 50 * 60 * 1000);
    return data;
  } catch { return {}; }
}

async function saveToDb(ids) {
  try {
    const csrf = await getCsrf();
    const res = await fetch(`${API}/api/auth/favorites`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json", "x-csrf-token": csrf?.csrfToken || "" },
      body: JSON.stringify({ favorites: ids }),
    });
    // If CSRF token was rejected, clear cache and retry once
    if (res.status === 403) {
      cachedCsrf = null;
      const freshCsrf = await getCsrf();
      await fetch(`${API}/api/auth/favorites`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json", "x-csrf-token": freshCsrf?.csrfToken || "" },
        body: JSON.stringify({ favorites: ids }),
      });
    }
  } catch { }
}

export default function useFavorites() {
  // ids = string array of favorited item IDs
  const [ids, setIds] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const dbLoaded = useRef(false);

  // Load from DB on mount — DB is the single source of truth
  useEffect(() => {
    fetch(`${API}/api/auth/favorites`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.favorites) {
          // DB is source of truth — keep only numeric itemIds, discard old ObjectId strings
          const dbIds = data.favorites.map(String).filter((id) => /^\d+$/.test(id));
          writeLocal(dbIds);
          setIds(dbIds);
        } else {
          setIds(readLocalIds());
        }
        dbLoaded.current = true;
        setLoaded(true);
        window.dispatchEvent(new Event("favoritesUpdated"));
      })
      .catch(() => {
        const local = readLocalIds();
        setIds(local);
        dbLoaded.current = true;
        setLoaded(true);
      });
  }, []);

  // Sync when other components change favorites
  useEffect(() => {
    const sync = () => {
      if (!dbLoaded.current) return;
      setIds(readLocalIds());
    };
    window.addEventListener("favoritesUpdated", sync);
    return () => window.removeEventListener("favoritesUpdated", sync);
  }, []);

  // Toggle — add if not present, remove if present
  const toggle = useCallback((itemId) => {
    const id = String(itemId);
    setIds((current) => {
      const exists = current.includes(id);
      const updated = exists ? current.filter((x) => x !== id) : [...current, id];
      writeLocal(updated);
      saveToDb(updated);
      setTimeout(() => window.dispatchEvent(new Event("favoritesUpdated")), 0);
      return updated;
    });
  }, []);

  // Remove — always removes, never adds
  const remove = useCallback((itemId) => {
    const id = String(itemId);
    setIds((current) => {
      if (!current.includes(id)) return current;
      const updated = current.filter((x) => x !== id);
      writeLocal(updated);
      saveToDb(updated);
      setTimeout(() => window.dispatchEvent(new Event("favoritesUpdated")), 0);
      return updated;
    });
  }, []);

  const isFav = useCallback((itemId) => ids.includes(String(itemId)), [ids]);

  // Build map for backward compat with components that check favorites[id]
  const favorites = Object.fromEntries(ids.map((id) => [id, true]));

  const count = ids.length;

  return { favorites, ids, toggle, remove, isFav, count, loaded };
}
