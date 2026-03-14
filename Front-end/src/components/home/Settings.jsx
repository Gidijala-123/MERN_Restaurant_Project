import React, { useEffect, useMemo, useState } from "react";
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
} from "@mui/material";
import { Person as PersonIcon, Email as EmailIcon, Phone as PhoneIcon, LocationOn as LocationIcon, CreditCard as CreditCardIcon, Notes as NotesIcon, Add as AddIcon } from "@mui/icons-material";
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
  const [profileForm, setProfileForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [newAddress, setNewAddress] = useState("");
  const [saving, setSaving] = useState(false);

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

    setProfileForm({ ...stored, selectedAddressId });
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
    }, 400);
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
    <Box sx={{ p: 3, minHeight: "calc(100vh - 72px)" }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Manage your profile, delivery preferences, and saved addresses.
      </Typography>

      <Card variant="outlined" sx={{ mt: 2, borderRadius: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: "center" }}>
                <Avatar
                  src={profileForm.avatar || undefined}
                  sx={{ width: 96, height: 96, mx: "auto", mb: 1 }}
                >
                  {profileForm.name ? profileForm.name.charAt(0).toUpperCase() : "U"}
                </Avatar>
                <Button component="label" variant="outlined" size="small" sx={{ mt: 1 }}>
                  Change Photo
                  <input hidden accept="image/*" type="file" onChange={handleAvatarUpload} />
                </Button>
                {profileForm.avatar && (
                  <Button
                    variant="text"
                    color="error"
                    size="small"
                    sx={{ mt: 1 }}
                    onClick={removeAvatar}
                  >
                    Remove Photo
                  </Button>
                )}
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  {avatarSizeKB ? `${avatarSizeKB} KB` : "No photo"}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={8}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
                />
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Primary Address"
                value={profileForm.address}
                onChange={setField("address")}
                fullWidth
                error={Boolean(formErrors.address)}
                helperText={formErrors.address || "Select a saved address or type your location."}
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
                    <CreditCardIcon sx={{ mr: 1, color: "action.active" }} />
                  ),
                }}
              >
                {[
                  { value: "Cash", label: "Cash on Delivery" },
                  { value: "Card", label: "Credit / Debit Card" },
                  { value: "UPI", label: "UPI" },
                ].map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Saved Addresses
            </Typography>
            <FormControl component="fieldset">
              <FormLabel component="legend">Pick one to use as primary</FormLabel>
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
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                        <Typography sx={{ flex: 1, mr: 1 }}>{addr.text}</Typography>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => removeAddress(addr.id)}
                        >
                          Remove
                        </Button>
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
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={addAddress}
                sx={{ whiteSpace: "nowrap" }}
              >
                Add
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Delivery Instructions"
                value={profileForm.deliveryInstructions}
                onChange={setField("deliveryInstructions")}
                fullWidth
                multiline
                minRows={2}
                InputProps={{
                  startAdornment: (
                    <NotesIcon sx={{ mr: 1, color: "action.active" }} />
                  ),
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
              >
                <option value="veg">Veg Only</option>
                <option value="nonveg">Non-veg</option>
              </TextField>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={saveProfile}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Settings"}
            </Button>
            <Chip
              label={`Profile completion: ${Math.round(
                ([
                  profileForm.name,
                  profileForm.email,
                  profileForm.phone,
                  profileForm.address,
                  profileForm.paymentMethod,
                  profileForm.foodType,
                  profileForm.avatar,
                ].filter(Boolean).length /
                  7) *
                  100
              )}%`}
              color="primary"
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
