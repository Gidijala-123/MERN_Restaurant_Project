import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./components/signup/Signup";
import Login from "./components/login/Login";
import "./App.css";
import Sidebar from "./components/home/Sidebar/Sidebar";
import VideoComponent from "./components/home/Del/Del";

import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import Notfound from "./components/home/Notfound";
import Cart from "./components/home/CartComponent/Cart";

function App() {
  return (
    <>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Signup> </Signup>}></Route>
          <Route path="/login" element={<Login> </Login>}></Route>
          <Route path="/home" element={<Sidebar> </Sidebar>}></Route>
          <Route
            path="/del"
            element={<VideoComponent> </VideoComponent>}
          ></Route>
          <Route path="/cart" exact Component={Cart} />
          <Route path="/not-found" Component={Notfound} />
          <Route path="*" element={<Navigate to="/not-found" />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
