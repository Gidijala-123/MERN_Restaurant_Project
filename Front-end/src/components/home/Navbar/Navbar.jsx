import React, { useState, useCallback } from "react";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import { SidebarData } from "../../../APIs/Sidebar";
import "./Navbar.css";
import { IconContext } from "react-icons";
import { Link, useNavigate } from "react-router-dom";
import useSound from "../../../hooks/useSound";
import { Menu, MenuItem, ListItemIcon, Divider, Badge } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";

function Navbar() {
	const [sidebar, setSidebar] = useState(false);
	const [anchorEl, setAnchorEl] = useState(null);
	const navigate = useNavigate();
	const { playSound } = useSound();

	const showSidebar = () => {
		playSound("click");
		setSidebar(!sidebar);
	};

	const handleMenuOpen = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	const handleLogout = useCallback(async () => {
		playSound("click");
		handleMenuClose();

		try {
			const base = (
				import.meta.env.VITE_API_URL ||
				(window.location.hostname === "localhost" ? "http://localhost:1111" : window.location.origin)
			).replace(/\/$/, "");
			const csrf = await fetch(base + "/api/csrf", { credentials: "include" })
				.then((r) => r.json())
				.catch(() => ({}));
			await fetch(base + "/api/auth/logout", {
				method: "POST",
				credentials: "include",
				headers: { "x-csrf-token": csrf?.csrfToken || "" },
			});
		} catch { }

		// Clear local storage and redirect
		["token", "userName", "userRole", "userEmail", "userAvatar", "menuFavorites", "cartItems",
			"userPhone", "userAddress", "userDeliveryInstructions", "userPaymentMethod",
			"userFoodType", "userDeliverySpeed", "userSavedAddresses", "userDietaryRestrictions",
			"userReferralCode", "userOrders"].forEach((k) => localStorage.removeItem(k));
		
		playSound("success");
		window.location.href = "/";
	}, [playSound]);

	return (
		<>
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
							<h4 className="website-title p-0 m-0">Flavora</h4>
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
						<div className="nav-icon" title="Theme" onClick={() => playSound("click")}>
							<FaIcons.FaMoon />
						</div>
						<div className="nav-icon" title="Favorites" onClick={() => playSound("click")}>
							<FaIcons.FaHeart />
						</div>
						<div className="nav-icon" title="Cart" style={{ position: "relative" }} onClick={() => playSound("click")}>
							<FaIcons.FaShoppingCart />
							<span style={{
								position: "absolute",
								top: "-5px",
								right: "-5px",
								background: "#FF3814",
								color: "white",
								borderRadius: "50%",
								width: "18px",
								height: "18px",
								fontSize: "0.7rem",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontWeight: "bold",
								border: "2px solid white",
								marginLeft: 0,
								zIndex: 2
							}}>1</span>
						</div>
						<div className="nav-icon" title="Profile" onClick={handleMenuOpen}>
							{localStorage.getItem("userAvatar") ? (
								<img 
									src={localStorage.getItem("userAvatar")} 
									alt="profile" 
									style={{ width: "100%", height: "100%", borderRadius: "inherit", objectFit: "cover" }} 
								/>
							) : (
								<span>{localStorage.getItem("userName")?.charAt(0).toUpperCase() || "B"}</span>
							)}
						</div>
					</div>
					<Menu
						anchorEl={anchorEl}
						open={Boolean(anchorEl)}
						onClose={handleMenuClose}
						PaperProps={{
							elevation: 0,
							sx: {
								overflow: "visible",
								filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
								mt: 1.5,
								borderRadius: "12px",
								"& .MuiMenuItem-root": {
									fontSize: "0.9rem",
									fontWeight: 600,
									padding: "10px 20px",
								},
							},
						}}
						transformOrigin={{ vertical: "top", horizontal: "right" }}
						anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
					>
						<MenuItem onClick={() => { handleMenuClose(); navigate("/home/settings"); }}>
							<ListItemIcon>
								<ManageAccountsIcon fontSize="small" />
							</ListItemIcon>
							Profile
						</MenuItem>
						{localStorage.getItem("userRole") === "admin" && (
							<MenuItem onClick={() => { handleMenuClose(); navigate("/admin"); }}>
								<ListItemIcon>
									<SettingsIcon fontSize="small" />
								</ListItemIcon>
								Admin Panel
							</MenuItem>
						)}
						<Divider />
						<MenuItem onClick={handleLogout} sx={{ color: "#d32f2f" }}>
							<ListItemIcon sx={{ color: "#d32f2f" }}>
								<LogoutIcon fontSize="small" />
							</ListItemIcon>
							Logout
						</MenuItem>
					</Menu>
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
			</div>
		</>
	);
}

export default Navbar;
