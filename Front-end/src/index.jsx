import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import productsReducer from "./components/features/productsSlice";
import { productsApi } from "./components/features/productsApi";
import cartReducer, { restoreCart } from "./components/features/cartSlice";
import { syncCartToDb, loadCartFromDb } from "./hooks/useCartSync";

const store = configureStore({
  reducer: {
    products: productsReducer,
    cart: cartReducer,
    [productsApi.reducerPath]: productsApi.reducer,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().concat(productsApi.middleware);
  },
});

// Sync cart to DB whenever it changes (debounced 800ms)
let cartSyncTimer = null;
let prevCart = null;
store.subscribe(() => {
  const cart = store.getState().cart.cartItems;
  if (cart === prevCart) return;
  prevCart = cart;
  clearTimeout(cartSyncTimer);
  cartSyncTimer = setTimeout(() => syncCartToDb(cart), 800);
});

// On app load, restore cart from DB if we have a session hint
// This avoids a 401 console error on the landing page for guest users
const hasSession = localStorage.getItem("userName") || document.cookie.includes("accessToken");
if (hasSession) {
  loadCartFromDb().then((dbCart) => {
    if (dbCart && dbCart.length > 0) {
      store.dispatch(restoreCart(dbCart));
    }
  }).catch(() => {
    // Silent fail — will use localStorage fallback
  });
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
