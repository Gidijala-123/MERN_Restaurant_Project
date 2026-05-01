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
  
  // Map frontend 'id' to backend 'itemId' to satisfy Mongoose schema
  const formattedCart = cartItems.map(item => ({
    itemId: String(item.id || item.itemId || item._id),
    title: item.title || item.name || "",
    price: Number(item.price) || 0,
    img: item.img || item.imageUrl || "",
    cartQuantity: Number(item.cartQuantity) || 1
  }));

  try {
    const csrf = await fetch(`${API}/api/csrf`, { credentials: "include" })
      .then((r) => r.json()).catch(() => ({}));
    await fetch(`${API}/api/auth/cart`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json", "x-csrf-token": csrf?.csrfToken || "" },
      body: JSON.stringify({ cart: formattedCart }),
    });
  } catch { /* silent — cart is still in localStorage as fallback */ }
}

export async function loadCartFromDb() {
  try {
    const res = await fetch(`${API}/api/auth/cart`, { credentials: "include" });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.cart) return null;

    // Map backend 'itemId' back to frontend 'id' for Redux consistency
    return data.cart.map(item => ({
      id: item.itemId,
      title: item.title,
      price: item.price,
      img: item.img,
      cartQuantity: item.cartQuantity
    }));
  } catch { return null; }
}
