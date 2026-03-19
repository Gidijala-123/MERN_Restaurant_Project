import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import PrivateRoute from "./components/auth/PrivateRoute";
import AdminRoute from "./components/auth/AdminRoute";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { ThemeProvider } from "./context/ThemeContext";
import { MenuProvider } from "./context/MenuContext";
import { Suspense, lazy } from "react";
import LoadingOverlay from "./components/common/LoadingOverlay";

// Lazy load large pages to reduce initial bundle size
const Signup = lazy(() => import("./components/signup/Signup"));
const Sidebar = lazy(() => import("./components/home/Sidebar/Sidebar"));
const Favorites = lazy(() => import("./components/home/Favorites"));
const Orders = lazy(() => import("./components/home/Orders"));
const Settings = lazy(() => import("./components/home/Settings"));
const AdminMetrics = lazy(() => import("./components/admin/AdminMetrics"));
const Notfound = lazy(() => import("./components/home/Notfound"));
const Cart = lazy(() => import("./components/home/CartComponent/Cart"));
const CheckoutSuccess = lazy(() => import("./components/home/CartComponent/CheckoutSuccess"));

/**
 * Main Application Component
 * Sets up routing, global providers, and core application structure
 */
function App() {
  return (
    <ThemeProvider>
      <MenuProvider>
        {/* BrowserRouter provides client-side navigation using the HTML5 History API */}
        <BrowserRouter>
          {/* ToastContainer displays alert messages across the application */}
          <ToastContainer 
            position="top-center"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
            toastStyle={{ 
              borderRadius: '16px',
              fontWeight: '700',
              fontFamily: 'Okra, sans-serif',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              padding: '12px 20px'
            }}
          />
          <Suspense fallback={<LoadingOverlay showText={false} />}>
            <Routes>
              {/* Default route points to combined Signup/Login page */}
              <Route path="/" element={<Signup />} />
              {/* Main Home/Dashboard route with Sidebar */}
              <Route
                path="/home"
                element={
                  <PrivateRoute>
                    <Sidebar />
                  </PrivateRoute>
                }
              />
              <Route
                path="/home/favorites"
                element={
                  <PrivateRoute>
                    <Sidebar />
                  </PrivateRoute>
                }
              />
              <Route
                path="/home/orders"
                element={
                  <PrivateRoute>
                    <Sidebar />
                  </PrivateRoute>
                }
              />
              <Route
                path="/home/settings"
                element={
                  <PrivateRoute>
                    <Sidebar />
                  </PrivateRoute>
                }
              />
              {/* Shopping Cart page */}
              <Route
                path="/cart"
                element={
                  <PrivateRoute>
                    <Cart />
                  </PrivateRoute>
                }
              />
              {/* Admin Metrics */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminMetrics />
                  </AdminRoute>
                }
              />
              {/* Post-checkout success confirmation page */}
              <Route path="/checkout-success" element={<CheckoutSuccess />} />
              {/* Custom 404 page for unmatched routes */}
              <Route path="/not-found" element={<Notfound />} />
              {/* Redirect any other undefined path to Not Found page */}
              <Route path="*" element={<Navigate to="/not-found" />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </MenuProvider>
    </ThemeProvider>
  );
}

export default App;
