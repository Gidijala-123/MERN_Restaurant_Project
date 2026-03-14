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
import { Sidebar_Content } from "../../../APIs/Sidebar";
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
  boxSizing: "border-box",
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
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
  const { data } = useGetAllProductsQuery();

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
    }, 2000);
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
    const trendingBookmarked = JSON.parse(
      localStorage.getItem("trendingBookmarked") || "{}",
    );
    const discountBookmarked = JSON.parse(
      localStorage.getItem("discountBookmarked") || "{}",
    );
    const favorites = [];
    // Trending from API data
    data?.forEach((product) => {
      if (trendingBookmarked[product.id]) {
        favorites.push({ ...product, section: "trending" });
      }
    });
    // Discount static items
    const discountItems = [
      {
        id: 101,
        title: "Cheesy Pepperoni Pizza",
        oldPrice: 499,
        newPrice: 299,
        discount: "40% OFF",
        img: "/footer-images/original-bd99e6afd7177b69f8bdf6bfe7fd0643.jpg",
        desc: "Extra cheese & crispy crust",
        rating: 4.8,
        reviews: 120,
      },
      {
        id: 102,
        title: "Crispy Chicken Burger",
        oldPrice: 250,
        newPrice: 149,
        discount: "40% OFF",
        img: "/footer-images/burger.png",
        desc: "Spicy mayo & fresh lettuce",
        rating: 4.5,
        reviews: 85,
      },
      {
        id: 103,
        title: "Garden Fresh Salad",
        oldPrice: 180,
        newPrice: 99,
        discount: "45% OFF",
        img: "/footer-images/salads.jpg",
        desc: "Organic veggies & olive oil",
        rating: 4.7,
        reviews: 60,
      },
      {
        id: 104,
        title: "Choco Lava Cake",
        oldPrice: 150,
        newPrice: 75,
        discount: "50% OFF",
        img: "/footer-images/desserts.jpg",
        desc: "Melting hot chocolate center",
        rating: 4.9,
        reviews: 210,
      },
      {
        id: 105,
        title: "Fresh Fruit Mojito",
        oldPrice: 120,
        newPrice: 59,
        discount: "50% OFF",
        img: "/footer-images/cooldrinks.png",
        desc: "Refreshing mint & lime",
        rating: 4.6,
        reviews: 45,
      },
    ];
    discountItems.forEach((item) => {
      if (discountBookmarked[item.id]) {
        favorites.push({ ...item, price: item.newPrice, section: "discount" });
      }
    });
    return favorites;
  }, [data]);

  useEffect(() => {
    const updateFavoritesCount = () => {
      setFavoritesCount(computeFavorites().length);
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
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar
          sx={{ minHeight: 72, height: 72, px: 2, boxSizing: "border-box" }}
        >
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{
              marginRight: { xs: 2, md: 5 },
              p: 1.2, 
              borderRadius: "12px",
              background: appTheme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
              transition: "all 0.3s ease",
              "&:hover": {
                background: "var(--primary-gradient)",
                color: "white",
                transform: "scale(1.1)",
                boxShadow: "0 4px 12px rgba(230, 81, 0, 0.3)"
              },
              zIndex: 1300 /* Ensure it stays on top */
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
              height: 72,
              px: 0,
              boxSizing: "border-box",
            }}
          >
            {/* Branding - Only visible if sidebar is closed */}
            {!open && (
              <Box
                className="brand-area"
                sx={{
                  flex: { xs: "0 0 180px", md: "0 0 220px" },
                  minWidth: 0,
                  opacity: 1,
                  transition: "opacity 0.3s ease",
                }}
              >
                <img
                  src="/footer-images/logo.png"
                  alt="logo"
                  className="website-logo"
                />
                <div className="brand-text">
                  <span className="title">Tasty Kitchen</span>
                  <span className="subtitle">Fresh & Healthy Food</span>
                </div>
              </Box>
            )}
            {!open && <span className="divider-v" />}
            {/* Greeting */}
            <Box
              className="greeting-area"
              sx={{
                flex: "0 0 160px",
                minWidth: 0,
                display: { xs: "none", md: "flex" },
              }}
            >
              <span className="secondary">
                {(() => {
                  const hrs = new Date().getHours();
                  const period =
                    hrs < 12 ? "Morning" : hrs < 18 ? "Afternoon" : "Evening";
                  const name = userName || "Hemmy";
                  return `${period} ${name}`;
                })()}
              </span>
              <span className="primary">Welcome Back!</span>
            </Box>
            {/* Search */}
            <Box className="search-area" sx={{ flex: "1 1 auto", minWidth: 0 }}>
              <div className="search-main-div" style={{ width: "100%" }}>
                <SearchBar onSearchChange={handleSectionChange} />
              </div>
            </Box>
            {/* Actions */}
            <Box
              className="actions-area"
              sx={{
                flex: { xs: "0 0 200px", md: "0 0 280px" },
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: { xs: 1, md: 1.5 },
                whiteSpace: "nowrap",
              }}
            >
              <IconButton 
                color="inherit" 
                onClick={toggleTheme}
                sx={{ 
                  p: 1.2, 
                  borderRadius: "12px",
                  background: appTheme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "var(--primary-gradient)",
                    color: "white",
                    transform: "rotate(15deg) scale(1.1)",
                    boxShadow: "0 4px 12px rgba(230, 81, 0, 0.3)"
                  }
                }}
              >
                {appTheme === "dark" ? <LightModeIcon sx={{ fontSize: 22 }} /> : <DarkModeIcon sx={{ fontSize: 22 }} />}
              </IconButton>
              <IconButton
                color="inherit"
                onClick={() => navigate("/home/favorites")}
                sx={{ 
                  p: 1.2, 
                  borderRadius: "12px",
                  background: appTheme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "var(--primary-gradient)",
                    color: "white",
                    transform: "scale(1.1)",
                    boxShadow: "0 4px 12px rgba(230, 81, 0, 0.3)"
                  }
                }}
              >
                <Badge 
                  badgeContent={favoritesCount} 
                  sx={{
                    "& .MuiBadge-badge": {
                      backgroundColor: "var(--primary)",
                      color: "white",
                      fontWeight: 700,
                      border: `2px solid var(--nav-bg)`,
                      fontSize: "0.65rem",
                      height: 18,
                      minWidth: 18,
                      padding: "0 4px"
                    }
                  }}
                >
                  <FavoritesIcon sx={{ fontSize: 22 }} />
                </Badge>
              </IconButton>
              <IconButton
                size="large"
                color="inherit"
                component={Link}
                to="/cart"
                sx={{ 
                  p: 1.2, 
                  borderRadius: "12px",
                  background: appTheme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "var(--primary-gradient)",
                    color: "white",
                    transform: "scale(1.1)",
                    boxShadow: "0 4px 12px rgba(230, 81, 0, 0.3)"
                  }
                }}
              >
                <Badge 
                  badgeContent={quantity} 
                  sx={{
                    "& .MuiBadge-badge": {
                      backgroundColor: "var(--primary)",
                      color: "white",
                      fontWeight: 700,
                      border: `2px solid var(--nav-bg)`,
                      fontSize: "0.65rem",
                      height: 18,
                      minWidth: 18,
                      padding: "0 4px"
                    }
                  }}
                >
                  <ShoppingCartIcon sx={{ fontSize: 22 }} />
                </Badge>
              </IconButton>
              <IconButton
                onClick={handleAccountMenuOpen}
                sx={{ 
                  p: 0.5, 
                  borderRadius: "14px",
                  border: `2px solid ${isAccountMenuOpen ? "var(--primary)" : "transparent"}`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    borderColor: "var(--primary)",
                    transform: "scale(1.05)"
                  }
                }}
                aria-controls={isAccountMenuOpen ? "account-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={isAccountMenuOpen ? "true" : undefined}
              >
                <Avatar
                  src={userAvatar || undefined}
                  sx={{ 
                    width: 38, 
                    height: 38, 
                    borderRadius: "10px",
                    background: "var(--primary-gradient)",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
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
        {/* Mobile Search Bar - Visible only on mobile below the main toolbar if needed, or we can just hide it on tiny screens */}
        {/* Mobile Search Bar - Visible only on mobile below the main toolbar if needed, or we can just hide it on tiny screens */}
        <Box sx={{ display: { xs: "block", md: "none" }, px: 2, pb: 1 }}>
          <SearchBar onSearchChange={handleSectionChange} />
        </Box>
      </AppBar>
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
              />
              <div className="drawer-brand-text">
                <span className="drawer-brand-title">Tasty Kitchen</span>
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
                      const targetSection = sectionMap[item.text] || "Home";
                      handleSectionChange(targetSection, item.text);
                    }}
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? "initial" : "center",
                      px: 2.5,
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
                    }}
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? "initial" : "center",
                      px: 2.5,
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
            },
          }}
        >
          <DrawerHeader>
            <Box
              className="drawer-brand"
              sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
            >
              <img
                src="/footer-images/logo.png"
                alt="logo"
                className="website-logo-mini"
              />
              <div className="drawer-brand-text">
                <span className="drawer-brand-title">Tasty Kitchen</span>
                <span className="drawer-brand-subtitle">
                  Fresh & Healthy Food
                </span>
              </div>
            </Box>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === "rtl" ? (
                <ChevronRightIcon />
              ) : (
                <ChevronLeftIcon />
              )}
            </IconButton>
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
                      const targetSection = sectionMap[item.text] || "Home";
                      handleSectionChange(targetSection, item.text);
                      handleDrawerClose();
                    }}
                    sx={{ minHeight: 48, justifyContent: "initial", px: 2.5 }}
                  >
                    <ListItemIcon
                      sx={{ minWidth: 0, mr: 3, justifyContent: "center" }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
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
        }}
      >
        <DrawerHeader />
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

      {/* Logout Modal */}
      <Modal
        aria-labelledby="logout-modal-title"
        aria-describedby="logout-modal-description"
        open={showLogoutModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          sx: { backgroundColor: "rgba(0, 0, 0, 0.8)" },
        }}
      >
        <Fade in={showLogoutModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "var(--white)",
              borderRadius: "20px",
              boxShadow: 24,
              p: 4,
              textAlign: "center",
              border: "2px solid var(--primary)",
            }}
          >
            <Typography
              id="logout-modal-title"
              variant="h5"
              component="h2"
              sx={{
                fontWeight: 800,
                color: "var(--primary)",
                mb: 2,
              }}
            >
              Logging Out...
            </Typography>
            <Typography
              id="logout-modal-description"
              sx={{
                mt: 2,
                fontSize: "1.2rem",
                color: "var(--text-main)",
                fontWeight: 600,
              }}
            >
              {logoutMessage}
            </Typography>
            <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
              <CircularProgress size={40} />
            </Box>
          </Box>
        </Fade>
      </Modal>




    </Box>
  );
}
