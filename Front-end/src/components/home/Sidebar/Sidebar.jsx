// Material Components
import {
  styled,
  useTheme,
  Box,
  Drawer as MuiDrawer,
  AppBar as MuiAppBar,
  Toolbar,
  List,
  CssBaseline,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  Typography,
  CircularProgress,
  Menu,
  MenuItem,
} from "@mui/material";

// Material Icons - Only absolute core icons
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Mail as MailIcon,
  Notifications as NotificationsIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  ShoppingBag as OrdersIcon,
  Favorite as FavoritesIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Settings as SettingsIcon,
  LocalFireDepartment as HotOffersIcon,
  Grass as VegIcon,
  SetMeal as NonVegIcon,
  OutdoorGrill as TandooriIcon,
  SoupKitchen as SoupIcon,
  LocalFlorist as SaladIcon,
  LunchDining as SandwichIcon,
  Star as SignatureIcon,
  RiceBowl as BiryaniIcon,
  RestaurantMenu as MainCourseIcon,
  BakeryDining as RiceIcon,
  RamenDining as SouthIndianIcon,
  TakeoutDining as ChineseIcon,
  LocalBar as BeverageIcon,
  LocalDrink as CocktailIcon,
  Icecream as DessertIcon,
  Logout as LogoutIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CreditCard as CreditCardIcon,
  Notes as NotesIcon,
  LocalShipping as DeliveryIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

import {
  Modal,
  Fade,
  Backdrop,
  TextField,
  Button,
  Avatar,
  Card,
  CardContent,
  Chip,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
  LinearProgress,
  IconButton as MuiIconButton,
  Divider,
} from "@mui/material";

import "./Sidebar.css";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useMediaQuery } from "@mui/material";
import { toast } from "react-toastify";
import { PopupAlert } from "../../common/PopupAlert";
import Bodycontent from "../Bodycontent/Bodycontent";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useTheme as useAppTheme } from "../../../context/ThemeContext";
import { useMenu } from "../../../context/MenuContext";

// carttttt
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import SearchBar from "../Bodycontent/SEARCH_COMPONENT/SearchBar";
import { addToCart } from "../../features/cartSlice";
import { useGetAllProductsQuery } from "../../features/productsApi";

import Favorites from "../Favorites";
import Orders from "../Orders";
import Settings from "../Settings";

const drawerWidth = 230;

const Sidebar_Items = [
  { text: "Settings", icon: <SettingsIcon /> },
  { text: "Logout", icon: <LogoutIcon />, action: "logout" },
];

const Category_Items = [
  { text: "Hot Offers", icon: <HotOffersIcon /> },
  { text: "Veg Starters", icon: <VegIcon /> },
  { text: "Non-Veg Starters", icon: <NonVegIcon /> },
  { text: "Tandooris", icon: <TandooriIcon /> },
  { text: "Soups", icon: <SoupIcon /> },
  { text: "Salads", icon: <SaladIcon /> },
  { text: "Sandwiches", icon: <SandwichIcon /> },
  { text: "Signature Dishes", icon: <SignatureIcon /> },
  { text: "Biryanis", icon: <BiryaniIcon /> },
  { text: "Main Course", icon: <MainCourseIcon /> },
  { text: "Rice & Breads", icon: <RiceIcon /> },
  { text: "South Indian", icon: <SouthIndianIcon /> },
  { text: "Chinese", icon: <ChineseIcon /> },
  { text: "Beverages", icon: <BeverageIcon /> },
  { text: "Cocktails/Mocktails", icon: <CocktailIcon /> },
  { text: "Desserts", icon: <DessertIcon /> },
];

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(0, 2),
  height: 72,
  minHeight: 72,
  [theme.breakpoints.down("md")]: {
    height: 120, /* Height of AppBar + Mobile Search Bar */
    minHeight: 120,
  },
  boxSizing: "border-box",
}));

const AppBar = styled(MuiAppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
  overflowY: "auto" /* Allow vertical scrolling */,
  scrollbarWidth: "none" /* Firefox */,
  "&::-webkit-scrollbar": {
    display: "none" /* Safari and Chrome */,
  },
  msOverflowStyle: "none" /* IE and Edge */,
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
  scrollbarWidth: "none",
  "&::-webkit-scrollbar": {
    display: "none",
  },
  msOverflowStyle: "none",
});

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export default function Sidebar() {
  const theme = useTheme();
  const [open, setOpen] = useState(false); // Set to false to collapse the sidebar by default
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [currentSection, setCurrentSection] = useState("Home");
  const [activeSidebarItem, setActiveSidebarItem] = useState("Hot Offers");
  const [activeCategory, setActiveCategory] = useState("Hot Offers");
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState("");
  const [logoutMessage, setLogoutMessage] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [accountAnchorEl, setAccountAnchorEl] = useState(null);
  const isAccountMenuOpen = Boolean(accountAnchorEl);

  const navigate = useNavigate();
  const location = useLocation();

  const { theme: appTheme, toggleTheme } = useAppTheme();
  const { handleCategoryChange } = useMenu();
  const [favoritesCount, setFavoritesCount] = useState(0);
  const { data, isLoading } = useGetAllProductsQuery();

  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    const storedAvatar = localStorage.getItem("userAvatar") || "";
    if (storedUserName) {
      setUserName(storedUserName);
    }
    if (storedAvatar) {
      setUserAvatar(storedAvatar);
    }
  }, []);

  useEffect(() => {
    // Avoid calling /api/auth/me on a fresh load if the user hasn't logged in.
    // We keep the local cache (userName) as the source of truth for “logged in” state.
    if (!localStorage.getItem("userName")) return;

    const load = async () => {
      try {
        const base = (
          import.meta.env.VITE_API_URL || "http://localhost:1111"
        ).replace(/\/$/, "");
        const res = await fetch(base + "/api/auth/me", {
          credentials: "include",
        });
        if (res.ok) {
          const me = await res.json();
          if (me?.uname) {
            localStorage.setItem("userName", me.uname);
            setUserName(me.uname);
          }
          if (me?.avatar) {
            localStorage.setItem("userAvatar", me.avatar);
            setUserAvatar(me.avatar);
          }
        }
      } catch {}
    };
    load();
  }, []);

  const handleLogout = useCallback(async () => {
    const name = userName || "back";
    setLogoutMessage(`Thank you ${name}, please visit again. See you soon!`);
    setShowLogoutModal(true);
    setAccountAnchorEl(null);

    try {
      const base = import.meta.env.VITE_API_URL || "http://localhost:1111";
      const csrf = await fetch(base + "/api/csrf", { credentials: "include" })
        .then((r) => r.json())
        .catch(() => ({}));
      await fetch(base + "/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: { "x-csrf-token": csrf?.csrfToken || "" },
      });
    } catch {}
    setTimeout(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("userName");
      window.location.href = "/";
    }, 1500);
  }, [userName]);

  const handleDrawerToggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const handleDrawerOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleAccountMenuOpen = useCallback((event) => {
    setAccountAnchorEl(event.currentTarget);
  }, []);

  const handleAccountMenuClose = useCallback(() => {
    setAccountAnchorEl(null);
  }, []);

  const handleGoToSettings = useCallback(() => {
    handleAccountMenuClose();
    navigate("/home/settings");
  }, [handleAccountMenuClose, navigate]);

  const menuStyle = useMemo(() => ({
    color: appTheme === "dark" ? "white" : "inherit",
  }), [appTheme]);

  const handleSectionChange = useCallback((section, sidebarItem = null) => {
    setCurrentSection(section);
    if (sidebarItem) {
      setActiveSidebarItem(sidebarItem);
      setActiveCategory(sidebarItem);
      // Update MenuContext with the selected category
      handleCategoryChange(sidebarItem);
    }
  }, [handleCategoryChange]);

  // Map sidebar items to Bodycontent sections
  const sectionMap = useMemo(() => ({
    "Hot Offers": "Home",
    "Veg Starters": "VegStarters",
    "Non-Veg Starters": "NonVegStarters",
    Tandooris: "Tandooris",
    Soups: "Soups",
    Salads: "Salads",
    Sandwiches: "Sandwiches",
    "Signature Dishes": "SignatureDishes",
    Biryanis: "Biryanis",
    "Main Course": "MainCourse",
    "Rice & Breads": "RiceBreads",
    "South Indian": "SouthIndian",
    "Chinese": "IndoChinese",
    Beverages: "Beverages",
    "Cocktails/Mocktails": "Cocktails",
    Desserts: "Desserts",
  }), []);

  // cartttttt
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);
  const quantity = useMemo(() => {
    return cartItems.reduce((total, cartItem) => {
      return total + cartItem.cartQuantity;
    }, 0);
  }, [cartItems]);

  const computeFavorites = useCallback(() => {
    const keys = ["trendingBookmarked", "discountBookmarked", "offerBookmarked", "popularBookmarked", "recentBookmarked"];
    const allIds = new Set();
    keys.forEach(key => {
      const saved = JSON.parse(localStorage.getItem(key) || "{}");
      Object.entries(saved).forEach(([id, isBookmarked]) => {
        if (isBookmarked) {
          allIds.add(id);
        }
      });
    });
    return allIds.size;
  }, []);

  useEffect(() => {
    const updateFavoritesCount = () => {
      setFavoritesCount(computeFavorites());
    };
    updateFavoritesCount();
    window.addEventListener("storage", updateFavoritesCount);
    window.addEventListener("favoritesUpdated", updateFavoritesCount);
    return () => {
      window.removeEventListener("storage", updateFavoritesCount);
      window.removeEventListener("favoritesUpdated", updateFavoritesCount);
    };
  }, [computeFavorites]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <CssBaseline />
      <AppBar position="static" elevation={0} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar
          sx={{ 
            minHeight: { xs: 64, md: 72 }, 
            height: { xs: 64, md: 72 }, 
            paddingLeft: { xs: 1, md: 0 }, 
            paddingRight: { xs: 1, md: 2 }, 
            boxSizing: "border-box",
            background: "var(--nav-bg)",
            borderBottom: `1px solid ${appTheme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`
          }}
        >
          <IconButton
            aria-label="toggle drawer"
            onClick={handleDrawerToggle}
            sx={{
              width: { xs: 32, md: 38 },
              height: { xs: 32, md: 38 },
              marginLeft: { xs: 0.5, md: "13.5px" }, // Center within 65px: (65-38)/2 = 13.5
              marginRight: { xs: 1, md: "13.5px" }, 
              borderRadius: "8px",
              background: "linear-gradient(135deg, #FF6A00 0%, #FF8C3A 100%)",
              color: "white",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(255, 106, 0, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #FF8C3A 0%, #FF6A00 100%)",
                transform: "scale(1.05) translateY(-2px)",
                boxShadow: "0 6px 20px rgba(255, 106, 0, 0.4)"
              },
              zIndex: 1300
            }}
          >
            <div className={`hamburger-box ${open ? 'open' : ''}`}>
              <span className="hamburger-inner"></span>
              <span className="hamburger-inner"></span>
              <span className="hamburger-inner"></span>
            </div>
          </IconButton>

          <Box
            className="dashboard-header-fixed"
            sx={{
              display: "flex",
              flexWrap: "nowrap",
              alignItems: "center",
              gap: { xs: 1, md: 1.5 },
              width: "100%",
              height: "100%",
              px: { xs: 1, md: 0 },
              boxSizing: "border-box",
            }}
          >
            {/* Branding - Only visible if sidebar is closed */}
            {!open && (
              <Box
                className="brand-area"
                sx={{
                  flex: { xs: "0 0 140px", md: "0 0 220px" },
                  minWidth: 0,
                  opacity: 1,
                  transition: "opacity 0.3s ease",
                  gap: { xs: 0.5, md: 1 }
                }}
              >
                <img
                  src="/footer-images/logo.png"
                  alt="logo"
                  className="website-logo"
                  style={{ width: "1.75rem", height: "1.75rem" }}
                />
                <div className="brand-text">
                  <span className="title" style={{ fontSize: "0.9rem" }}>Flavora</span>
                  <span className="subtitle" style={{ fontSize: "0.6rem", display: { xs: "none", sm: "block" } }}>Fresh & Healthy Food</span>
                </div>
              </Box>
            )}
            {/* Greeting - Hidden on mobile */}
            <Box
              className="greeting-area"
              sx={{
                flex: "0 0 auto",
                minWidth: 0,
                display: { xs: "none", lg: "flex" },
                flexDirection: "row",
                alignItems: "center",
                gap: 1.5,
                padding: "0 1rem",
                position: "relative"
              }}
            >
              <Box
                sx={{
                  width: "2px",
                  height: "24px",
                  background: "linear-gradient(to bottom, transparent, var(--primary), transparent)",
                  opacity: 0.5,
                  borderRadius: "2px"
                }}
              />
              <div className="greeting-content">
                <span className="greeting-top">
                  {(() => {
                    const hrs = new Date().getHours();
                    return hrs < 12 ? "Good Morning" : hrs < 18 ? "Good Afternoon" : "Good Evening";
                  })()},
                </span>
                <span className="greeting-bottom">
                  {userName || "Guest"}!
                </span>
              </div>
            </Box>
            {/* Search - Hidden on mobile in the toolbar, shown below instead */}
            <Box className="search-area" sx={{ flex: "1 1 auto", minWidth: 0, display: { xs: "none", md: "block" } }}>
              <div className="search-main-div" style={{ width: "100%" }}>
                <SearchBar onSearchChange={handleSectionChange} />
              </div>
            </Box>
            {/* Actions */}
            <Box
              className="actions-area"
              sx={{
                flex: { xs: "1 1 auto", md: "0 0 280px" },
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: { xs: 0.5, md: 1.5 },
                whiteSpace: "nowrap",
              }}
            >
              <IconButton 
                color="inherit" 
                onClick={toggleTheme}
                sx={{ 
                  p: { xs: 0.8, md: 1.2 }, 
                  borderRadius: "10px",
                  background: appTheme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
                  transition: "all 0.3s ease",
                  "&:hover": { 
                    transform: "rotate(15deg) scale(1.1)",
                    color: "var(--primary) !important",
                    background: "rgba(230, 81, 0, 0.1) !important"
                  }
                }}
              >
                {appTheme === "dark" ? <LightModeIcon sx={{ fontSize: { xs: 18, md: 22 } }} /> : <DarkModeIcon sx={{ fontSize: { xs: 18, md: 22 } }} />}
              </IconButton>
              <IconButton
                color="inherit"
                onClick={() => navigate("/home/favorites")}
                sx={{ 
                  p: { xs: 0.8, md: 1.2 }, 
                  borderRadius: "10px",
                  background: appTheme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
                  transition: "all 0.3s ease",
                  "&:hover": { 
                    transform: "translateY(-3px)",
                    color: "var(--primary) !important",
                    background: "rgba(230, 81, 0, 0.1) !important"
                  }
                }}
              >
                <Badge 
                  badgeContent={favoritesCount} 
                  sx={{
                    "& .MuiBadge-badge": {
                      backgroundColor: "var(--primary)",
                      color: "white",
                      fontSize: "0.6rem",
                      height: 16,
                      minWidth: 16,
                    }
                  }}
                >
                  <FavoritesIcon sx={{ fontSize: { xs: 18, md: 22 }, color: favoritesCount > 0 ? "var(--primary)" : "inherit" }} />
                </Badge>
              </IconButton>
              <IconButton
                color="inherit"
                component={Link}
                to="/cart"
                sx={{ 
                  p: { xs: 0.8, md: 1.2 }, 
                  borderRadius: "10px",
                  background: appTheme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
                  transition: "all 0.3s ease",
                  "&:hover": { 
                    transform: "translateY(-3px)",
                    color: "var(--primary) !important",
                    background: "rgba(230, 81, 0, 0.1) !important"
                  }
                }}
              >
                <Badge 
                  badgeContent={quantity} 
                  sx={{
                    "& .MuiBadge-badge": {
                      backgroundColor: "var(--primary)",
                      color: "white",
                      fontSize: "0.6rem",
                      height: 16,
                      minWidth: 16,
                    }
                  }}
                >
                  <ShoppingCartIcon sx={{ fontSize: { xs: 18, md: 22 } }} />
                </Badge>
              </IconButton>
              <IconButton
                onClick={handleAccountMenuOpen}
                sx={{ 
                  p: 0.5, 
                  borderRadius: "12px",
                  border: `2px solid ${isAccountMenuOpen ? "var(--primary)" : "transparent"}`,
                  transition: "all 0.3s ease",
                  "&:hover": { 
                    transform: "scale(1.05)",
                    background: "rgba(230, 81, 0, 0.05) !important"
                  }
                }}
              >
                <Avatar
                  src={userAvatar || undefined}
                  sx={{ 
                    width: { xs: 32, md: 38 }, 
                    height: { xs: 32, md: 38 }, 
                    borderRadius: "8px",
                    background: "var(--primary-gradient)",
                    fontSize: "0.9rem",
                  }}
                >
                  {userName ? userName.charAt(0).toUpperCase() : "U"}
                </Avatar>
              </IconButton>
              <Menu
                id="account-menu"
                anchorEl={accountAnchorEl}
                open={isAccountMenuOpen}
                onClose={handleAccountMenuClose}
                onClick={handleAccountMenuClose}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: "visible",
                    filter: "drop-shadow(0px 8px 24px rgba(0,0,0,0.12))",
                    mt: 1.5,
                    borderRadius: "16px",
                    minWidth: 180,
                    padding: "8px",
                    border: "1px solid var(--border-light)",
                    background: "var(--nav-bg)",
                    "& .MuiMenuItem-root": {
                      borderRadius: "10px",
                      margin: "4px 0",
                      padding: "10px 16px",
                      gap: "12px",
                      fontWeight: 600,
                      color: "var(--text-main)",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        background: "var(--primary-gradient)",
                        color: "white",
                        "& .MuiListItemIcon-root": {
                          color: "white"
                        }
                      }
                    }
                  },
                }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              >
                <MenuItem onClick={handleGoToSettings}>
                  <ListItemIcon sx={{ minWidth: "auto", color: "var(--primary)" }}>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  Settings
                </MenuItem>
                <Divider sx={{ my: 0.5, opacity: 0.6 }} />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon sx={{ minWidth: "auto", color: "#f44336" }}>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Toolbar>
        {/* Mobile Search Bar - Centered and refined */}
        <Box 
          sx={{ 
            display: { xs: "flex", md: "none" }, 
            px: 2, 
            pb: 1.5,
            width: "100%",
            justifyContent: "center",
            background: appTheme === "dark" ? "var(--nav-bg)" : "white",
            borderBottom: `1px solid ${appTheme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`
          }}
        >
          <Box sx={{ width: "100%", maxWidth: "400px" }}>
            <SearchBar onSearchChange={handleSectionChange} />
          </Box>
        </Box>
      </AppBar>
      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        {isDesktop ? (
        <Drawer variant="permanent" open={open}>
          <DrawerHeader
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 1,
              background: (theme) => theme.palette.background.paper,
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box
              className="drawer-brand"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                opacity: open ? 1 : 0,
                visibility: open ? "visible" : "hidden",
                transition: "opacity 0.3s ease, visibility 0.3s ease",
                flexGrow: 1,
              }}
            >
              <img
                src="/footer-images/logo.png"
                alt="logo"
                className="website-logo-mini"
                style={{ 
                  width: open ? "2.5rem" : "2rem", 
                  height: open ? "2.5rem" : "2rem",
                  transition: "width 0.3s ease, height 0.3s ease"
                }}
              />
              <div className="drawer-brand-text" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span className="drawer-brand-title">Flavora</span>
                <span className="drawer-brand-subtitle">
                  Fresh & Healthy Food
                </span>
              </div>
            </Box>
          </DrawerHeader>
          <Box
            sx={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <List>
              {Sidebar_Items.filter(
                (i) => i.text !== "Settings" && i.text !== "Logout",
              ).map((item) => (
                <ListItem
                  key={item.text}
                  disablePadding
                  sx={{ display: "block" }}
                >
                  <ListItemButton
                    selected={activeSidebarItem === item.text}
                    onClick={() => {
                      if (item.path) {
                        navigate(item.path);
                      } else {
                        const targetSection = sectionMap[item.text] || "Home";
                        handleSectionChange(targetSection, item.text);
                        // Ensure the URL is updated to the home page if not on a specific path
                        if (location.pathname !== "/home") {
                          navigate("/home");
                        }
                      }
                    }}
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? "initial" : "center",
                      px: 2.5,
                      transition: "background-color 0.2s ease, color 0.2s ease",
                      "&.Mui-selected": {
                        background: "var(--primary-gradient)",
                        color: "white",
                        "& .MuiListItemIcon-root": {
                          color: "white",
                        },
                        "&:hover": {
                          background: "var(--primary-gradient)",
                          opacity: 0.9,
                        },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : "auto",
                        justifyContent: "center",
                        color:
                          activeSidebarItem === item.text ? "white" : "inherit",
                        "& .MuiSvgIcon-root": {
                          fontSize: 24,
                        },
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      sx={{
                        opacity: open ? 1 : 0,
                        transition: "opacity 0.25s ease",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
              {Category_Items.map((item) => (
                <ListItem
                  key={item.text}
                  disablePadding
                  sx={{ display: "block" }}
                >
                  <ListItemButton
                    selected={activeSidebarItem === item.text}
                    onClick={() => {
                      const targetSection = sectionMap[item.text] || "Home";
                      handleSectionChange(targetSection, item.text);
                      // Ensure the URL is updated to the home page if not on a specific path
                      if (location.pathname !== "/home") {
                        navigate("/home");
                      }
                    }}
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? "initial" : "center",
                      px: 2.5,
                      transition: "background-color 0.2s ease, color 0.2s ease",
                      "&.Mui-selected": {
                        background: "var(--primary-gradient)",
                        color: "white",
                        "& .MuiListItemIcon-root": {
                          color: "white",
                        },
                        "&:hover": {
                          background: "var(--primary-gradient)",
                          opacity: 0.9,
                        },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : "auto",
                        justifyContent: "center",
                        color:
                          activeSidebarItem === item.text ? "white" : "inherit",
                        "& .MuiSvgIcon-root": {
                          fontSize: 24,
                        },
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      sx={{
                        opacity: open ? 1 : 0,
                        transition: "opacity 0.25s ease",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            <Box sx={{ flexGrow: 1 }} />
            <List>
              {Sidebar_Items.filter(
                (i) => i.text === "Settings" || i.text === "Logout",
              ).map((item) => (
                <ListItem
                  key={item.text}
                  disablePadding
                  sx={{ display: "block" }}
                >
                  <ListItemButton
                    selected={activeSidebarItem === item.text}
                    onClick={() => {
                      if (item.action === "logout") {
                        handleLogout();
                      } else {
                        const targetSection = sectionMap[item.text] || "Home";
                        handleSectionChange(targetSection, item.text);
                      }
                    }}
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? "initial" : "center",
                      px: 2.5,
                      transition: "background-color 0.2s ease, color 0.2s ease",
                      "&.Mui-selected": {
                        background: "var(--primary-gradient)",
                        color: "white",
                        "& .MuiListItemIcon-root": {
                          color: "white",
                        },
                        "&:hover": {
                          background: "var(--primary-gradient)",
                          opacity: 0.9,
                        },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : "auto",
                        justifyContent: "center",
                        color:
                          activeSidebarItem === item.text ? "white" : "inherit",
                        "& .MuiSvgIcon-root": {
                          fontSize: 24,
                        },
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      sx={{ opacity: open ? 1 : 0 }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
      ) : (
        <MuiDrawer
          variant="temporary"
          open={open}
          onClose={handleDrawerClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              background: appTheme === "dark" ? "var(--nav-bg)" : "white",
              borderRight: "none",
              boxShadow: "10px 0 30px rgba(0,0,0,0.1)",
            },
          }}
        >
          <DrawerHeader sx={{ borderBottom: `1px solid ${appTheme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}` }}>
            <Box
              className="drawer-brand"
              sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
            >
              <img
                src="/footer-images/logo.png"
                alt="logo"
                className="website-logo-mini"
                style={{ width: "1.5rem", height: "1.5rem" }}
              />
              <div className="drawer-brand-text">
                <span className="drawer-brand-title" style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--primary)" }}>Flavora</span>
                <span className="drawer-brand-subtitle" style={{ fontSize: "0.6rem", color: "var(--text-sub)" }}>
                  Fresh & Healthy Food
                </span>
              </div>
            </Box>
            <IconButton onClick={handleDrawerClose} sx={{ color: "var(--text-main)" }}>
              {theme.direction === "rtl" ? (
                <ChevronRightIcon />
              ) : (
                <ChevronLeftIcon />
              )}
            </IconButton>
          </DrawerHeader>
          <Box
            sx={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}
          >
            <List sx={{ px: 1.5, py: 2 }}>
              {Category_Items.map((item) => (
                <ListItem
                  key={item.text}
                  disablePadding
                  sx={{ mb: 0.5 }}
                >
                  <ListItemButton
                    selected={activeSidebarItem === item.text}
                    onClick={() => {
                      const targetSection = sectionMap[item.text] || "Home";
                      handleSectionChange(targetSection, item.text);
                      handleDrawerClose();
                    }}
                    sx={{
                      minHeight: 48,
                      borderRadius: "12px",
                      px: 2,
                      "&.Mui-selected": {
                        background: "var(--primary-gradient)",
                        color: "white",
                        "& .MuiListItemIcon-root": {
                          color: "white",
                        },
                        "&:hover": {
                          background: "var(--primary-gradient)",
                          opacity: 0.9,
                        },
                      },
                      "&:hover": {
                        background: appTheme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                      }
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: 2,
                        color: activeSidebarItem === item.text ? "white" : "var(--primary)",
                        "& .MuiSvgIcon-root": {
                          fontSize: 22,
                        },
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{ 
                        fontSize: "0.9rem", 
                        fontWeight: activeSidebarItem === item.text ? 700 : 500,
                        color: activeSidebarItem === item.text ? "white" : "var(--text-main)"
                      }} 
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            <Box sx={{ flexGrow: 1 }} />
            <Divider sx={{ mx: 2, opacity: 0.1 }} />
            <List sx={{ px: 1.5, py: 2 }}>
              {Sidebar_Items.map((item) => (
                <ListItem
                  key={item.text}
                  disablePadding
                  sx={{ mb: 0.5 }}
                >
                  <ListItemButton
                    selected={activeSidebarItem === item.text}
                    onClick={() => {
                      if (item.action === "logout") {
                        handleLogout();
                      } else {
                        const targetSection = sectionMap[item.text] || "Home";
                        handleSectionChange(targetSection, item.text);
                        handleDrawerClose();
                        if (item.text === "Settings") {
                          navigate("/home/settings");
                        }
                      }
                    }}
                    sx={{
                      minHeight: 48,
                      borderRadius: "12px",
                      px: 2,
                      "&.Mui-selected": {
                        background: "var(--primary-gradient)",
                        color: "white",
                        "& .MuiListItemIcon-root": {
                          color: "white",
                        },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: 2,
                        color: item.text === "Logout" ? "#f44336" : (activeSidebarItem === item.text ? "white" : "var(--primary)"),
                        "& .MuiSvgIcon-root": {
                          fontSize: 22,
                        },
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{ 
                        fontSize: "0.9rem", 
                        fontWeight: activeSidebarItem === item.text ? 700 : 500,
                        color: item.text === "Logout" ? "#f44336" : (activeSidebarItem === item.text ? "white" : "var(--text-main)")
                      }} 
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </MuiDrawer>
      )}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          maxWidth: "1440px",
          margin: "0 auto",
          overflowY: "auto",
          height: "100%",
        }}
      >
        {location.pathname === "/home/favorites" ? (
          <Favorites />
        ) : location.pathname === "/home/orders" ? (
          <Orders />
        ) : location.pathname === "/home/settings" ? (
          <Settings />
        ) : (
          <Bodycontent
            open={open}
            currentSection={currentSection}
            activeCategory={activeCategory}
            onSectionChange={handleSectionChange}
          />
        )}
      </Box>
      </Box>

      <PopupAlert
        visible={showLogoutModal}
        text={logoutMessage}
        onClose={() => setShowLogoutModal(false)}
        type="loading"
      />
    </Box>
  );
}
