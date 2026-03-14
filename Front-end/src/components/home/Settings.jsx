  // Handler for Cancel button
  const handleCancel = () => {
    navigate("/home");
  };
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
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

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

  return (
    <Box sx={{
      p: 3,
      minHeight: "calc(100vh - 72px)",
      background: "linear-gradient(135deg, #fff7f0 0%, #ffe0c3 100%)",
      transition: 'background 0.5s',
    }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <SettingsIcon sx={{ color: 'var(--primary)', fontSize: 40, mr: 1, filter: 'drop-shadow(0 2px 6px #ffb36688)' }} />
          <Box>
            <Typography variant="h4" fontWeight={900} sx={{ color: 'var(--text-main)', letterSpacing: 1, textShadow: '0 2px 8px #fff3' }} gutterBottom>
              Settings
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--primary)', fontWeight: 600, opacity: 0.85, fontSize: 18 }} gutterBottom>
              Manage your profile, delivery preferences, and saved addresses.
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={attemptClose} sx={{ color: 'var(--primary)', background: 'var(--white)', boxShadow: 'var(--shadow-sm)', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 'var(--shadow-md)', background: 'var(--primary)', color: 'var(--white)' } }} aria-label="Close settings">
          <CloseIcon />
        </IconButton>
      </Box>

      <Card
        variant="outlined"
        sx={{
          mt: 2,
          borderRadius: 6,
          boxShadow: '0 8px 32px 0 #ffb36633',
          border: '1.5px solid #ffd6a0',
          background: 'rgba(255,255,255,0.98)',
          transition: 'box-shadow 0.3s, transform 0.2s',
          '&:hover': {
            boxShadow: '0 16px 48px 0 #ffb36655',
            transform: 'scale(1.01)',
          },
        }}
      >
        <CardContent sx={{
          background: 'transparent',
          borderRadius: 3,
          boxShadow: 'none',
          mb: 2,
          p: 3,
          animation: 'fade-in 0.7s',
        }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: "center", pb: 2, borderRight: { md: '1.5px solid #ffe0c3' }, pr: { md: 3 } }}>
                <Avatar
                  src={profileForm.avatar || undefined}
                  sx={{
                    width: 110,
                    height: 110,
                    mx: "auto",
                    mb: 1,
                    boxShadow: '0 4px 24px #ffb36644',
                    border: '3px solid #ffd6a0',
                    fontSize: 40,
                    background: '#fff7f0',
                  }}
                >
                  {profileForm.name ? profileForm.name.charAt(0).toUpperCase() : "U"}
                </Avatar>
                <Button component="label" variant="outlined" size="small" sx={{ mt: 1, color: 'var(--primary)', borderColor: 'var(--primary)', fontWeight: 700, letterSpacing: 1, background: '#fff7f0', '&:hover': { background: 'var(--primary)', color: 'var(--white)', borderColor: 'var(--primary-dark)' } }}>
                  Change Photo
                  <input hidden accept="image/*" type="file" onChange={handleAvatarUpload} />
                </Button>
                {profileForm.avatar && (
                  <Button
                    variant="text"
                    color="error"
                    size="small"
                    sx={{ mt: 1, color: 'var(--primary)', '&:hover': { color: 'var(--primary-dark)' }, fontWeight: 600 }}
                    onClick={removeAvatar}
                  >
                    Remove Photo
                  </Button>
                )}
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1, fontSize: 15, opacity: 0.7 }}>
                  {avatarSizeKB ? `${avatarSizeKB} KB` : "No photo"}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={8}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pl: { md: 3 } }}>
                <TextField
                  label="Full Name"
                  value={profileForm.name}
                  onChange={setField("name")}
                  fullWidth
                  error={Boolean(formErrors.name)}
                  helperText={formErrors.name}
                  InputProps={{
                    startAdornment: (
                      <PersonIcon sx={{ mr: 1, color: "action.active" }} />
                    ),
                  }}
                  sx={{
                    background: '#fff7f0',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
                <TextField
                  label="Email"
                  value={profileForm.email}
                  onChange={setField("email")}
                  fullWidth
                  error={Boolean(formErrors.email)}
                  helperText={formErrors.email}
                  InputProps={{
                    startAdornment: (
                      <EmailIcon sx={{ mr: 1, color: "action.active" }} />
                    ),
                  }}
                  sx={{
                    background: '#fff7f0',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
                <TextField
                  label="Phone"
                  value={profileForm.phone}
                  onChange={setField("phone")}
                  fullWidth
                  error={Boolean(formErrors.phone)}
                  helperText={formErrors.phone}
                  InputProps={{
                    startAdornment: (
                      <PhoneIcon sx={{ mr: 1, color: "action.active" }} />
                    ),
                  }}
                  sx={{
                    background: '#fff7f0',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3, borderColor: '#ffd6a0' }} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Primary Address"
                value={profileForm.address}
                onChange={setField("address")}
                fullWidth
                error={Boolean(formErrors.address)}
                helperText={formErrors.address || "Select a saved address or type your location. You can also pick a location on the map below."}
                InputProps={{
                  startAdornment: (
                    <LocationIcon sx={{ mr: 1, color: "action.active" }} />
                  ),
                }}
              />

            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Payment Method"
                value={profileForm.paymentMethod}
                onChange={setField("paymentMethod")}
                select
                fullWidth
                InputProps={{
                  startAdornment: (
                    profileForm.paymentMethod === "Cash" ? (
                      <AttachMoneyIcon sx={{ mr: 1, color: "action.active" }} />
                    ) : profileForm.paymentMethod === "Card" ? (
                      <CreditCardIcon sx={{ mr: 1, color: "action.active" }} />
                    ) : profileForm.paymentMethod === "UPI" ? (
                      <AccountBalanceWalletIcon sx={{ mr: 1, color: "action.active" }} />
                    ) : (
                      <PaymentIcon sx={{ mr: 1, color: "action.active" }} />
                    )
                  ),
                }}
              >
                {[ 
                  { value: "Cash", label: "Cash on Delivery" },
                  { value: "Card", label: "Credit / Debit Card" },
                  { value: "UPI", label: "UPI" },
                ].map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Typography>{option.label}</Typography>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <LocationIcon sx={{ color: 'var(--primary)', fontSize: 24, filter: 'drop-shadow(0 2px 6px #ffb36688)' }} />
              <Typography variant="h6" fontWeight={900} sx={{ color: 'var(--primary)', letterSpacing: 1, textShadow: '0 2px 8px #fff3' }} gutterBottom>
                Saved Addresses
              </Typography>
            </Box>
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ fontWeight: 700, color: 'var(--primary)', mb: 1 }}>Pick one to use as primary</FormLabel>
              <RadioGroup
                value={profileForm.selectedAddressId ?? ""}
                onChange={(e) => selectAddress(Number(e.target.value))}
              >
                {profileForm.savedAddresses.map((addr) => (
                  <FormControlLabel
                    key={addr.id}
                    value={addr.id}
                    control={<Radio />}
                    label={
                      <Box sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        px: 1,
                        borderRadius: 2,
                        transition: 'background 0.2s',
                        '&:hover': { background: '#fff7f0' },
                      }}>
                        <Box sx={{ display: "flex", alignItems: "center", flex: 1, mr: 1 }}>
                          <LocationIcon sx={{ mr: 1, color: "action.active" }} />
                          <Typography sx={{ wordBreak: "break-word" }}>{addr.text}</Typography>
                        </Box>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeAddress(addr.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    }
                  />
                ))}
              </RadioGroup>
            </FormControl>

            <Box sx={{ display: "flex", gap: 1, mt: 2, alignItems: "flex-start" }}>
              <TextField
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="Add new address"
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <LocationIcon sx={{ mr: 1, color: "action.active" }} />
                  ),
                }}
                sx={{
                  background: '#fff7f0',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={addAddress}
                sx={{ whiteSpace: "nowrap", background: 'var(--primary)', color: 'var(--white)', fontWeight: 700, letterSpacing: 1, '&:hover': { background: 'var(--primary-dark)' } }}
              >
                Add
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 3, borderColor: '#ffd6a0' }} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Delivery Instructions"
                value={profileForm.deliveryInstructions}
                onChange={setField("deliveryInstructions")}
                fullWidth
                multiline
                minRows={1}
                InputProps={{
                  startAdornment: (
                    <NotesIcon sx={{ mr: 1, color: "action.active" }} />
                  ),
                }}
                sx={{
                  height: 56,
                  background: '#fff7f0',
                  borderRadius: 2,
                  '& .MuiInputBase-root': {
                    height: 56,
                    alignItems: 'center',
                    borderRadius: 2,
                  },
                  '& .MuiInputBase-inputMultiline': {
                    padding: '0 14px',
                    height: '100% !important',
                    minHeight: '0 !important',
                    display: 'flex',
                    alignItems: 'center',
                  },
                  '& textarea': {
                    height: '100% !important',
                    minHeight: '0 !important',
                    padding: '0 14px',
                    boxSizing: 'border-box',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Food Preference"
                select
                value={profileForm.foodType}
                onChange={setField("foodType")}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <FastfoodIcon sx={{ mr: 1, color: "action.active" }} />
                  ),
                }}
                sx={{
                  height: 56,
                  background: '#fff7f0',
                  borderRadius: 2,
                  '& .MuiInputBase-root': {
                    height: 56,
                    alignItems: 'center',
                    borderRadius: 2,
                  },
                  '& .MuiInputBase-input': {
                    padding: '0 14px',
                  },
                }}
              >
                <MenuItem value="veg">
                  <Typography>Veg Only</Typography>
                </MenuItem>
                <MenuItem value="nonveg">
                  <Typography>Non-veg</Typography>
                </MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleCancel}
              startIcon={<ArrowBackIcon />}
              sx={{
                color: 'var(--primary)',
                borderColor: 'var(--primary)',
                fontWeight: 700,
                letterSpacing: 1,
                background: '#fff7f0',
                '&:hover': { background: 'var(--primary)', color: 'var(--white)', borderColor: 'var(--primary-dark)' },
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={saveProfile}
              disabled={saving}
              startIcon={<SaveIcon />}
              sx={{
                background: 'var(--primary)',
                color: 'var(--white)',
                fontWeight: 700,
                letterSpacing: 1,
                boxShadow: '0 2px 8px #ffb36655',
                '&:hover': { background: 'var(--primary-dark)' },
              }}
            >
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Dialog open={discardDialogOpen} onClose={cancelDiscard}>
        <DialogTitle>Discard changes?</DialogTitle>
        <DialogContent>
          <Typography>
            You have unsaved changes. Do you want to discard them and leave the Settings page?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDiscard} sx={{ color: 'var(--primary)', '&:hover': { color: 'var(--primary-dark)' } }}>Keep editing</Button>
          <Button color="error" onClick={confirmDiscard}>
            Discard
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
