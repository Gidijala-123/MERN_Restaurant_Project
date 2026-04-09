import { useState, useEffect, useCallback, useRef } from "react";

const API = (import.meta.env.VITE_API_URL || "http://localhost:1111").replace(/\/$/, "");
const LS_KEY = "menuFavorites";

function writeLocal(map) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(map)); } catch { }
}

async function getCsrf() {
  try { return await fetch(`${API}/api/csrf`, { credentials: "include" }).then((r) => r.json()); } catch { return {}; }
}

export default function useFavorites() {
  const [favorites, setFavorites] = useState({});
  const dbLoaded = useRef(false);

  // Load from DB on mount — DB is the single source of truth
  useEffect(() => {
    fetch(`${API}/api/auth/favorites`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        const ids = Array.isArray(data?.favorites) ? data.favorites : [];
        const map = {};
        ids.forEach((id) => { map[String(id)] = true; });
        writeLocal(map);
        setFavorites(map);
        dbLoaded.current = true;
        window.dispatchEvent(new Event("favoritesUpdated"));
      })
      .catch(() => {
        // Fallback to localStorage if not logged in
        try {
          const local = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
          setFavorites(local);
        } catch { }
        dbLoaded.current = true;
      });
  }, []);

  // Sync when other components toggle
  useEffect(() => {
    const sync = () => {
      if (!dbLoaded.current) return;
      try {
        setFavorites(JSON.parse(localStorage.getItem(LS_KEY) || "{}"));
      } catch { }
    };
    window.addEventListener("favoritesUpdated", sync);
    return () => window.removeEventListener("favoritesUpdated", sync);
  }, []);

  // Toggle — uses functional update to always read latest state
  const toggle = useCallback(async (itemId) => {
    const id = String(itemId);
    let newValue = false;

    setFavorites((current) => {
      newValue = !(current[id] === true);
      const updated = { ...current, [id]: newValue };
      writeLocal(updated);
      return updated;
    });

    setTimeout(() => window.dispatchEvent(new Event("favoritesUpdated")), 0);

    // Persist to DB
    try {
      const csrf = await getCsrf();
      await fetch(`${API}/api/auth/favorites/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "x-csrf-token": csrf?.csrfToken || "" },
      });
    } catch {
      // Revert on failure
      setFavorites((current) => {
        const reverted = { ...current, [id]: !newValue };
        writeLocal(reverted);
        return reverted;
      });
      window.dispatchEvent(new Event("favoritesUpdated"));
    }
  }, []);

  // Remove — always sets to false, never toggles back to true
  const remove = useCallback(async (itemId) => {
    const id = String(itemId);

    setFavorites((current) => {
      if (current[id] !== true) return current;
      const updated = { ...current, [id]: false };
      writeLocal(updated);
      return updated;
    });

    setTimeout(() => window.dispatchEvent(new Event("favoritesUpdated")), 0);

    try {
      const csrf = await getCsrf();
      // Only call API if item was actually favorited in DB
      await fetch(`${API}/api/auth/favorites/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "x-csrf-token": csrf?.csrfToken || "" },
      });
    } catch { }
  }, []);

  const isFav = useCallback((itemId) => favorites[String(itemId)] === true, [favorites]);
  const count = Object.values(favorites).filter(Boolean).length;

  return { favorites, toggle, remove, isFav, count };
}
