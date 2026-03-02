import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./components/signup/Signup";
import "./App.css";
import Sidebar from "./components/home/Sidebar/Sidebar";
import VideoComponent from "./components/home/Del/Del";

import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import Notfound from "./components/home/Notfound";
import Cart from "./components/home/CartComponent/Cart";
import CheckoutSuccess from "./components/home/CartComponent/CheckoutSuccess";
import { ThemeProvider } from "./context/ThemeContext";

/**
 * Main Application Component
 * Sets up routing, global providers, and core application structure
 */
function App() {
  return (
    <ThemeProvider>
      {/* BrowserRouter provides client-side navigation using the HTML5 History API */}
      <BrowserRouter>
        {/* ToastContainer displays alert messages across the application */}
        <ToastContainer />
        <Routes>
          {/* Default route points to combined Signup/Login page */}
          <Route path="/" element={<Signup> </Signup>}></Route>
          {/* Main Home/Dashboard route with Sidebar */}
          <Route path="/home" element={<Sidebar> </Sidebar>}></Route>
          {/* Temporary/Development route for video testing */}
          <Route
            path="/del"
            element={<VideoComponent> </VideoComponent>}
          ></Route>
          {/* Shopping Cart page */}
          <Route path="/cart" exact Component={Cart} />
          {/* Post-checkout success confirmation page */}
          <Route path="/checkout-success" element={<CheckoutSuccess />} />
          {/* Custom 404 page for unmatched routes */}
          <Route path="/not-found" Component={Notfound} />
          {/* Redirect any other undefined path to Not Found page */}
          <Route path="*" element={<Navigate to="/not-found" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
