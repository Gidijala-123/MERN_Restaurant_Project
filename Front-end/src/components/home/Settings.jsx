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
  AccountBalanceWallet as AccountBalanceWalletIcon,
  PhotoCamera as PhotoCameraIcon,
  LocalShipping as DeliveryIcon,
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
  const initialProfileRef = useRef(null);
  const [profileForm, setProfileForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [newAddress, setNewAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);

  useEffect(() => {
    const stored = {
      name: localStorage.getItem("userName") || "",
      email: localStorage.getItem("userEmail") || "",
      phone: localStorage.getItem("userPhone") || "",
      address: localStorage.getItem("userAddress") || "",
      deliveryInstructions: localStorage.getItem("userDeliveryInstructions") || "",
      paymentMethod: localStorage.getItem("userPaymentMethod") || "Cash",
      foodType: localStorage.getItem("userFoodType") || "veg",
      deliverySpeed: localStorage.getItem("userDeliverySpeed") || "Standard",
      savedAddresses: JSON.parse(localStorage.getItem("userSavedAddresses") || "[]"),
      dietaryRestrictions: JSON.parse(localStorage.getItem("userDietaryRestrictions") || "[]"),
      referralCode: localStorage.getItem("userReferralCode") || "",
      avatar: localStorage.getItem("userAvatar") || "",
    };

    // Find a saved address matching the current primary address
    const selectedAddressId = stored.savedAddresses.find((a) => a.text === stored.address)?.id || null;

    const initialState = { ...stored, selectedAddressId };
    setProfileForm(initialState);
    initialProfileRef.current = initialState;
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const digits = phone.replace(/\D/g, "");
    return digits.length === 10;
  };

  const validateForm = () => {
    const errors = {};
    if (!profileForm.name.trim()) errors.name = "Name is required";
    if (profileForm.email && !validateEmail(profileForm.email)) errors.email = "Invalid email format";
    if (profileForm.phone && !validatePhone(profileForm.phone)) errors.phone = "Phone must be 10 digits";
    if (!profileForm.address.trim()) errors.address = "Primary address is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveProfile = () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving.");
      return;
    }

    setSaving(true);

    localStorage.setItem("userName", profileForm.name);
    localStorage.setItem("userEmail", profileForm.email);
    localStorage.setItem("userPhone", profileForm.phone);
    localStorage.setItem("userAddress", profileForm.address);
    localStorage.setItem("userDeliveryInstructions", profileForm.deliveryInstructions);
    localStorage.setItem("userPaymentMethod", profileForm.paymentMethod);
    localStorage.setItem("userFoodType", profileForm.foodType);
    localStorage.setItem("userDeliverySpeed", profileForm.deliverySpeed);
    localStorage.setItem("userSavedAddresses", JSON.stringify(profileForm.savedAddresses));
    localStorage.setItem("userDietaryRestrictions", JSON.stringify(profileForm.dietaryRestrictions));
    localStorage.setItem("userReferralCode", profileForm.referralCode);
    localStorage.setItem("userAvatar", profileForm.avatar || "");

    setTimeout(() => {
      setSaving(false);
      toast.success("Settings saved.");
      // Update baseline for dirty checking
      initialProfileRef.current = { ...profileForm };
    }, 400);
  };

  const resetProfileForm = () => {
    const stored = {
      name: localStorage.getItem("userName") || "",
      email: localStorage.getItem("userEmail") || "",
      phone: localStorage.getItem("userPhone") || "",
      address: localStorage.getItem("userAddress") || "",
      deliveryInstructions: localStorage.getItem("userDeliveryInstructions") || "",
      paymentMethod: localStorage.getItem("userPaymentMethod") || "Cash",
      foodType: localStorage.getItem("userFoodType") || "veg",
      deliverySpeed: localStorage.getItem("userDeliverySpeed") || "Standard",
      savedAddresses: JSON.parse(localStorage.getItem("userSavedAddresses") || "[]"),
      dietaryRestrictions: JSON.parse(localStorage.getItem("userDietaryRestrictions") || "[]"),
      referralCode: localStorage.getItem("userReferralCode") || "",
      avatar: localStorage.getItem("userAvatar") || "",
    };

    const selectedAddressId = stored.savedAddresses.find((a) => a.text === stored.address)?.id || null;
    setFormErrors({});
    const full = { ...stored, selectedAddressId };
    setProfileForm(full);
    initialProfileRef.current = full;
  };

  const isDirty = useMemo(() => {
    if (!initialProfileRef.current) return false;
    return JSON.stringify(profileForm) !== JSON.stringify(initialProfileRef.current);
  }, [profileForm]);

  const attemptClose = () => {
    if (isDirty) {
      setDiscardDialogOpen(true);
    } else {
      navigate("/home");
    }
  };

  const confirmDiscard = () => {
    resetProfileForm();
    setDiscardDialogOpen(false);
    navigate("/home");
  };

  const cancelDiscard = () => {
    setDiscardDialogOpen(false);
  };

  const setField = (field) => (event) => {
    const value = event.target.value;
    setProfileForm((prev) => ({ ...prev, [field]: value }));

    if (field === "address") {
      // Clear selected address when user types a custom address
      setProfileForm((prev) => ({ ...prev, selectedAddressId: null }));
    }
  };

  const addAddress = () => {
    const trimmed = newAddress.trim();
    if (!trimmed) return;
    const newEntry = { id: Date.now(), text: trimmed };
    setProfileForm((prev) => ({
      ...prev,
      savedAddresses: [...prev.savedAddresses, newEntry],
      address: trimmed,
      selectedAddressId: newEntry.id,
    }));
    setNewAddress("");
    toast.success("Address added.");
  };

  const selectAddress = (id) => {
    const found = profileForm.savedAddresses.find((a) => a.id === id);
    if (!found) return;
    setProfileForm((prev) => ({
      ...prev,
      address: found.text,
      selectedAddressId: id,
    }));
  };

  const removeAddress = (id) => {
    const updated = profileForm.savedAddresses.filter((a) => a.id !== id);
    setProfileForm((prev) => ({
      ...prev,
      savedAddresses: updated,
      selectedAddressId:
        prev.selectedAddressId === id ? null : prev.selectedAddressId,
    }));
    toast.info("Address removed.");
  };

  const avatarSizeKB = useMemo(() => {
    if (!profileForm.avatar) return 0;
    const base64String = profileForm.avatar.split(",")[1] || "";
    const sizeInBytes = (base64String.length * 3) / 4 -
      (base64String.endsWith("==") ? 2 : base64String.endsWith("=") ? 1 : 0);
    return Math.round(sizeInBytes / 1024);
  }, [profileForm.avatar]);

  const handleAvatarUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    const img = new Image();

    reader.onload = () => {
      img.onload = () => {
        const maxSize = 512;
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL("image/jpeg", 0.75);
        setProfileForm((prev) => ({ ...prev, avatar: compressed }));
      };
      img.onerror = () => {
        setProfileForm((prev) => ({ ...prev, avatar: reader.result }));
      };
      img.src = reader.result;
    };

    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setProfileForm((prev) => ({ ...prev, avatar: "" }));
    toast.info("Photo removed.");
  };

  const SectionHeader = ({ icon, title, subtitle }) => (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
        <Box sx={{
          p: 1,
          borderRadius: "10px",
          background: "var(--primary-gradient)",
          color: "white",
          display: "flex",
          boxShadow: "0 4px 10px rgba(230, 81, 0, 0.2)"
        }}>
          {React.cloneElement(icon, { fontSize: "small" })}
        </Box>
        <Typography variant="h6" fontWeight={800} color="var(--text-main)">
          {title}
        </Typography>
      </Box>
      <Typography variant="body2" color="var(--text-sub)" sx={{ ml: 6 }}>
        {subtitle}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{
      p: { xs: 2, md: 4 },
      minHeight: "100vh",
      background: "var(--bg-light)",
      transition: "background 0.3s ease",
    }}>
      <Box sx={{ maxWidth: 900, mx: "auto" }}>
        {/* Page Header */}
        <Box sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 4,
          p: 3,
          borderRadius: "20px",
          background: "var(--white)",
          boxShadow: "var(--shadow-md)",
          border: "1px solid var(--border-light)"
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton 
              onClick={attemptClose} 
              sx={{ 
                background: "var(--bg-light)",
                "&:hover": { background: "var(--border-light)" }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h4" fontWeight={900} color="var(--text-main)" sx={{ lineHeight: 1.2 }}>
                Settings
              </Typography>
              <Typography variant="body2" color="var(--text-sub)">
                Manage your profile and food preferences
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            onClick={saveProfile}
            disabled={saving}
            startIcon={<SaveIcon />}
            sx={{
              background: "var(--primary-gradient)",
              borderRadius: "12px",
              px: 3,
              py: 1,
              fontWeight: 700,
              boxShadow: "0 8px 16px rgba(230, 81, 0, 0.2)",
              "&:hover": { boxShadow: "0 12px 20px rgba(230, 81, 0, 0.3)" }
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Left Column: Profile & Photo */}
          <Grid item xs={12} md={4}>
            <Card sx={{
              borderRadius: "20px",
              height: "100%",
              boxShadow: "var(--shadow-sm)",
              border: "1px solid var(--border-light)",
              background: "var(--white)",
              overflow: "visible"
            }}>
              <CardContent sx={{ p: 4, textAlign: "center" }}>
                <Box sx={{ position: "relative", display: "inline-block", mb: 3 }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    badgeContent={
                      <IconButton
                        component="label"
                        sx={{
                          background: "var(--primary-gradient)",
                          color: "white",
                          boxShadow: "var(--shadow-md)",
                          "&:hover": { background: "var(--primary-dark)" },
                          width: 32,
                          height: 32,
                          p: 0.5
                        }}
                      >
                        <PhotoCameraIcon sx={{ fontSize: 18 }} />
                        <input hidden accept="image/*" type="file" onChange={handleAvatarUpload} />
                      </IconButton>
                    }
                  >
                    <Avatar
                      src={profileForm.avatar || undefined}
                      sx={{
                        width: 120,
                        height: 120,
                        border: "4px solid var(--white)",
                        boxShadow: "var(--shadow-md)",
                        fontSize: 48,
                        background: "var(--primary-gradient)",
                        color: "white",
                        fontWeight: 700
                      }}
                    >
                      {profileForm.name ? profileForm.name.charAt(0).toUpperCase() : "U"}
                    </Avatar>
                  </Badge>
                </Box>

                <Typography variant="h6" fontWeight={800} color="var(--text-main)">
                  {profileForm.name || "User Name"}
                </Typography>
                <Typography variant="body2" color="var(--text-sub)" sx={{ mb: 3 }}>
                  {profileForm.email || "user@example.com"}
                </Typography>

                {profileForm.avatar && (
                  <Button
                    variant="text"
                    color="error"
                    size="small"
                    onClick={removeAvatar}
                    sx={{ fontWeight: 600 }}
                  >
                    Remove Photo
                  </Button>
                )}
                
                <Divider sx={{ my: 3 }} />
                
                <Box sx={{ textAlign: "left" }}>
                  <Typography variant="caption" fontWeight={700} color="var(--text-sub)" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
                    Account Info
                  </Typography>
                  <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <EmailIcon sx={{ color: "var(--primary)", fontSize: 20 }} />
                      <Typography variant="body2" color="var(--text-main)" sx={{ fontWeight: 500 }}>
                        {profileForm.email || "Not provided"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <PhoneIcon sx={{ color: "var(--primary)", fontSize: 20 }} />
                      <Typography variant="body2" color="var(--text-main)" sx={{ fontWeight: 500 }}>
                        {profileForm.phone || "Not provided"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column: Detailed Forms */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Personal Details Section */}
              <Card sx={{ borderRadius: "20px", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-light)", background: "var(--white)" }}>
                <CardContent sx={{ p: 4 }}>
                  <SectionHeader 
                    icon={<PersonIcon />} 
                    title="Personal Information" 
                    subtitle="Update your name, contact email and phone number"
                  />
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        label="Full Name"
                        value={profileForm.name}
                        onChange={setField("name")}
                        fullWidth
                        variant="filled"
                        error={Boolean(formErrors.name)}
                        helperText={formErrors.name}
                        sx={{ 
                          "& .MuiFilledInput-root": { 
                            background: "var(--bg-light)",
                            borderRadius: "12px",
                            "&:before, &:after": { display: "none" }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Email Address"
                        value={profileForm.email}
                        onChange={setField("email")}
                        fullWidth
                        variant="filled"
                        error={Boolean(formErrors.email)}
                        helperText={formErrors.email}
                        sx={{ 
                          "& .MuiFilledInput-root": { 
                            background: "var(--bg-light)",
                            borderRadius: "12px",
                            "&:before, &:after": { display: "none" }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Phone Number"
                        value={profileForm.phone}
                        onChange={setField("phone")}
                        fullWidth
                        variant="filled"
                        error={Boolean(formErrors.phone)}
                        helperText={formErrors.phone}
                        sx={{ 
                          "& .MuiFilledInput-root": { 
                            background: "var(--bg-light)",
                            borderRadius: "12px",
                            "&:before, &:after": { display: "none" }
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Delivery Preferences Section */}
              <Card sx={{ borderRadius: "20px", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-light)", background: "var(--white)" }}>
                <CardContent sx={{ p: 4 }}>
                  <SectionHeader 
                    icon={<DeliveryIcon />} 
                    title="Delivery Preferences" 
                    subtitle="Choose your default payment method and food type"
                  />
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Default Payment"
                        value={profileForm.paymentMethod}
                        onChange={setField("paymentMethod")}
                        select
                        fullWidth
                        variant="filled"
                        sx={{ 
                          "& .MuiFilledInput-root": { 
                            background: "var(--bg-light)",
                            borderRadius: "12px",
                            "&:before, &:after": { display: "none" }
                          }
                        }}
                      >
                        {[ 
                          { value: "Cash", label: "Cash on Delivery", icon: <AttachMoneyIcon /> },
                          { value: "Card", label: "Credit / Debit Card", icon: <CreditCardIcon /> },
                          { value: "UPI", label: "UPI Payment", icon: <AccountBalanceWalletIcon /> },
                        ].map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                              {React.cloneElement(option.icon, { fontSize: "small", color: "action" })}
                              {option.label}
                            </Box>
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Food Preference"
                        value={profileForm.foodType}
                        onChange={setField("foodType")}
                        select
                        fullWidth
                        variant="filled"
                        sx={{ 
                          "& .MuiFilledInput-root": { 
                            background: "var(--bg-light)",
                            borderRadius: "12px",
                            "&:before, &:after": { display: "none" }
                          }
                        }}
                      >
                        <MenuItem value="veg">
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <FastfoodIcon fontSize="small" color="success" />
                            Veg Only
                          </Box>
                        </MenuItem>
                        <MenuItem value="nonveg">
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <FastfoodIcon fontSize="small" color="error" />
                            Non-Veg
                          </Box>
                        </MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Delivery Instructions"
                        value={profileForm.deliveryInstructions}
                        onChange={setField("deliveryInstructions")}
                        fullWidth
                        multiline
                        rows={3}
                        variant="filled"
                        placeholder="e.g. Leave at the gate, don't ring the bell..."
                        sx={{ 
                          "& .MuiFilledInput-root": { 
                            background: "var(--bg-light)",
                            borderRadius: "12px",
                            "&:before, &:after": { display: "none" }
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Saved Addresses Section */}
              <Card sx={{ borderRadius: "20px", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-light)", background: "var(--white)" }}>
                <CardContent sx={{ p: 4 }}>
                  <SectionHeader 
                    icon={<LocationIcon />} 
                    title="Saved Addresses" 
                    subtitle="Manage your delivery locations"
                  />
                  
                  <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
                    <TextField
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      placeholder="Add a new address..."
                      fullWidth
                      variant="filled"
                      sx={{ 
                        "& .MuiFilledInput-root": { 
                          background: "var(--bg-light)",
                          borderRadius: "12px",
                          "&:before, &:after": { display: "none" }
                        }
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={addAddress}
                      sx={{ 
                        background: "var(--primary-gradient)",
                        borderRadius: "12px",
                        minWidth: 100,
                        fontWeight: 700
                      }}
                    >
                      Add
                    </Button>
                  </Box>

                  <Typography variant="caption" fontWeight={700} color="var(--text-sub)" sx={{ display: "block", mb: 2, textTransform: "uppercase" }}>
                    Pick Primary Address
                  </Typography>

                  <RadioGroup
                    value={profileForm.selectedAddressId ?? ""}
                    onChange={(e) => selectAddress(Number(e.target.value))}
                    sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                  >
                    {profileForm.savedAddresses.map((addr) => (
                      <Box 
                        key={addr.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          p: 1.5,
                          borderRadius: "12px",
                          border: `1px solid ${profileForm.selectedAddressId === addr.id ? "var(--primary)" : "var(--border-light)"}`,
                          background: profileForm.selectedAddressId === addr.id ? "rgba(230, 81, 0, 0.05)" : "transparent",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <FormControlLabel
                          value={addr.id}
                          control={<Radio sx={{ color: "var(--primary)", "&.Mui-checked": { color: "var(--primary)" } }} />}
                          label={
                            <Typography variant="body2" sx={{ fontWeight: profileForm.selectedAddressId === addr.id ? 700 : 500 }}>
                              {addr.text}
                            </Typography>
                          }
                          sx={{ flex: 1, m: 0 }}
                        />
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeAddress(addr.id)}
                          sx={{ ml: 1, "&:hover": { background: "rgba(244, 67, 54, 0.1)" } }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                    {profileForm.savedAddresses.length === 0 && (
                      <Typography variant="body2" color="var(--text-sub)" sx={{ fontStyle: "italic", textAlign: "center", py: 2 }}>
                        No saved addresses yet.
                      </Typography>
                    )}
                  </RadioGroup>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Discard Changes Dialog */}
      <Dialog 
        open={discardDialogOpen} 
        onClose={cancelDiscard}
        PaperProps={{
          sx: { borderRadius: "20px", p: 1 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Discard changes?</DialogTitle>
        <DialogContent>
          <Typography color="var(--text-sub)">
            You have unsaved changes. Do you want to discard them and leave the settings page?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={cancelDiscard} 
            sx={{ color: "var(--text-main)", fontWeight: 700 }}
          >
            Keep editing
          </Button>
          <Button 
            variant="contained"
            color="error" 
            onClick={confirmDiscard}
            sx={{ borderRadius: "10px", fontWeight: 700, px: 3 }}
          >
            Discard
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
