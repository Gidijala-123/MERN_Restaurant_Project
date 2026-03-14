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
  InputAdornment,
  MenuItem,
  LinearProgress,
  IconButton as MuiIconButton,
  Divider,
} from "@mui/material";

import "./Sidebar.css";
import React, { useState, useEffect } from "react";
import { useMediaQuery } from "@mui/material";
import { toast } from "react-toastify";
import { Sidebar_Content } from "../../../APIs/Sidebar";
import Bodycontent from "../Bodycontent/Bodycontent";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useTheme as useAppTheme } from "../../../context/ThemeContext";
import { useMenu } from "../../../context/MenuContext";

// carttttt
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import SearchBar from "../Bodycontent/SEARCH_COMPONENT/SearchBar";
import { addToCart } from "../../features/cartSlice";
import { useGetAllProductsQuery } from "../../features/productsApi";

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
  const [logoutMessage, setLogoutMessage] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    deliveryInstructions: "",
    paymentMethod: "Cash",
    foodType: "veg",
    avatar: "",
    deliverySpeed: "Standard",
    savedAddresses: [],
    dietaryRestrictions: [],
    referralCode: "",
  });
  const [avatarSizeKB, setAvatarSizeKB] = useState(0);
  const [newAddress, setNewAddress] = useState("");
  const [formErrors, setFormErrors] = useState({});

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
    const storedEmail = localStorage.getItem("userEmail") || "";
    const storedPhone = localStorage.getItem("userPhone") || "";
    const storedAddress = localStorage.getItem("userAddress") || "";
    const storedInstructions = localStorage.getItem("userDeliveryInstructions") || "";
    const storedPayment = localStorage.getItem("userPaymentMethod") || "Cash";
    const storedFoodType = localStorage.getItem("userFoodType") || "veg";
    const storedSpeed = localStorage.getItem("userDeliverySpeed") || "Standard";
    const storedAddresses = JSON.parse(localStorage.getItem("userSavedAddresses") || "[]");
    const storedDietary = JSON.parse(
      localStorage.getItem("userDietaryRestrictions") || "[]"
    );
    const storedReferral = localStorage.getItem("userReferralCode") || "";

    setProfileForm((p) => ({
      ...p,
      name: storedUserName || "",
      email: storedEmail,
      phone: storedPhone,
      address: storedAddress,
      deliveryInstructions: storedInstructions,
      paymentMethod: storedPayment,
      foodType: storedFoodType,
      avatar: storedAvatar,
      deliverySpeed: storedSpeed,
      savedAddresses: storedAddresses,
      dietaryRestrictions: storedDietary,
      referralCode: storedReferral,
    }));
  }, []);

  useEffect(() => {
    if (!profileForm.avatar) {
      setAvatarSizeKB(0);
      return;
    }

    // Estimate base64 size in bytes
    const base64String = profileForm.avatar.split(",")[1] || "";
    const sizeInBytes = (base64String.length * 3) / 4 - (base64String.endsWith("==") ? 2 : base64String.endsWith("=") ? 1 : 0);
    setAvatarSizeKB(Math.round(sizeInBytes / 1024));
  }, [profileForm.avatar]);

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
            setProfileForm((p) => ({ ...p, name: me.uname }));
          }
          if (me?.avatar) {
            localStorage.setItem("userAvatar", me.avatar);
            setProfileForm((p) => ({ ...p, avatar: me.avatar }));
          }
        }
      } catch {}
    };
    load();
  }, []);

  const handleLogout = async () => {
    const name = userName || "back";
    setLogoutMessage(`Thank you ${name}, please visit again. See you soon!`);
    setShowLogoutModal(true);

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
  };

  const openProfile = () => {
    setShowProfileModal(true);
  };
  const closeProfile = () => setShowProfileModal(false);
  const addSavedAddress = () => {
    if (newAddress.trim()) {
      const updatedAddresses = [
        ...profileForm.savedAddresses,
        { id: Date.now(), text: newAddress.trim() },
      ];
      setProfileForm((p) => ({ ...p, savedAddresses: updatedAddresses }));
      setNewAddress("");
      toast.info("Address added to saved list", { position: "bottom-left" });
    }
  };

  const removeSavedAddress = (id) => {
    const updatedAddresses = profileForm.savedAddresses.filter(
      (addr) => addr.id !== id
    );
    setProfileForm((p) => ({ ...p, savedAddresses: updatedAddresses }));
    toast.info("Address removed", { position: "bottom-left" });
  };

  const getProfileCompletion = () => {
    const fields = [
      profileForm.name,
      profileForm.email,
      profileForm.phone,
      profileForm.address,
      profileForm.paymentMethod,
      profileForm.foodType,
      profileForm.avatar,
    ];
    const filledFields = fields.filter((field) => field && field !== "").length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const saveProfile = () => {
    const {
      name,
      email,
      phone,
      address,
      deliveryInstructions,
      paymentMethod,
      foodType,
      avatar,
      deliverySpeed,
      savedAddresses,
    } = profileForm;

    if (name) {
      localStorage.setItem("userName", name);
      setUserName(name);
    }
    localStorage.setItem("userEmail", email || "");
    localStorage.setItem("userPhone", phone || "");
    localStorage.setItem("userAddress", address || "");
    localStorage.setItem("userDeliveryInstructions", deliveryInstructions || "");
    localStorage.setItem("userPaymentMethod", paymentMethod || "Cash");
    localStorage.setItem("userFoodType", foodType || "veg");
    localStorage.setItem("userDeliverySpeed", deliverySpeed || "Standard");
    localStorage.setItem("userSavedAddresses", JSON.stringify(savedAddresses));

    if (avatar) {
      localStorage.setItem("userAvatar", avatar);
    } else {
      localStorage.removeItem("userAvatar");
    }

    toast.success("Profile updated successfully", { position: "bottom-left" });
    setShowProfileModal(false);
  };
  const updateField = (field) => (e) =>
    setProfileForm((p) => ({ ...p, [field]: e.target.value }));

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Resize & compress image before storing (keeps localStorage small)
    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.onload = () => {
        const maxSize = 512;
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Compress to JPEG (most browsers support) with reasonable quality
        const compressed = canvas.toDataURL("image/jpeg", 0.75);
        setProfileForm((p) => ({ ...p, avatar: compressed }));
      };
      img.onerror = () => {
        // Fallback: store original if resize fails
        setProfileForm((p) => ({ ...p, avatar: reader.result }));
      };
      img.src = reader.result;
    };

    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setProfileForm((p) => ({ ...p, avatar: "" }));
    localStorage.removeItem("userAvatar");
    toast.info("Profile photo removed", { position: "bottom-left" });
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ""));
  };

  const validateProfileForm = () => {
    const errors = {};
    if (!profileForm.name.trim()) errors.name = "Name is required";
    if (profileForm.email && !validateEmail(profileForm.email))
      errors.email = "Invalid email format";
    if (profileForm.phone && !validatePhone(profileForm.phone))
      errors.phone = "Phone number must be 10 digits";
    if (!profileForm.address.trim()) errors.address = "Address is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const toggleDietaryRestriction = (restriction) => {
    setProfileForm((p) => {
      const current = p.dietaryRestrictions;
      if (current.includes(restriction)) {
        return {
          ...p,
          dietaryRestrictions: current.filter((r) => r !== restriction),
        };
      } else {
        return { ...p, dietaryRestrictions: [...current, restriction] };
      }
    });
  };

  const validateAndSaveProfile = () => {
    if (!validateProfileForm()) {
      toast.error("Please fix the errors in your profile", {
        position: "bottom-left",
      });
      return;
    }
    saveProfile();
  };

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
      // Update MenuContext with the selected category
      handleCategoryChange(sidebarItem);
    }
  };

  // Map sidebar items to Bodycontent sections
  const sectionMap = {
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
  };

  // cartttttt
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);
  const quantity = cartItems.reduce((total, cartItem) => {
    return total + cartItem.cartQuantity;
  }, 0);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);

  const computeFavorites = () => {
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
  };

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
  }, [data]);

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
                <Badge badgeContent={favoritesCount} color="error">
                  <FavoritesIcon />
                </Badge>
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
                src={profileForm.avatar || "/footer-images/user-icon.png"}
                alt="user"
                className="user-avatar"
                onClick={openProfile}
              />
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
            <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
              <CircularProgress size={40} />
            </Box>
          </Box>
        </Fade>
      </Modal>

      {/* Profile Update Dialog */}
      <Dialog
        open={showProfileModal}
        onClose={closeProfile}
        fullWidth
        maxWidth="md"
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
              <Box
                sx={{
                  position: "relative",
                  width: 72,
                  height: 72,
                }}
              >
                <Avatar
                  className="profile-avatar"
                  src={profileForm.avatar || undefined}
                  sx={{
                    width: 72,
                    height: 72,
                    fontSize: 32,
                    bgcolor: "var(--primary)",
                  }}
                >
                  {(profileForm.name || "U").charAt(0).toUpperCase()}
                </Avatar>
                <label
                  htmlFor="profile-avatar-upload"
                  style={{
                    position: "absolute",
                    bottom: -4,
                    right: -4,
                    background: "var(--primary-gradient)",
                    borderRadius: "50%",
                    width: 32,
                    height: 32,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
                  }}
                  title="Change photo"
                >
                  <input
                    id="profile-avatar-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleAvatarUpload}
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                  </svg>
                </label>
                {profileForm.avatar && (
                  <button
                    type="button"
                    className="avatar-remove-btn"
                    onClick={removeAvatar}
                    title="Remove photo"
                  >
                    ✕
                  </button>
                )}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 800, color: "var(--text-main)" }}>
                  {profileForm.name || "Your Name"}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    mt: 0.75,
                    color: "var(--text-sub)",
                    fontSize: "0.85rem",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      minWidth: 0,
                    }}
                  >
                    <EmailIcon fontSize="small" />
                    <Typography
                      sx={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {profileForm.email || "your@email.com"}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      minWidth: 0,
                    }}
                  >
                    <PhoneIcon fontSize="small" />
                    <Typography
                      sx={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {profileForm.phone || "+91 12345 67890"}
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mt: 1.25,
                    flexWrap: "wrap",
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
                  <Chip
                    icon={<CreditCardIcon sx={{ fontSize: 16 }} />}
                    label={profileForm.paymentMethod || "Cash"}
                    size="small"
                    sx={{
                      background: "var(--bg-light)",
                      border: "1px solid var(--border-light)",
                      color: "var(--text-sub)",
                    }}
                  />
                  {avatarSizeKB > 0 && (
                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        color: "var(--text-sub)",
                        ml: 1,
                      }}
                    >
                      {avatarSizeKB} KB
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
            <CardContent sx={{ p: 2 }}>
              {/* Profile Completion Progress */}
              <Box sx={{ mb: 2.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: "var(--text-main)",
                    }}
                  >
                    Profile Completion
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--primary)",
                    }}
                  >
                    {getProfileCompletion()}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={getProfileCompletion()}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    background: "var(--bg-light)",
                    "& .MuiLinearProgress-bar": {
                      background: "var(--primary-gradient)",
                      borderRadius: 4,
                    },
                  }}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Basic Information */}
              <Typography
                sx={{
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "var(--text-main)",
                  mb: 1.5,
                }}
              >
                Basic Information
              </Typography>

              <Grid container spacing={2} sx={{ mb: 2.5 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Full Name"
                    value={profileForm.name}
                    onChange={updateField("name")}
                    fullWidth
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <NotesIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email"
                    value={profileForm.email}
                    onChange={updateField("email")}
                    fullWidth
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone"
                    value={profileForm.phone}
                    onChange={updateField("phone")}
                    fullWidth
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Food Preference"
                    select
                    value={profileForm.foodType}
                    onChange={(e) =>
                      setProfileForm((p) => ({
                        ...p,
                        foodType: e.target.value,
                      }))
                    }
                    fullWidth
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <VegIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  >
                    <MenuItem value="veg">Veg Only</MenuItem>
                    <MenuItem value="nonveg">Non-veg</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Delivery & Payment */}
              <Typography
                sx={{
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "var(--text-main)",
                  mb: 1.5,
                }}
              >
                Delivery & Payment
              </Typography>

              <Grid container spacing={2} sx={{ mb: 2.5 }}>
                <Grid item xs={12}>
                  <TextField
                    label="Primary Address"
                    value={profileForm.address}
                    onChange={updateField("address")}
                    fullWidth
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Payment Method"
                    value={profileForm.paymentMethod}
                    onChange={updateField("paymentMethod")}
                    select
                    fullWidth
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CreditCardIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  >
                    {[
                      { value: "Cash", label: "Cash on Delivery" },
                      { value: "Card", label: "Credit / Debit Card" },
                      { value: "UPI", label: "UPI" },
                    ].map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Delivery Speed"
                    value={profileForm.deliverySpeed}
                    onChange={updateField("deliverySpeed")}
                    select
                    fullWidth
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DeliveryIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  >
                    {[
                      { value: "Standard", label: "Standard (30-45 min)" },
                      { value: "Express", label: "Express (15-30 min)" },
                      { value: "Scheduled", label: "Scheduled" },
                    ].map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Delivery Instructions"
                    value={profileForm.deliveryInstructions}
                    onChange={updateField("deliveryInstructions")}
                    fullWidth
                    size="small"
                    multiline
                    minRows={2}
                    placeholder="E.g., Ring doorbell, Leave at gate..."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <NotesIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Saved Addresses */}
              <Typography
                sx={{
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "var(--text-main)",
                  mb: 1.5,
                }}
              >
                Saved Addresses
              </Typography>

              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                {profileForm.savedAddresses.map((addr) => (
                  <Grid item xs={12} key={addr.id}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 1.25,
                        background: "var(--bg-light)",
                        borderRadius: "10px",
                        border: "1px solid var(--border-light)",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                        <LocationIcon sx={{ color: "var(--primary)", fontSize: 18 }} />
                        <Typography
                          sx={{
                            fontSize: "0.85rem",
                            color: "var(--text-main)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {addr.text}
                        </Typography>
                      </Box>
                      <MuiIconButton
                        size="small"
                        onClick={() => removeSavedAddress(addr.id)}
                        sx={{ color: "var(--primary)" }}
                      >
                        <DeleteIcon fontSize="small" />
                      </MuiIconButton>
                    </Box>
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      placeholder="Add a new address..."
                      fullWidth
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <MuiIconButton
                      onClick={addSavedAddress}
                      sx={{
                        background: "var(--primary-gradient)",
                        color: "white",
                        borderRadius: "8px",
                        "&:hover": {
                          background: "var(--primary-gradient)",
                          opacity: 0.9,
                        },
                      }}
                    >
                      <AddIcon />
                    </MuiIconButton>
                  </Box>
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
                <div className="favorites-card" key={item.id}>
                  <div className="image-wrap">
                    <img src={item.img} alt={item.title} loading="lazy" />
                    <button
                      className="remove-fav"
                      title="Remove from favorites"
                      aria-label="remove-favorite"
                      onClick={() => {
                        const trending = JSON.parse(
                          localStorage.getItem("trendingBookmarked") || "{}",
                        );
                        const discount = JSON.parse(
                          localStorage.getItem("discountBookmarked") || "{}",
                        );
                        if (item.section === "trending") {
                          delete trending[item.id];
                          localStorage.setItem(
                            "trendingBookmarked",
                            JSON.stringify(trending),
                          );
                        } else {
                          delete discount[item.id];
                          localStorage.setItem(
                            "discountBookmarked",
                            JSON.stringify(discount),
                          );
                        }
                        window.dispatchEvent(new Event("favoritesUpdated"));
                        setShowFavoritesModal(true);
                      }}
                    >
                      <FavoritesIcon fontSize="small" />
                    </button>
                  </div>
                  <div className="content">
                    <div className="title">{item.title}</div>
                    <div className="meta">
                      <span className="rating">
                        <span>⭐</span>
                        <span>{item?.rating ?? "-"}</span>
                      </span>
                      <span className="reviews">
                        {item?.reviews
                          ? `(${item.reviews} reviews)`
                          : "(reviews)"}
                      </span>
                    </div>
                    <div className="actions">
                      <span className="price">₹{item.price}</span>
                      <button
                        onClick={() => dispatch(addToCart(item))}
                        className="add-btn"
                      >
                        + ADD
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <Box sx={{ width: "100%", textAlign: "center", py: 4 }}>
                <FavoriteBorderIcon
                  sx={{
                    fontSize: 48,
                    color: "var(--text-sub)",
                    mb: 2,
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
