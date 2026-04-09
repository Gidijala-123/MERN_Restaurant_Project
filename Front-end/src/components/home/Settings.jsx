import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Avatar,
  Card,
  CardContent,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
  IconButton,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
} from "@mui/material";

import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CreditCard as CreditCardIcon,
  Notes as NotesIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Fastfood as FastfoodIcon,
  Payment as PaymentIcon,
  AttachMoney as AttachMoneyIcon,
  CurrencyRupee as RupeeIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  PhotoCamera as PhotoCameraIcon,
  LocalShipping as DeliveryIcon,
  Map as MapIcon,
  AddLocationAlt as AddLocationAltIcon,
  MyLocation as MyLocationIcon,
  Remove as RemoveIcon,
  Layers as LayersIcon,
  Fullscreen as FullscreenIcon,
  Star as StarIcon,
  History as HistoryIcon,
  EmojiEvents as EmojiEventsIcon,
  LocalOffer as LocalOfferIcon,
  CalendarToday as CalendarTodayIcon,
  TrendingUp as TrendingUpIcon,
  Restaurant as RestaurantIcon,
  Savings as SavingsIcon,
  LocalFireDepartment as StreakIcon,
  RateReview as ReviewIcon,
  Timer as TimerIcon,
  Public as EarthIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTheme } from "../../context/ThemeContext";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  deliveryInstructions: "",
  paymentMethod: "Cash",
  foodType: "veg",
  deliverySpeed: "Standard",
  savedAddresses: [],
  dietaryRestrictions: [],
  referralCode: "",
  avatar: "",
  selectedAddressId: null,
};

export default function Settings() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const fileInputRef = useRef(null);
  const [profileForm, setProfileForm] = useState(initialForm);
  const [savedProfile, setSavedProfile] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [newAddress, setNewAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [pickedLocation, setPickedLocation] = useState(null);
  const [locationTag, setLocationTag] = useState("Home");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(0.01);
  const [mapType, setMapType] = useState("mapnik");
  const [userOrders, setUserOrders] = useState([]);
  const [showOrderHistory, setShowOrderHistory] = useState(false);

  useEffect(() => {
    const orders = JSON.parse(localStorage.getItem("userOrders") || "[]");
    setUserOrders(Array.isArray(orders) ? orders : []);
  }, []);

  // Force-clear any scroll lock left by MUI Menu/Dialog on navigation
  useEffect(() => {
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, []);

  useEffect(() => {
    const API = (import.meta.env.VITE_API_URL || "http://localhost:1111").replace(/\/$/, "");
    fetch(`${API}/api/auth/profile/settings`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return;
        const stored = {
          name: data.uname || localStorage.getItem("userName") || "",
          email: data.uemail || localStorage.getItem("userEmail") || "",
          phone: data.profile?.phone || "",
          address: data.profile?.address || "",
          deliveryInstructions: data.profile?.deliveryInstructions || "",
          paymentMethod: data.profile?.paymentMethod || "Cash",
          foodType: data.profile?.foodType || "veg",
          deliverySpeed: data.profile?.deliverySpeed || "Standard",
          savedAddresses: data.profile?.savedAddresses || [],
          dietaryRestrictions: data.profile?.dietaryRestrictions || [],
          referralCode: data.profile?.referralCode || "FLAVORA2024",
          avatar: data.avatar || localStorage.getItem("userAvatar") || "",
          selectedAddressId: null,
        };
        setProfileForm(stored);
        setSavedProfile(stored);
      })
      .catch(() => {
        // Fallback to localStorage if API fails
        const stored = {
          name: localStorage.getItem("userName") || "",
          email: localStorage.getItem("userEmail") || "",
          phone: localStorage.getItem("userPhone") || "",
          address: localStorage.getItem("userAddress") || "",
          deliveryInstructions: localStorage.getItem("userDeliveryInstructions") || "",
          paymentMethod: localStorage.getItem("userPaymentMethod") || "Cash",
          foodType: localStorage.getItem("userFoodType") || "veg",
          deliverySpeed: localStorage.getItem("userDeliverySpeed") || "Standard",
          savedAddresses: JSON.parse(localStorage.getItem("userSavedAddresses")) || [],
          dietaryRestrictions: JSON.parse(localStorage.getItem("userDietaryRestrictions")) || [],
          referralCode: localStorage.getItem("userReferralCode") || "FLAVORA2024",
          avatar: localStorage.getItem("userAvatar") || "",
          selectedAddressId: null,
        };
        setProfileForm(stored);
        setSavedProfile(stored);
      });
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!profileForm.name.trim()) errors.name = "Name is required";
    if (!profileForm.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(profileForm.email))
      errors.email = "Invalid email format";
    if (!profileForm.phone.trim()) errors.phone = "Phone number is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveProfile = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving.");
      return;
    }
    setSaving(true);
    try {
      const API = (import.meta.env.VITE_API_URL || "http://localhost:1111").replace(/\/$/, "");

      // Get CSRF token
      const csrf = await fetch(`${API}/api/csrf`, { credentials: "include" })
        .then((r) => r.json()).catch(() => ({}));

      // Persist name + avatar to backend DB
      await fetch(`${API}/api/auth/profile`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrf?.csrfToken || "" },
        body: JSON.stringify({ uname: profileForm.name.trim(), avatar: profileForm.avatar }),
      });

      // Persist profile settings to backend DB
      await fetch(`${API}/api/auth/profile/settings`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrf?.csrfToken || "" },
        body: JSON.stringify({
          phone: profileForm.phone,
          address: profileForm.address,
          deliveryInstructions: profileForm.deliveryInstructions,
          paymentMethod: profileForm.paymentMethod,
          foodType: profileForm.foodType,
          deliverySpeed: profileForm.deliverySpeed,
          savedAddresses: profileForm.savedAddresses,
          dietaryRestrictions: profileForm.dietaryRestrictions,
          referralCode: profileForm.referralCode,
        }),
      });

      // Save everything else to localStorage
      Object.entries(profileForm).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          localStorage.setItem(
            `user${key.charAt(0).toUpperCase() + key.slice(1)}`,
            JSON.stringify(value)
          );
        } else {
          localStorage.setItem(
            `user${key.charAt(0).toUpperCase() + key.slice(1)}`,
            value
          );
        }
      });

      setSavedProfile({ ...profileForm });

      // Notify Sidebar to re-read userName and userAvatar immediately
      window.dispatchEvent(new Event("profileUpdated"));

      toast.success("Profile settings updated successfully!");
    } catch {
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));

    if (field === "address") {
      // Clear selected address when user types a custom address
      setProfileForm((prev) => ({ ...prev, selectedAddressId: null }));
    }
  };

  const addAddress = (tag = null) => {
    const trimmed = newAddress.trim();
    if (!trimmed) return;
    const finalTag = tag || locationTag || "Other";
    const newEntry = {
      id: Date.now(),
      text: trimmed,
      tag: finalTag,
    };
    setProfileForm((prev) => ({
      ...prev,
      savedAddresses: [...prev.savedAddresses, newEntry],
      address: trimmed,
      selectedAddressId: newEntry.id,
    }));
    setNewAddress("");
    toast.success(`Address added as ${finalTag}.`);
  };

  const selectAddress = (id) => {
    const addr = profileForm.savedAddresses.find((a) => a.id === id);
    if (addr) {
      setProfileForm((prev) => ({
        ...prev,
        address: addr.text,
        selectedAddressId: id,
      }));
      toast.info(`Selected address: ${addr.tag || "Saved Address"}`);
    }
  };

  const removeAddress = (id) => {
    setProfileForm((prev) => {
      const updated = prev.savedAddresses.filter((a) => a.id !== id);
      const isSelected = prev.selectedAddressId === id;
      return {
        ...prev,
        savedAddresses: updated,
        selectedAddressId: isSelected ? null : prev.selectedAddressId,
        address: isSelected ? "" : prev.address,
      };
    });
    toast.warn("Address removed.");
  };

  const fetchAddressFromCoords = async (lat, lon) => {
    setMapLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
      );
      const data = await response.json();
      if (data && data.display_name) {
        setNewAddress(data.display_name);
        setPickedLocation({
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          address: data.display_name,
        });
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      toast.error("Failed to fetch address from location.");
    } finally {
      setMapLoading(false);
    }
  };

  const searchLocations = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&addressdetails=1&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed. Try again later.");
    } finally {
      setIsSearching(false);
    }
  };

  const mapUrl = useMemo(() => {
    const lat = pickedLocation ? pickedLocation.lat : 17.385;
    const lon = pickedLocation ? pickedLocation.lon : 78.4867;
    const offset = zoomLevel;
    const bbox = [
      (lon - offset).toFixed(4),
      (lat - offset).toFixed(4),
      (lon + offset).toFixed(4),
      (lat + offset).toFixed(4),
    ].join("%2C");
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=${mapType}&marker=${lat.toFixed(
      4
    )}%2C${lon.toFixed(4)}&zoomcontrol=false`;
  }, [pickedLocation, zoomLevel, mapType]);

  const handleZoomIn = () => setZoomLevel((prev) => Math.max(0.0005, prev / 2));
  const handleZoomOut = () => setZoomLevel((prev) => Math.min(0.1, prev * 2));
  const toggleMapType = () =>
    setMapType((prev) => (prev === "mapnik" ? "cyclemap" : "mapnik"));

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setMapLoading(true);
    setSearchQuery("");
    setSearchResults([]);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchAddressFromCoords(latitude, longitude);
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Failed to get your current location.");
        setMapLoading(false);
      }
    );
  };

  const handleSearchSelect = (result) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    setNewAddress(result.display_name);
    setPickedLocation({ lat, lon, address: result.display_name });
    setSearchQuery("");
    setSearchResults([]);
  };

  const toggleDietary = (tag) => {
    setProfileForm((prev) => {
      const current = prev.dietaryRestrictions || [];
      const updated = current.includes(tag)
        ? current.filter((t) => t !== tag)
        : [...current, tag];
      return { ...prev, dietaryRestrictions: updated };
    });
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024 * 2) {
        toast.error("File size should be less than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm((prev) => ({ ...prev, avatar: reader.result }));
        toast.info("Avatar updated preview!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackClick = () => {
    if (hasChanges) {
      setDiscardDialogOpen(true);
    } else {
      navigate(-1);
    }
  };

  const hasChanges = useMemo(() => {
    if (!savedProfile) return false;
    return (
      JSON.stringify(profileForm) !== JSON.stringify(savedProfile)
    );
  }, [profileForm, savedProfile]);

  const appTheme = theme;

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "14px",
      background: "var(--bg-light)",
      transition: "all 0.3s ease",
      "& fieldset": { border: "1px solid var(--border-light)" },
      "&:hover fieldset": { borderColor: "var(--primary)" },
      "&.Mui-focused fieldset": {
        borderWidth: "2px",
        borderColor: "var(--primary)",
      },
    },
    "& .MuiInputLabel-root": {
      fontWeight: 700,
      color: "var(--text-sub)",
      "&.Mui-focused": { color: "var(--primary)" },
    },
    "& .MuiInputAdornment-root .MuiSvgIcon-root": {
      color: "var(--primary)",
      opacity: 0.7,
    },
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        background: "var(--bg-light)",
        minHeight: "100vh",
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        {/* Header */}
        <Box
          sx={{
            mb: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              onClick={handleBackClick}
              sx={{
                background: "var(--white)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography
                variant="h4"
                fontWeight={900}
                sx={{ color: "var(--text-main)", letterSpacing: -1 }}
              >
                Settings
              </Typography>
              <Typography variant="body2" color="var(--text-sub)">
                Manage your account preferences and delivery details
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            onClick={saveProfile}
            disabled={saving || !hasChanges}
            startIcon={<SaveIcon />}
            sx={{
              background: !hasChanges
                ? "var(--bg-light)"
                : "var(--primary-gradient)",
              color: !hasChanges
                ? "var(--text-sub) !important"
                : "#ffffff !important",
              borderRadius: "12px",
              px: 3,
              py: 1,
              fontWeight: 700,
              boxShadow: !hasChanges
                ? "none"
                : "0 8px 16px rgba(230, 81, 0, 0.2)",
              "&:hover": {
                boxShadow: !hasChanges
                  ? "none"
                  : "0 12px 20px rgba(230, 81, 0, 0.3)",
                background: !hasChanges
                  ? "var(--bg-light)"
                  : "var(--primary-gradient)",
              },
              opacity: !hasChanges ? 0.7 : 1,
              transition: "all 0.3s ease",
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </Box>

        <Grid container spacing={4} sx={{ alignItems: "stretch" }}>
          {/* Left Column - Navigation/Activity Summary */}
          <Grid
            item
            xs={12}
            md={4}
            sx={{ display: "flex", flexDirection: "column" }}
          >
            <Card
              sx={{
                borderRadius: "24px",
                overflow: "hidden",
                background: "var(--white)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                mb: { xs: 4, md: 0 }, // Only bottom margin on mobile
                height: "100%", // Stretch to match right column
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.3s ease, boxShadow 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
                },
              }}
            >
              <Box
                sx={{
                  p: 4,
                  background: "var(--primary-gradient)",
                  textAlign: "center",
                  position: "relative",
                }}
              >
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  badgeContent={
                    <IconButton
                      size="small"
                      onClick={() => fileInputRef.current.click()}
                      sx={{
                        background: "white",
                        color: "var(--primary)",
                        "&:hover": { background: "#f5f5f5" },
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    >
                      <PhotoCameraIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <input
                    type="file"
                    hidden
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: "50%",
                      mx: "auto",
                      border: "4px solid white",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                      background: profileForm.avatar
                        ? `url("${profileForm.avatar}") center/cover no-repeat`
                        : "var(--primary-gradient)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "2.2rem",
                      fontWeight: 800,
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    {!profileForm.avatar && (profileForm.name?.charAt(0) || "U")}
                  </Box>
                </Badge>
                <Typography
                  variant="h6"
                  fontWeight={800}
                  sx={{ mt: 2, color: "white" }}
                >
                  {profileForm.name || "Set your name"}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.8)" }}
                >
                  Foodie Level: <span style={{ fontWeight: 900 }}>Silver</span>
                </Typography>

                {/* Gamified Level Progress */}
                <Box sx={{ mt: 2, px: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: "white", fontWeight: 700 }}
                    >
                      Level 4
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "white", fontWeight: 700 }}
                    >
                      85% to Gold
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: "100%",
                      height: 6,
                      background: "rgba(255,255,255,0.2)",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        width: "85%",
                        height: "100%",
                        background: "white",
                        borderRadius: 3,
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              <CardContent sx={{ p: 3, flexGrow: 1 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Typography
                    variant="overline"
                    fontWeight={800}
                    color="var(--text-sub)"
                  >
                    Order Insights
                  </Typography>
                  {[
                    {
                      icon: <HistoryIcon />,
                      label: "Total Orders",
                      value: userOrders.length.toString(),
                      color: "#3498db",
                    },
                    {
                      icon: <StreakIcon />,
                      label: "Order Streak",
                      value: "8 Days",
                      color: "#e74c3c",
                    },
                    {
                      icon: <TimerIcon />,
                      label: "Avg Delivery",
                      value: "24 mins",
                      color: "#1abc9c",
                    },
                  ].map((stat, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 1,
                        borderRadius: "12px",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          background: "var(--bg-light)",
                          transform: "translateX(5px)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: "10px",
                          background: `${stat.color}15`,
                          color: stat.color,
                          display: "flex",
                        }}
                      >
                        {React.cloneElement(stat.icon, { fontSize: "small" })}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="caption"
                          fontWeight={700}
                          color="var(--text-sub)"
                          sx={{ display: "block", lineHeight: 1 }}
                        >
                          {stat.label}
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={800}
                          color="var(--text-main)"
                        >
                          {stat.value}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                  <Divider sx={{ my: 1 }} />

                  {/* ── Order History ── */}
                  <Box
                    sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
                    onClick={() => setShowOrderHistory(v => !v)}
                  >
                    <Typography variant="overline" fontWeight={800} color="var(--text-sub)">
                      Order History
                    </Typography>
                    <Typography variant="caption" color="var(--primary)" fontWeight={700}>
                      {showOrderHistory ? "Hide ▲" : `Show ${userOrders.length} ▼`}
                    </Typography>
                  </Box>

                  {showOrderHistory && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, maxHeight: 340, overflowY: "auto", pr: 0.5 }}>
                      {userOrders.length === 0 ? (
                        <Typography variant="body2" color="var(--text-sub)" sx={{ py: 1, textAlign: "center" }}>
                          No orders yet. Place your first order!
                        </Typography>
                      ) : (
                        userOrders.map((order, idx) => (
                          <Box
                            key={order.id || idx}
                            sx={{
                              borderRadius: "12px",
                              border: "1px solid var(--border-light)",
                              background: "var(--bg-light)",
                              p: 1.5,
                              transition: "box-shadow 0.2s",
                              "&:hover": { boxShadow: "0 2px 12px rgba(234,88,12,0.12)" },
                            }}
                          >
                            {/* Order header */}
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                              <Box>
                                <Typography variant="caption" fontWeight={800} color="var(--primary)" sx={{ display: "block" }}>
                                  #{order.id ? order.id.slice(-8).toUpperCase() : `ORD-${idx + 1}`}
                                </Typography>
                                <Typography variant="caption" color="var(--text-sub)">
                                  {order.date ? new Date(order.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: "right" }}>
                                <Typography variant="caption" fontWeight={800} color="var(--text-main)" sx={{ display: "block" }}>
                                  ₹{order.grandTotal}
                                </Typography>
                                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.4, background: "#ecfdf5", borderRadius: "20px", px: 1, py: 0.2 }}>
                                  <Box sx={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
                                  <Typography variant="caption" fontWeight={700} color="#059669" sx={{ fontSize: "0.6rem" }}>Paid</Typography>
                                </Box>
                              </Box>
                            </Box>

                            {/* Items list */}
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.4 }}>
                              {(order.items || []).map((item, i) => (
                                <Box key={i} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <Typography variant="caption" color="var(--text-sub)" sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {item.title}
                                  </Typography>
                                  <Typography variant="caption" color="var(--text-sub)" sx={{ ml: 1, whiteSpace: "nowrap" }}>
                                    ×{item.cartQuantity}
                                  </Typography>
                                  <Typography variant="caption" fontWeight={700} color="var(--primary)" sx={{ ml: 1.5, whiteSpace: "nowrap" }}>
                                    ₹{item.price * item.cartQuantity}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>

                            {/* Bill summary */}
                            <Box sx={{ mt: 1, pt: 1, borderTop: "1px dashed var(--border-light)", display: "flex", justifyContent: "space-between" }}>
                              <Typography variant="caption" color="var(--text-sub)">
                                {(order.items || []).reduce((s, i) => s + i.cartQuantity, 0)} items · GST ₹{order.gst}
                              </Typography>
                              <Typography variant="caption" fontWeight={800} color="var(--text-main)">
                                Total ₹{order.grandTotal}
                              </Typography>
                            </Box>
                          </Box>
                        ))
                      )}
                    </Box>
                  )}

                  <Divider sx={{ my: 1 }} />
                  <Typography
                    variant="overline"
                    fontWeight={800}
                    color="var(--text-sub)"
                  >
                    Engagement & Rewards
                  </Typography>
                  {[
                    {
                      icon: <EmojiEventsIcon />,
                      label: "Loyalty Points",
                      value: "1,250",
                      color: "#f1c40f",
                    },
                    {
                      icon: <SavingsIcon />,
                      label: "Total Saved",
                      value: "₹ 2,450",
                      color: "#e67e22",
                    },
                    {
                      icon: <ReviewIcon />,
                      label: "Reviews Given",
                      value: "15",
                      color: "#9b59b6",
                    },
                  ].map((stat, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 1,
                        borderRadius: "12px",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          background: "var(--bg-light)",
                          transform: "translateX(5px)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: "10px",
                          background: `${stat.color}15`,
                          color: stat.color,
                          display: "flex",
                        }}
                      >
                        {React.cloneElement(stat.icon, { fontSize: "small" })}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="caption"
                          fontWeight={700}
                          color="var(--text-sub)"
                          sx={{ display: "block", lineHeight: 1 }}
                        >
                          {stat.label}
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={800}
                          color="var(--text-main)"
                        >
                          {stat.value}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                  <Divider sx={{ my: 1 }} />
                  <Typography
                    variant="overline"
                    fontWeight={800}
                    color="var(--text-sub)"
                  >
                    Personal Milestones
                  </Typography>
                  {[
                    {
                      icon: <RestaurantIcon />,
                      label: "Fav Cuisine",
                      value: "Indian",
                      color: "#27ae60",
                    },
                    {
                      icon: <EarthIcon />,
                      label: "Eco Impact",
                      value: "4kg CO2 saved",
                      color: "#2ecc71",
                    },
                    {
                      icon: <StarIcon />,
                      label: "Member Since",
                      value: "Feb 2024",
                      color: "#7f8c8d",
                    },
                  ].map((stat, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 1,
                        borderRadius: "12px",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          background: "var(--bg-light)",
                          transform: "translateX(5px)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: "10px",
                          background: `${stat.color}15`,
                          color: stat.color,
                          display: "flex",
                        }}
                      >
                        {React.cloneElement(stat.icon, { fontSize: "small" })}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="caption"
                          fontWeight={700}
                          color="var(--text-sub)"
                          sx={{ display: "block", lineHeight: 1 }}
                        >
                          {stat.label}
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={800}
                          color="var(--text-main)"
                        >
                          {stat.value}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column - Main Settings */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {/* Personal Information */}
              <Card
                sx={{
                  borderRadius: "24px",
                  background: "var(--white)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                  transition: "all 0.3s ease",
                  "&:hover": { boxShadow: "0 15px 40px rgba(0,0,0,0.08)" },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 4,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: "14px",
                        background: "rgba(230, 81, 0, 0.1)",
                        color: "var(--primary)",
                      }}
                    >
                      <PersonIcon />
                    </Box>
                    <Box>
                      <Typography
                        variant="h6"
                        fontWeight={800}
                        color="var(--text-main)"
                      >
                        Personal Information
                      </Typography>
                      <Typography variant="body2" color="var(--text-sub)">
                        Basic details about you
                      </Typography>
                    </Box>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        value={profileForm.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        error={!!formErrors.name}
                        helperText={formErrors.name}
                        InputProps={{
                          startAdornment: <PersonIcon sx={{ mr: 1 }} />,
                        }}
                        sx={inputStyles}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        value={profileForm.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        error={!!formErrors.email}
                        helperText={formErrors.email}
                        InputProps={{
                          startAdornment: <EmailIcon sx={{ mr: 1 }} />,
                        }}
                        sx={inputStyles}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        value={profileForm.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        error={!!formErrors.phone}
                        helperText={formErrors.phone}
                        InputProps={{
                          startAdornment: <PhoneIcon sx={{ mr: 1 }} />,
                        }}
                        sx={inputStyles}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Referral Code"
                        value={profileForm.referralCode}
                        InputProps={{
                          startAdornment: <LocalOfferIcon sx={{ mr: 1 }} />,
                          readOnly: true,
                        }}
                        sx={inputStyles}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Delivery Settings */}
              <Card
                sx={{
                  borderRadius: "24px",
                  background: "var(--white)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                  transition: "all 0.3s ease",
                  "&:hover": { boxShadow: "0 15px 40px rgba(0,0,0,0.08)" },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 4,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: "14px",
                        background: "rgba(230, 81, 0, 0.1)",
                        color: "var(--primary)",
                      }}
                    >
                      <DeliveryIcon />
                    </Box>
                    <Box>
                      <Typography
                        variant="h6"
                        fontWeight={800}
                        color="var(--text-main)"
                      >
                        Delivery Details
                      </Typography>
                      <Typography variant="body2" color="var(--text-sub)">
                        Where should we bring your food?
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 4 }}>
                    <Typography
                      variant="body2"
                      fontWeight={800}
                      sx={{ mb: 2, display: "block" }}
                    >
                      Saved Addresses
                    </Typography>
                    <RadioGroup
                      value={profileForm.selectedAddressId}
                      onChange={(e) =>
                        selectAddress(parseInt(e.target.value))
                      }
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                      {profileForm.savedAddresses.map((addr) => (
                        <Box
                          key={addr.id}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            p: 1.5,
                            borderRadius: "12px",
                            border: `1px solid ${profileForm.selectedAddressId === addr.id
                              ? "var(--primary)"
                              : "var(--border-light)"
                              }`,
                            background:
                              profileForm.selectedAddressId === addr.id
                                ? "rgba(230, 81, 0, 0.05)"
                                : "transparent",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <FormControlLabel
                            value={addr.id}
                            control={
                              <Radio
                                sx={{
                                  color: "var(--primary)",
                                  "&.Mui-checked": { color: "var(--primary)" },
                                }}
                              />
                            }
                            label={
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 0.5,
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 800,
                                      color: "var(--text-main)",
                                    }}
                                  >
                                    {addr.tag || "Address"}
                                  </Typography>
                                  {addr.tag === "Home" && (
                                    <Chip
                                      label="Home"
                                      size="small"
                                      sx={{
                                        height: 16,
                                        fontSize: "0.6rem",
                                        background: "rgba(39, 174, 96, 0.1)",
                                        color: "#27ae60",
                                        fontWeight: 700,
                                      }}
                                    />
                                  )}
                                  {addr.tag === "Work" && (
                                    <Chip
                                      label="Work"
                                      size="small"
                                      sx={{
                                        height: 16,
                                        fontSize: "0.6rem",
                                        background: "rgba(41, 128, 185, 0.1)",
                                        color: "#2980b9",
                                        fontWeight: 700,
                                      }}
                                    />
                                  )}
                                  {addr.tag === "Other" && (
                                    <Chip
                                      label="Other"
                                      size="small"
                                      sx={{
                                        height: 16,
                                        fontSize: "0.6rem",
                                        background: "rgba(127, 140, 141, 0.1)",
                                        color: "#7f8c8d",
                                        fontWeight: 700,
                                      }}
                                    />
                                  )}
                                </Box>
                                <Typography
                                  variant="body2"
                                  color="var(--text-sub)"
                                  sx={{ fontSize: "0.8rem" }}
                                >
                                  {addr.text}
                                </Typography>
                              </Box>
                            }
                            sx={{ flex: 1, m: 0 }}
                          />
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeAddress(addr.id)}
                            sx={{
                              ml: 1,
                              "&:hover": {
                                background: "rgba(244, 67, 54, 0.1)",
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </RadioGroup>
                  </Box>

                  <Box sx={{ mb: 4 }}>
                    <Typography
                      variant="body2"
                      fontWeight={800}
                      sx={{ mb: 1.5 }}
                    >
                      Add New Address
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <TextField
                        fullWidth
                        placeholder="Type address or use map picker..."
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        InputProps={{
                          startAdornment: <LocationIcon sx={{ mr: 1 }} />,
                          style: { height: "48px" }
                        }}
                        sx={inputStyles}
                      />
                      <IconButton
                        onClick={() => setMapPickerOpen(true)}
                        sx={{
                          background: "rgba(230, 81, 0, 0.1)",
                          color: "var(--primary)",
                          borderRadius: "14px",
                          width: 48,
                          height: 48,
                          "&:hover": { background: "rgba(230, 81, 0, 0.2)" },
                        }}
                      >
                        <AddLocationAltIcon />
                      </IconButton>
                      <Button
                        variant="contained"
                        onClick={() => addAddress()}
                        disabled={!newAddress.trim()}
                        sx={{
                          background: !newAddress.trim()
                            ? "var(--bg-light)"
                            : "var(--primary-gradient)",
                          color: !newAddress.trim()
                            ? "var(--text-sub) !important"
                            : "#ffffff !important",
                          borderRadius: "14px",
                          minWidth: 80,
                          height: 48,
                          fontWeight: 700,
                          transition: "all 0.3s ease",
                        }}
                      >
                        Add
                      </Button>
                    </Box>
                  </Box>

                  <Box>
                    <Typography
                      variant="body2"
                      fontWeight={800}
                      sx={{ mb: 1.5 }}
                    >
                      Delivery Instructions
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      minRows={1}
                      maxRows={3}
                      placeholder="E.g., Leave at the door, Ring the bell twice..."
                      value={profileForm.deliveryInstructions}
                      onChange={(e) =>
                        handleInputChange("deliveryInstructions", e.target.value)
                      }
                      InputProps={{
                        startAdornment: (
                          <NotesIcon
                            sx={{
                              mr: 1.5,
                              color: "var(--primary)",
                              opacity: 0.7,
                            }}
                          />
                        ),
                      }}
                      sx={{
                        ...inputStyles,
                        "& .MuiOutlinedInput-root": {
                          ...inputStyles["& .MuiOutlinedInput-root"],
                          minHeight: "60px",
                          display: "flex",
                          alignItems: "center",
                          paddingLeft: "16px",
                          background: "var(--white)", // Make it stand out like other cards
                          "& fieldset": {
                            borderColor: "rgba(0, 0, 0, 0.08) !important"
                          },
                          "&:hover fieldset": {
                            borderColor: "var(--primary) !important"
                          },
                        },
                        "& .MuiOutlinedInput-input": {
                          padding: "0 !important",
                          textAlign: "left",
                          color: "var(--text-main)",
                        },
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>

              {/* Preferences & Dietary */}
              <Card
                sx={{
                  borderRadius: "24px",
                  background: "var(--white)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                  transition: "all 0.3s ease",
                  "&:hover": { boxShadow: "0 15px 40px rgba(0,0,0,0.08)" },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 4,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: "14px",
                        background: "rgba(230, 81, 0, 0.1)",
                        color: "var(--primary)",
                      }}
                    >
                      <FastfoodIcon />
                    </Box>
                    <Box>
                      <Typography
                        variant="h6"
                        fontWeight={800}
                        color="var(--text-main)"
                      >
                        Food Preferences
                      </Typography>
                      <Typography variant="body2" color="var(--text-sub)">
                        Tailor your Flavora experience
                      </Typography>
                    </Box>
                  </Box>

                  <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                      <FormControl component="fieldset">
                        <FormLabel
                          component="legend"
                          sx={{
                            fontWeight: 800,
                            color: "var(--text-main)",
                            mb: 1,
                          }}
                        >
                          Dietary Habit
                        </FormLabel>
                        <RadioGroup
                          row
                          value={profileForm.foodType}
                          onChange={(e) =>
                            handleInputChange("foodType", e.target.value)
                          }
                        >
                          <FormControlLabel
                            value="veg"
                            control={<Radio color="primary" />}
                            label="Vegetarian"
                          />
                          <FormControlLabel
                            value="non-veg"
                            control={<Radio color="primary" />}
                            label="Non-Veg"
                          />
                        </RadioGroup>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl component="fieldset">
                        <FormLabel
                          component="legend"
                          sx={{
                            fontWeight: 800,
                            color: "var(--text-main)",
                            mb: 1,
                          }}
                        >
                          Delivery Speed
                        </FormLabel>
                        <RadioGroup
                          row
                          value={profileForm.deliverySpeed}
                          onChange={(e) =>
                            handleInputChange("deliverySpeed", e.target.value)
                          }
                        >
                          <FormControlLabel
                            value="Standard"
                            control={<Radio color="primary" />}
                            label="Standard"
                          />
                          <FormControlLabel
                            value="Priority"
                            control={<Radio color="primary" />}
                            label="Priority"
                          />
                        </RadioGroup>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography
                        variant="body2"
                        fontWeight={800}
                        sx={{ mb: 2 }}
                      >
                        Dietary Restrictions
                      </Typography>
                      <Box
                        sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}
                      >
                        {[
                          "Gluten Free",
                          "Dairy Free",
                          "Nut Free",
                          "Low Carb",
                          "Vegan",
                          "Halal",
                          "Keto",
                        ].map((tag) => {
                          const isSelected = (
                            profileForm.dietaryRestrictions || []
                          ).includes(tag);
                          return (
                            <Chip
                              key={tag}
                              label={tag}
                              onClick={() => toggleDietary(tag)}
                              sx={{
                                borderRadius: "10px",
                                fontWeight: 700,
                                transition: "all 0.2s ease",
                                background: isSelected
                                  ? "var(--primary-gradient)"
                                  : "var(--bg-light)",
                                color: isSelected
                                  ? "white"
                                  : "var(--text-sub)",
                                border: isSelected
                                  ? "none"
                                  : "1px solid var(--border-light)",
                                "&:hover": { transform: "translateY(-2px)" },
                              }}
                            />
                          );
                        })}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Payment Settings */}
              <Card
                sx={{
                  borderRadius: "24px",
                  background: "var(--white)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                  transition: "all 0.3s ease",
                  "&:hover": { boxShadow: "0 15px 40px rgba(0,0,0,0.08)" },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 4,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: "14px",
                        background: "rgba(230, 81, 0, 0.1)",
                        color: "var(--primary)",
                      }}
                    >
                      <PaymentIcon />
                    </Box>
                    <Box>
                      <Typography
                        variant="h6"
                        fontWeight={800}
                        color="var(--text-main)"
                      >
                        Payment Settings
                      </Typography>
                      <Typography variant="body2" color="var(--text-sub)">
                        Default payment and wallet
                      </Typography>
                    </Box>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        select
                        label="Default Payment Method"
                        value={profileForm.paymentMethod}
                        onChange={(e) =>
                          handleInputChange("paymentMethod", e.target.value)
                        }
                        InputProps={{
                          startAdornment: <CreditCardIcon sx={{ mr: 1 }} />,
                        }}
                        sx={inputStyles}
                      >
                        <MenuItem value="Cash">Cash on Delivery</MenuItem>
                        <MenuItem value="UPI">UPI / QR Scan</MenuItem>
                        <MenuItem value="Card">Credit/Debit Card</MenuItem>
                        <MenuItem value="Wallet">Flavora Wallet</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box
                        sx={{
                          p: 1.5,
                          px: 2,
                          borderRadius: "14px",
                          background: "var(--bg-light)",
                          border: "1px solid var(--border-light)",
                          height: 56, // Match standard TextField height
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          transition: "all 0.3s ease",
                          "&:hover": { borderColor: "var(--primary)" },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <AccountBalanceWalletIcon
                            sx={{ color: "var(--primary)", opacity: 0.7 }}
                          />
                          <Box>
                            <Typography
                              variant="caption"
                              fontWeight={800}
                              color="var(--text-sub)"
                              sx={{ display: "block", lineHeight: 1 }}
                            >
                              WALLET BALANCE
                            </Typography>
                            <Typography
                              variant="body1"
                              fontWeight={900}
                              color="var(--primary)"
                            >
                              ₹ 450.00
                            </Typography>
                          </Box>
                        </Box>
                        <Button
                          size="small"
                          variant="contained"
                          sx={{
                            borderRadius: "8px",
                            fontWeight: 800,
                            px: 2,
                            py: 0.5,
                            fontSize: "0.7rem",
                            background: "var(--primary-gradient)",
                            color: "white !important",
                            boxShadow: "0 4px 10px rgba(230, 81, 0, 0.2)",
                          }}
                        >
                          Top Up
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Map Picker Dialog */}
      <Dialog
        open={mapPickerOpen}
        onClose={() => setMapPickerOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "28px",
            overflow: "hidden",
            background: "var(--white)",
            boxShadow: "0 24px 48px rgba(0,0,0,0.2)",
            // Reduced height to maintain "card" feel
            minHeight: { md: 550 },
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 900,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--primary-gradient)",
            color: "white",
            py: 2,
            px: 4,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <MapIcon sx={{ fontSize: 28 }} />
            <Typography
              variant="h6"
              fontWeight={900}
              sx={{ letterSpacing: -0.5 }}
            >
              Pick Delivery Location
            </Typography>
          </Box>
          <IconButton
            onClick={() => setMapPickerOpen(false)}
            sx={{
              color: "white",
              "&:hover": { background: "rgba(255,255,255,0.1)" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            p: 0,
            overflow: { xs: "auto", md: "hidden" },
            // Compact height to restore card-like appearance
            height: { xs: "auto", md: 450 },
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          <Grid container sx={{ height: "100%" }}>
            {/* Map Area */}
            <Grid
              item
              xs={12}
              md={7}
              sx={{
                position: "relative",
                minHeight: { xs: 300, md: "100%" },
                overflow: "hidden",
              }}
            >
              {/* Outer container to clip Leaflet default controls */}
              <Box
                sx={{
                  position: "absolute",
                  top: -40, // Clip top default controls
                  left: -40, // Clip left default controls
                  right: 0,
                  bottom: 0,
                  width: "calc(100% + 40px)",
                  height: "calc(100% + 40px)",
                  pointerEvents: "auto",
                }}
              >
                <iframe
                  key={mapUrl}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight="0"
                  marginWidth="0"
                  src={mapUrl}
                  style={{ border: "none", display: "block" }}
                  title="Map"
                ></iframe>
              </Box>

              {/* Map Controls Overlay */}
              <Box
                sx={{
                  position: "absolute",
                  top: 20,
                  right: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  zIndex: 5,
                }}
              >
                {/* Map Type Toggle */}
                <IconButton
                  onClick={toggleMapType}
                  sx={{
                    background: "white",
                    color: "var(--text-main)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    "&:hover": { background: "#f8f9fa" },
                    borderRadius: "12px",
                    width: 44,
                    height: 44,
                  }}
                  title="Change Map Layer"
                >
                  <LayersIcon />
                </IconButton>

                {/* Zoom Controls */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    background: "white",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    overflow: "hidden",
                  }}
                >
                  <IconButton
                    onClick={handleZoomIn}
                    sx={{
                      color: "var(--text-main)",
                      p: 1.2,
                      "&:hover": { background: "#f8f9fa" },
                    }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                  <Divider sx={{ width: "60%", mx: "auto" }} />
                  <IconButton
                    onClick={handleZoomOut}
                    sx={{
                      color: "var(--text-main)",
                      p: 1.2,
                      "&:hover": { background: "#f8f9fa" },
                    }}
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                </Box>

                {/* Locate Me (Integrated) */}
                <IconButton
                  onClick={handleLocateMe}
                  disabled={mapLoading}
                  sx={{
                    background: "white",
                    color: "var(--primary)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    "&:hover": { background: "#f8f9fa" },
                    borderRadius: "12px",
                    width: 44,
                    height: 44,
                  }}
                  title="Current Location"
                >
                  <MyLocationIcon />
                </IconButton>

                {/* Fullscreen (Visual Only for now) */}
                <IconButton
                  sx={{
                    background: "white",
                    color: "var(--text-main)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    "&:hover": { background: "#f8f9fa" },
                    borderRadius: "12px",
                    width: 44,
                    height: 44,
                  }}
                >
                  <FullscreenIcon />
                </IconButton>
              </Box>

              {mapLoading && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "rgba(255,255,255,0.8)",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 10,
                  }}
                >
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h6"
                      fontWeight={800}
                      color="var(--primary)"
                      sx={{ mb: 1.5 }}
                    >
                      Finding your spot...
                    </Typography>
                    <Box
                      sx={{
                        width: 180,
                        height: 6,
                        background: "rgba(0,0,0,0.05)",
                        borderRadius: 10,
                        overflow: "hidden",
                        mx: "auto",
                      }}
                    >
                      <Box
                        className="loading-bar-anim"
                        sx={{
                          height: "100%",
                          width: "60%",
                          background: "var(--primary-gradient)",
                          borderRadius: 10,
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              )}
            </Grid>

            {/* Sidebar Search Area */}
            <Grid
              item
              xs={12}
              md={5}
              sx={{
                display: "flex",
                flexDirection: "column",
                background: "var(--white)",
                borderLeft: { md: "1px solid var(--border-light)" },
                borderTop: { xs: "1px solid var(--border-light)", md: "none" },
                height: { xs: "auto", md: "100%" },
                maxHeight: { xs: 400, md: "100%" },
              }}
            >
              <Box
                sx={{
                  p: 2, // Slightly more compact
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5, // Tighter spacing
                  flexGrow: 1,
                  overflowY: "auto",
                  scrollbarWidth: "none",
                  "&::-webkit-scrollbar": { display: "none" },
                }}
              >
                {/* Search Bar */}
                <Box>
                  <Typography
                    variant="caption"
                    fontWeight={800}
                    color="var(--text-sub)"
                    sx={{
                      display: "block",
                      mb: 0.5,
                      textTransform: "uppercase",
                      letterSpacing: 1.2,
                      fontSize: "0.6rem",
                    }}
                  >
                    Search Location
                  </Typography>
                  <Box sx={{ position: "relative" }}>
                    <TextField
                      fullWidth
                      placeholder="Search area, landmark..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        searchLocations(e.target.value);
                      }}
                      InputProps={{
                        startAdornment: (
                          <LocationIcon
                            sx={{
                              color: "var(--primary)",
                              mr: 1,
                              fontSize: 16,
                            }}
                          />
                        ),
                        endAdornment: isSearching && (
                          <Typography variant="caption" color="var(--text-sub)">
                            Searching...
                          </Typography>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "14px",
                          background: "var(--bg-light)",
                          border: "none",
                          height: 44,
                          fontSize: "0.85rem",
                          transition: "all 0.3s ease",
                          "& fieldset": {
                            border: "1px solid var(--border-light)",
                          },
                          "&:hover fieldset": {
                            borderColor: "var(--primary)",
                          },
                          "&.Mui-focused fieldset": {
                            borderWidth: "2px",
                            borderColor: "var(--primary)",
                          },
                        },
                      }}
                    />

                    {/* Search Results Dropdown */}
                    {searchResults.length > 0 && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          mt: 0.5,
                          maxHeight: 150,
                          overflowY: "auto",
                          background: "var(--white)",
                          borderRadius: "12px",
                          boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
                          border: "1px solid var(--border-light)",
                          zIndex: 20,
                          scrollbarWidth: "none",
                          "&::-webkit-scrollbar": { display: "none" },
                        }}
                      >
                        {searchResults.map((result, idx) => (
                          <MenuItem
                            key={idx}
                            onClick={() => handleSearchSelect(result)}
                            sx={{
                              py: 0.8,
                              px: 1.5,
                              borderBottom:
                                idx !== searchResults.length - 1
                                  ? "1px solid var(--bg-light)"
                                  : "none",
                              "&:hover": { background: "var(--bg-light)" },
                            }}
                          >
                            <LocationIcon
                              sx={{
                                fontSize: 14,
                                mr: 1,
                                color: "var(--text-sub)",
                              }}
                            />
                            <Typography
                              variant="body2"
                              noWrap
                              sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                            >
                              {result.display_name}
                            </Typography>
                          </MenuItem>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Address Details */}
                <Box>
                  <Typography
                    variant="caption"
                    fontWeight={800}
                    color="var(--text-sub)"
                    sx={{
                      display: "block",
                      mb: 0.5,
                      textTransform: "uppercase",
                      letterSpacing: 1.2,
                      fontSize: "0.6rem",
                    }}
                  >
                    Confirm Address
                  </Typography>
                  <Box
                    sx={{
                      p: 1.5,
                      background: "var(--bg-light)",
                      borderRadius: "12px",
                      minHeight: 60,
                      maxHeight: 80,
                      overflowY: "auto",
                      fontWeight: 700,
                      color: "var(--text-main)",
                      fontSize: "0.75rem",
                      lineHeight: 1.3,
                      border: "1px solid transparent",
                      transition: "all 0.3s ease",
                      scrollbarWidth: "none",
                      "&::-webkit-scrollbar": { display: "none" },
                    }}
                  >
                    {newAddress ||
                      "Select a location on the map or use search"}
                  </Box>
                </Box>

                {/* Tags */}
                <Box>
                  <Typography
                    variant="caption"
                    fontWeight={800}
                    color="var(--text-sub)"
                    sx={{
                      display: "block",
                      mb: 0.5,
                      textTransform: "uppercase",
                      letterSpacing: 1.2,
                      fontSize: "0.6rem",
                    }}
                  >
                    Save As
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {["Home", "Work", "Other"].map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onClick={() => setLocationTag(tag)}
                        sx={{
                          flex: 1,
                          height: 32,
                          fontWeight: 800,
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "0.75rem",
                          background:
                            locationTag === tag
                              ? "var(--primary-gradient)"
                              : "var(--bg-light)",
                          color:
                            locationTag === tag ? "#ffffff" : "var(--text-sub)",
                          border: "none",
                          transition: "all 0.3s ease",
                          "& .MuiChip-label": { px: 0 },
                          "&:hover": {
                            background:
                              locationTag === tag
                                ? "var(--primary-gradient)"
                                : "var(--border-light)",
                            transform: "translateY(-1px)",
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{
                  p: 2,
                  borderTop: "1px solid var(--border-light)",
                  background: "var(--white)",
                  zIndex: 10,
                  mt: "auto", // Ensures it stays at the very bottom
                }}
              >
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => {
                    if (newAddress) {
                      addAddress(locationTag);
                      setMapPickerOpen(false);
                    } else {
                      toast.warning("Please pick a location first.");
                    }
                  }}
                  disabled={!newAddress || mapLoading}
                  sx={{
                    background: "var(--primary-gradient)",
                    color: "#ffffff !important",
                    borderRadius: "14px",
                    py: 1.4, // More compact but still prominent
                    fontWeight: 900,
                    fontSize: "1rem",
                    textTransform: "none",
                    letterSpacing: 0.5,
                    boxShadow: "0 10px 20px rgba(230, 81, 0, 0.3)",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 12px 28px rgba(230, 81, 0, 0.4)",
                      background: "var(--primary-gradient)",
                    },
                    "&:active": { transform: "translateY(0)" },
                    transition:
                      "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                  }}
                >
                  Confirm & Add Address
                </Button>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      {/* Discard Changes Confirmation */}
      <Dialog
        open={discardDialogOpen}
        onClose={() => setDiscardDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: "20px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Discard Changes?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="var(--text-sub)">
            You have unsaved changes. Are you sure you want to leave? Your
            progress will be lost.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setDiscardDialogOpen(false)}
            sx={{
              borderRadius: "10px",
              fontWeight: 700,
              color: "var(--text-sub)",
            }}
          >
            Stay Here
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate(-1)}
            sx={{
              borderRadius: "10px",
              fontWeight: 700,
              background: "#e74c3c",
              color: "white !important",
              "&:hover": { background: "#c0392b" },
            }}
          >
            Discard
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
