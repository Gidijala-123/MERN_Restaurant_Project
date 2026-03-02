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
} from "@mui/material";

// Material Icons
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
  Settings as SettingsIcon,
  Home as HomeIcon,
  Apple as AppleIcon,
  Grass as VeggieIcon,
  LocalDrink as DrinkIcon,
  BakeryDining as BakeryIcon,
  Egg as EggIcon,
  WaterDrop as MilkIcon,
  KebabDining as MeatIcon,
  SetMeal as FishIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";

import {
  Modal,
  Fade,
  Backdrop,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Avatar,
  Card,
  CardContent,
  Chip,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";

import "./Sidebar.css";
import React, { useState, useEffect } from "react";
import { Sidebar_Content } from "../../../APIs/Sidebar";
import Bodycontent from "../Bodycontent/Bodycontent";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useTheme as useAppTheme } from "../../../context/ThemeContext";

// carttttt
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import SearchBar from "../Bodycontent/SEARCH_COMPONENT/SearchBar";
import { addToCart } from "../../features/cartSlice";
import { useGetAllProductsQuery } from "../../features/productsApi";

const drawerWidth = 240;

const Sidebar_Items = [
  { text: "Hot Offers", icon: <HomeIcon /> },
  { text: "Settings", icon: <SettingsIcon /> },
  { text: "Logout", icon: <LogoutIcon />, action: "logout" },
];

const Category_Items = [
  { text: "Fruits", icon: <AppleIcon /> },
  { text: "Vegetables", icon: <VeggieIcon /> },
  { text: "Drinks", icon: <DrinkIcon /> },
  { text: "Bakery", icon: <BakeryIcon /> },
  { text: "Buffer & Eggs", icon: <EggIcon /> },
  { text: "Milk & Creams", icon: <MilkIcon /> },
  { text: "Meats", icon: <MeatIcon /> },
  { text: "Fish", icon: <FishIcon /> },
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
  const [currentSection, setCurrentSection] = useState("Home");
  const [activeSidebarItem, setActiveSidebarItem] = useState("Hot Offers");
  const [activeCategory, setActiveCategory] = useState("Hot Offers");
  const [userName, setUserName] = useState("");
  const [logoutMessage, setLogoutMessage] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    address: "",
    foodType: "veg",
  });

  const { theme: appTheme, toggleTheme } = useAppTheme();

  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    if (storedUserName) {
      setUserName(storedUserName);
    }
    const storedAddress = localStorage.getItem("userAddress") || "";
    const storedFoodType = localStorage.getItem("userFoodType") || "veg";
    setProfileForm((p) => ({
      ...p,
      name: storedUserName || "",
      address: storedAddress,
      foodType: storedFoodType,
    }));
  }, []);

  const handleLogout = () => {
    const name = userName || "back";
    setLogoutMessage(`Thank you ${name}, please visit again. See you soon!`);
    setShowLogoutModal(true);

    setTimeout(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("userName");
      window.location.href = "/";
    }, 3000);
  };

  const openProfile = () => {
    setShowProfileModal(true);
  };
  const closeProfile = () => setShowProfileModal(false);
  const saveProfile = () => {
    const { name, address, foodType } = profileForm;
    if (name) {
      localStorage.setItem("userName", name);
      setUserName(name);
    }
    localStorage.setItem("userAddress", address || "");
    localStorage.setItem("userFoodType", foodType || "veg");
    setShowProfileModal(false);
  };
  const updateField = (field) => (e) =>
    setProfileForm((p) => ({ ...p, [field]: e.target.value }));

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const menuStyle = {
    color: appTheme === "dark" ? "white" : "inherit",
  };

  const handleSectionChange = (section, sidebarItem = null) => {
    setCurrentSection(section);
    if (sidebarItem) {
      setActiveSidebarItem(sidebarItem);
      setActiveCategory(sidebarItem);
    }
  };

  // Map sidebar items to Bodycontent sections
  const sectionMap = {
    "Hot Offers": "Home",
    Fruits: "FreshFood",
    Vegetables: "FreshFood",
    Drinks: "Drinks",
    Bakery: "Bakery",
    "Buffer & Eggs": "FreshFood",
    "Milk & Creams": "FreshFood",
    Meats: "FreshFood",
    Fish: "FreshFood",
  };

  // cartttttt
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);
  const quantity = cartItems.reduce((total, cartItem) => {
    return total + cartItem.cartQuantity;
  }, 0);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const { data } = useGetAllProductsQuery();

  const computeFavorites = () => {
    const trendingBookmarked = JSON.parse(
      localStorage.getItem("trendingBookmarked") || "{}"
    );
    const discountBookmarked = JSON.parse(
      localStorage.getItem("discountBookmarked") || "{}"
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
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar
          sx={{ minHeight: 72, height: 72, px: 2, boxSizing: "border-box" }}
        >
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: "none" }),
            }}
          >
            <MenuIcon />
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
              <IconButton color="inherit" onClick={toggleTheme}>
                {appTheme === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
              <IconButton
                color="inherit"
                onClick={() => setShowFavoritesModal(true)}
              >
                <FavoritesIcon />
              </IconButton>
              <IconButton
                size="large"
                color="inherit"
                component={Link}
                to="/cart"
                sx={{ p: { xs: 1, sm: 1.5 } }}
              >
                <Badge badgeContent={quantity} color="error">
                  <ShoppingCartIcon fontSize="small" />
                </Badge>
              </IconButton>
              <img
                src="/footer-images/user-icon.png"
                alt="user"
                className="user-avatar"
                onClick={openProfile}
              />
            </Box>
          </Box>
        </Toolbar>
        {/* Mobile Search Bar - Visible only on mobile below the main toolbar if needed, or we can just hide it on tiny screens */}
        <Box sx={{ display: { xs: "block", md: "none" }, px: 2, pb: 1 }}>
          <SearchBar onSearchChange={handleSectionChange} />
        </Box>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
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
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <List>
            {Sidebar_Items.filter(
              (i) => i.text !== "Settings" && i.text !== "Logout"
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
                    sx={{ opacity: open ? 1 : 0 }}
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
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Box sx={{ flexGrow: 1 }} />
          <List>
            {Sidebar_Items.filter(
              (i) => i.text === "Settings" || i.text === "Logout"
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
        <Bodycontent
          open={open}
          currentSection={currentSection}
          activeCategory={activeCategory}
          onSectionChange={handleSectionChange}
        />
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
            <Box sx={{ mt: 3 }}>
              <img
                src="/footer-images/logo.png"
                alt="logo"
                className="fa-spin"
                style={{ width: "50px" }}
              />
            </Box>
          </Box>
        </Fade>
      </Modal>

      {/* Profile Update Dialog */}
      <Dialog
        open={showProfileModal}
        onClose={closeProfile}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 800, color: "var(--primary)" }}>
          Your Profile
        </DialogTitle>
        <DialogContent dividers>
          <Card className="profile-card">
            <Box
              className="profile-card-header"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 2,
              }}
            >
              <Avatar className="profile-avatar">
                {(profileForm.name || "U").charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 800, color: "var(--text-main)" }}>
                  {profileForm.name || "Your Name"}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mt: 0.5,
                  }}
                >
                  <Chip
                    label={profileForm.foodType === "veg" ? "Veg" : "Non-veg"}
                    size="small"
                    sx={{
                      background: "var(--bg-light)",
                      border: "1px solid var(--border-light)",
                      color: "var(--text-sub)",
                    }}
                  />
                </Box>
              </Box>
            </Box>
            <CardContent sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Full Name"
                    value={profileForm.name}
                    onChange={updateField("name")}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Address"
                    value={profileForm.address}
                    onChange={updateField("address")}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <ToggleButtonGroup
                    value={profileForm.foodType}
                    exclusive
                    onChange={(e, v) => {
                      if (v) {
                        setProfileForm((p) => ({ ...p, foodType: v }));
                      }
                    }}
                    sx={{ width: "100%" }}
                  >
                    <ToggleButton
                      value="veg"
                      sx={{
                        flex: 1,
                        textTransform: "none",
                        borderRadius: "10px",
                        border: "1px solid var(--border-light)",
                        "&.Mui-selected": {
                          background: "var(--primary-gradient)",
                          color: "#fff",
                        },
                      }}
                    >
                      Veg
                    </ToggleButton>
                    <ToggleButton
                      value="nonveg"
                      sx={{
                        flex: 1,
                        textTransform: "none",
                        borderRadius: "10px",
                        border: "1px solid var(--border-light)",
                        "&.Mui-selected": {
                          background: "var(--primary-gradient)",
                          color: "#fff",
                        },
                      }}
                    >
                      Non-veg
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeProfile} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={saveProfile}
            sx={{
              background: "var(--primary-gradient)",
              borderRadius: "10px",
              px: 3,
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Favorites Popup */}
      <Dialog
        open={showFavoritesModal}
        onClose={() => setShowFavoritesModal(false)}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            color: "var(--primary)",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <FavoritesIcon fontSize="small" />
          My Favorites
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2 }}>
          <Box className="favorites-grid">
            {computeFavorites().length > 0 ? (
              computeFavorites().map((item) => (
                <div className="trending-items-sub-div" key={item.id}>
                  <img src={item.img} alt={item.title} />
                  <p className="trending-items-title">{item.title}</p>
                  <div className="trending-card-details-wrapper">
                    <div className="trending-rating">
                      <span>⭐ {item.rating}</span>
                      <span className="reviews-text">
                        ({item.reviews} reviews)
                      </span>
                    </div>
                    <div className="trending-items-btn">
                      <b>₹{item.price}</b>
                      <button
                        onClick={() => dispatch(addToCart(item))}
                        className="trending-items-button"
                      >
                        + ADD
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <Box sx={{ width: "100%", textAlign: "center", py: 4 }}>
                <i
                  className="far fa-heart"
                  style={{
                    fontSize: "48px",
                    color: "var(--text-sub)",
                    marginBottom: "20px",
                  }}
                />
                <Typography>No favorites yet!</Typography>
                <Typography variant="body2" color="text.secondary">
                  Items you like will appear here.
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFavoritesModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
