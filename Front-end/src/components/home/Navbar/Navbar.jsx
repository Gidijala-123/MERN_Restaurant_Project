// import React, { useState } from "react";
// import * as FaIcons from "react-icons/fa";
// import * as AiIcons from "react-icons/ai";
// import { SidebarData } from "../../../APIs/Sidebar";
// import "./Navbar.css";
// import { IconContext } from "react-icons";

// import { Link } from "react-router-dom";
// import { useSelector } from "react-redux";

// function Navbar() {
//   const [sidebar, setSidebar] = useState(false);

//   const showSidebar = () => setSidebar(!sidebar);

//   return (
//     <>
//       <IconContext.Provider value={{ color: "undefined" }}>
//         <div className="navbar">
//           <Link to="#" className="menu-bars">
//             <FaIcons.FaBars onClick={showSidebar} />
//           </Link>

//           <div className="nav-logo">
//             <img
//               src="/logo.png"
//               alt="kitchen-logo"
//               className="fa fa-spin kitchen-logo "
//             />
//             <div>
//               <h4 className="website-title p-0 m-0">Tastuuuuuuuuuuuu</h4>
//               <p className="p-0 m-0">Fresh & Healthy Food Recipe</p>
//             </div>
//           </div>

//           {/* <div className="searchbar-div" action="#">
//             <input className="search-input" type="text" placeholder="Search.." name="search" />
//             <button className="search-btn" type="submit">
//               <i className="fa fa-search"></i>
//             </button>
//           </div> */}
//           <div className="input-group searchbar-div">
//             <input
//               type="text"
//               className="form-control"
//               placeholder="Search here"
//             />
//             <div className="input-group-append">
//               <button className="search-btn btn btn-secondary" type="button">
//                 <i className="fa fa-search"></i>
//               </button>
//             </div>
//           </div>

//           <div className="nav-icons-div">
//             <i className="fa fa-bell-o" aria-hidden="true"></i>
//             <i className="fa fa-user-o" aria-hidden="true"></i>
//             <i className="fa fa-shopping-cart" aria-hidden="true"></i>
//           </div>
//         </div>
//         <nav className={sidebar ? "nav-menu active" : "nav-menu"}>
//           <ul className="nav-menu-items" onClick={showSidebar}>
//             <li className="navbar-toggle">
//               <Link to="#" className="menu-bars">
//                 <AiIcons.AiOutlineClose />
//               </Link>
//               <span className="categories-text">Categories</span>
//             </li>
//             {SidebarData.map((item, index) => {
//               return (
//                 <li key={index} className={item.cName}>
//                   <Link to={item.path}>
//                     {item.icon}
//                     <span>{item.title}</span>
//                   </Link>
//                 </li>
//               );
//             })}
//           </ul>
//         </nav>
//       </IconContext.Provider>
//     </>
//   );
// }

// export default Navbar;
