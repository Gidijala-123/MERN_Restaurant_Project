/**
 * Syncs the Redux cart to the backend DB.
 * Call this after any cart mutation (add, remove, clear).
 * Fire-and-forget — never blocks the UI.
 */
const API = (import.meta.env.VITE_API_URL || 
  (typeof window !== "undefined" && window.location.hostname !== "localhost" ? window.location.origin : "http://localhost:1111")
).replace(/\/$/, "");

export async function syncCartToDb(cartItems) {
  // Only sync if we have a session
  if (!localStorage.getItem("userName") && !document.cookie.includes("accessToken")) return;
  
  try {
    const csrf = await fetch(`${API}/api/csrf`, { credentials: "include" })
      .then((r) => r.json()).catch(() => ({}));
    await fetch(`${API}/api/auth/cart`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json", "x-csrf-token": csrf?.csrfToken || "" },
      body: JSON.stringify({ cart: cartItems }),
    });
  } catch { /* silent — cart is still in localStorage as fallback */ }
}

export async function loadCartFromDb() {
  try {
    const res = await fetch(`${API}/api/auth/cart`, { credentials: "include" });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.cart || null;
  } catch { return null; }
}
