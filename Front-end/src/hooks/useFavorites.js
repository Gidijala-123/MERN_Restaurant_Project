import { useState, useEffect, useCallback } from "react";

const API = (import.meta.env.VITE_API_URL || "http://localhost:1111").replace(/\/$/, "");
const LS_KEY = "menuFavorites";

// ── helpers ────────────────────────────────────────────────────────────────

function readLocal() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch { return {}; }
}

function writeLocal(map) {
  localStorage.setItem(LS_KEY, JSON.stringify(map));
}

async function getCsrf() {
  try { return await fetch(`${API}/api/csrf`, { credentials: "include" }).then((r) => r.json()); } catch { return {}; }
}

// ── hook ───────────────────────────────────────────────────────────────────

export default function useFavorites() {
  const [favorites, setFavorites] = useState(readLocal);

  // Load from DB on mount (if logged in)
  useEffect(() => {
    fetch(`${API}/api/auth/favorites`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data?.favorites) return;
        // Build map { "27": true, "5": true, ... }
        const map = {};
        data.favorites.forEach((id) => { map[String(id)] = true; });
        writeLocal(map);
        setFavorites(map);
        window.dispatchEvent(new Event("favoritesUpdated"));
      })
      .catch(() => { });
  }, []);

  // Listen for changes from other components
  useEffect(() => {
    const sync = () => setFavorites(readLocal());
    window.addEventListener("favoritesUpdated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("favoritesUpdated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback(async (itemId) => {
    const id = String(itemId);
    const current = readLocal();
    const isOn = current[id] === true;

    // Optimistic update
    const updated = { ...current, [id]: !isOn };
    writeLocal(updated);
    setFavorites(updated);
    window.dispatchEvent(new Event("favoritesUpdated"));

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
      writeLocal(current);
      setFavorites(current);
      window.dispatchEvent(new Event("favoritesUpdated"));
    }
  }, []);

  const isFav = useCallback((itemId) => favorites[String(itemId)] === true, [favorites]);

  const count = Object.values(favorites).filter(Boolean).length;

  return { favorites, toggle, isFav, count };
}
