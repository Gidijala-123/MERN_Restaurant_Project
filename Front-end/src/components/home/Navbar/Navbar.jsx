import React, { useState } from "react";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import { SidebarData } from "../../../APIs/Sidebar";
import "./Navbar.css";
import { IconContext } from "react-icons";
import { Link } from "react-router-dom";

function Navbar() {
	const [sidebar, setSidebar] = useState(false);
	const showSidebar = () => setSidebar(!sidebar);

	return (
		<>
			<IconContext.Provider value={{ color: "inherit" }}>
				<div className="navbar">
					<Link to="#" className="menu-bars">
						<FaIcons.FaBars onClick={showSidebar} />
					</Link>

					<div className="nav-logo">
						<img
							src="/logo.png"
							alt="kitchen-logo"
							className="fa fa-spin kitchen-logo "
						/>
						<div>
							<h4 className="website-title p-0 m-0">Tasty Kitchen</h4>
							<p className="p-0 m-0">Fresh & Healthy Food</p>
						</div>
					</div>

					<div className="input-group searchbar-div">
						<input
							type="text"
							className="form-control"
							placeholder="Search for delicious food..."
						/>
						<div className="input-group-append">
							<button className="search-btn btn btn-secondary" type="button">
								<FaIcons.FaSearch className="nav-icon" />
							</button>
						</div>
					</div>

					<div className="nav-icons-div">
						<FaIcons.FaMoon className="nav-icon" title="Theme" />
						<FaIcons.FaHeart className="nav-icon" title="Favorites" />
						<FaIcons.FaShoppingCart className="nav-icon" title="Cart" />
						<FaIcons.FaUserCircle className="nav-icon" title="Profile" />
					</div>
				</div>
				{/* Sidebar navigation (optional, can be removed if not needed) */}
				<nav className={sidebar ? "nav-menu active" : "nav-menu"}>
					<ul className="nav-menu-items" onClick={showSidebar}>
						<li className="navbar-toggle">
							<Link to="#" className="menu-bars">
								<AiIcons.AiOutlineClose />
							</Link>
							<span className="categories-text">Categories</span>
						</li>
						{SidebarData.map((item, index) => {
							return (
								<li key={index} className={item.cName}>
									<Link to={item.path}>
										{item.icon}
										<span>{item.title}</span>
									</Link>
								</li>
							);
						})}
					</ul>
				</nav>
			</IconContext.Provider>
		</>
	);
}

export default Navbar;
