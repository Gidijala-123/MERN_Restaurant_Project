import React, { useState, useMemo, useCallback } from "react";
import { Box, Grid, Card, CardContent, Typography, Button, Chip, Container } from "@mui/material";
import { useMenu } from "../../../context/MenuContext";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import PeopleIcon from "@mui/icons-material/People";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useDispatch } from "react-redux";
import { addToCart } from "../../features/cartSlice";
import { toast } from "react-toastify";
import axios from "axios";
import "./MenuDisplay.css";

const API = (import.meta.env.VITE_API_URL || "http://localhost:1111").replace(/\/$/, "");
const isAdmin = () => localStorage.getItem("userRole") === "admin";

const MENU_CATEGORIES = [
  "Hot Offers", "Veg Starters", "Non-Veg Starters", "Tandooris", "Soups", "Salads",
  "Sandwiches", "Signature Dishes", "Biryanis", "Main Course", "Rice & Breads",
  "South Indian", "Chinese/Indo-Chinese", "Beverages", "Cocktails/Mocktails", "Desserts",
];

const FALLBACK_IMAGES = {
  "Veg Starters": "/footer-images/vegitem.jpg",
  "Non-Veg Starters": "/footer-images/nonvegitem.jpg",
  Tandooris: "/footer-images/chicken.png",
  Soups: "/footer-images/soups.jpg",
  Salads: "/footer-images/salads.jpg",
  Sandwiches: "/footer-images/burger.png",
  "Signature Dishes": "/footer-images/maincourse.jpg",
  Biryanis: "/footer-images/peppers.png",
  "Main Course": "/footer-images/maincourse.jpg",
  "Rice & Breads": "/footer-images/food.png",
  "South Indian": "/footer-images/food.png",
  Chinese: "/footer-images/chinese.png",
  "Chinese/Indo-Chinese": "/footer-images/chinese.png",
  Beverages: "/footer-images/drinks.jpg",
  "Cocktails/Mocktails": "/footer-images/cooldrinks.png",
  Desserts: "/footer-images/desserts.jpg",
};

const EMPTY_FORM = {
  name: "", category: "", subCategory: "", price: 0,
  calories: 0, serves: 1, rating: 4.0, description: "",
  imageUrl: "", veg: true, availability: true, isHotOffer: false,
};

const csrf = () =>
  fetch(`${API}/api/csrf`, { credentials: "include" }).then((r) => r.json()).catch(() => ({}));

const MenuDisplay = () => {
  const { selectedCategory, selectedSubCategory, filteredItems, handleSubCategoryChange, getSubCategories, refreshMenu } = useMenu();
  const dispatch = useDispatch();
  const admin = isAdmin();

  const [favoriteItems, setFavoriteItems] = useState(() =>
    JSON.parse(localStorage.getItem("menuFavorites") || "{}")
  );
  const [editForm, setEditForm] = useState(null); // null=closed, item=edit, EMPTY_FORM=new
  const [saving, setSaving] = useState(false);

  const subCategories = useMemo(() => getSubCategories(), [getSubCategories]);

  const getFallback = useCallback((cat) => FALLBACK_IMAGES[cat] || "/footer-images/food.png", []);

  const handleAddToCart = useCallback((item) => {
    dispatch(addToCart({ cartQuantity: 1, ...item, title: item.name, img: item.imageUrl, price: item.price }));
  }, [dispatch]);

  const handleFavoriteToggle = useCallback((itemId) => {
    const saved = JSON.parse(localStorage.getItem("menuFavorites") || "{}");
    const updated = { ...saved, [itemId]: !saved[itemId] };
    localStorage.setItem("menuFavorites", JSON.stringify(updated));
    setFavoriteItems(updated);
    window.dispatchEvent(new Event("favoritesUpdated"));
  }, []);

  const openAdd = (subCat) => {
    setEditForm({ ...EMPTY_FORM, category: selectedCategory, subCategory: subCat || "" });
  };

  const openEdit = (item) => setEditForm({ ...item });

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    const csrfData = await csrf();
    try {
      await axios.delete(`${API}/api/admin/menu/${item._id}`, {
        withCredentials: true,
        headers: { "x-csrf-token": csrfData?.csrfToken || "" },
      });
      toast.success(`"${item.name}" deleted`);
      if (refreshMenu) refreshMenu();
      else window.location.reload();
    } catch { toast.error("Delete failed"); }
  };

  const handleSave = async () => {
    if (!editForm.name || !editForm.price) {
      toast.error("Name and price are required");
      return;
    }
    setSaving(true);
    const csrfData = await csrf();
    const headers = { "Content-Type": "application/json", "x-csrf-token": csrfData?.csrfToken || "" };
    try {
      if (editForm._id) {
        await axios.put(`${API}/api/admin/menu/${editForm._id}`, editForm, { withCredentials: true, headers });
        toast.success("Item updated!");
      } else {
        await axios.post(`${API}/api/admin/menu`, editForm, { withCredentials: true, headers });
        toast.success("Item added!");
      }
      setEditForm(null);
      if (refreshMenu) refreshMenu();
      else window.location.reload();
    } catch (e) {
      toast.error(e.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const groupedItems = useMemo(() => {
    return selectedCategory === "Hot Offers"
      ? { All: filteredItems }
      : subCategories.reduce((acc, subCat) => {
        acc[subCat] = filteredItems.filter((item) => item.subCategory === subCat);
        return acc;
      }, {});
  }, [selectedCategory, filteredItems, subCategories]);

  if (filteredItems.length === 0 && !admin) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography variant="h5" color="textSecondary">No items available in this category</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className="menu-display-container">
      <Box className="category-header">
        <Typography variant="h4" className="category-title">{selectedCategory}</Typography>
        <Typography variant="body2" className="category-description">
          Browse our curated selection of {selectedCategory.toLowerCase()}.
          {admin && <span className="adm-inline-hint"> (Admin: hover cards to edit)</span>}
        </Typography>
      </Box>

      {subCategories.length > 0 && (
        <Box className="subcategory-filter-container">
          <Chip label="All" onClick={() => handleSubCategoryChange(null)} className={`filter-chip ${selectedSubCategory === null ? "active" : ""}`} />
          {subCategories.map((subCat) => (
            <Chip key={subCat} label={subCat} onClick={() => handleSubCategoryChange(subCat)} className={`filter-chip ${selectedSubCategory === subCat ? "active" : ""}`} />
          ))}
        </Box>
      )}

      {Object.entries(groupedItems).map(([subCategory, items]) => (
        <Box key={subCategory}>
          {subCategories.length > 0 && (items.length > 0 || admin) && (
            <Typography variant="h6" className="subcategory-title">{subCategory}</Typography>
          )}

          <Grid container spacing={2} sx={{ mb: 2 }}>
            {items.map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.id || item._id}>
                <Card className={`food-card ${admin ? "food-card--admin" : ""}`}>
                  {/* Admin overlay */}
                  {admin && (
                    <div className="admin-card-overlay">
                      <button className="admin-card-btn admin-edit-btn" onClick={() => openEdit(item)} title="Edit">
                        <EditIcon fontSize="small" /> Edit
                      </button>
                      <button className="admin-card-btn admin-del-btn" onClick={() => handleDelete(item)} title="Delete">
                        <DeleteIcon fontSize="small" /> Delete
                      </button>
                    </div>
                  )}

                  <div className="card-image-wrapper">
                    <img
                      src={item.imageUrl?.startsWith("/menu-images/") ? getFallback(item.category) : item.imageUrl}
                      alt={item.name}
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = getFallback(item.category); }}
                      loading="lazy"
                    />
                    <div className="card-badges">
                      <div className="veg-badge">
                        <div className={item.veg ? "veg-icon" : "non-veg-icon"} />
                        <span className="veg-text">{item.veg ? "Veg" : "Non-Veg"}</span>
                      </div>
                    </div>
                    {!admin && (
                      <div className="favorite-btn-wrapper">
                        <Button onClick={() => handleFavoriteToggle(item.id)} className={`floating-fav-btn ${favoriteItems[item.id] ? "active" : ""}`}>
                          {favoriteItems[item.id] ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                        </Button>
                      </div>
                    )}
                  </div>

                  <CardContent className="food-card-content">
                    <Typography variant="h6" className="food-name">{item.name}</Typography>
                    <Typography variant="body2" className="food-description">
                      {item.description || `Delicious ${item.name} prepared with fresh ingredients.`}
                    </Typography>
                    <div className="food-meta">
                      <div className="meta-item">
                        <LocalFireDepartmentIcon className="meta-icon" sx={{ color: "#ff7043" }} />
                        <span>{item.calories || 250} kcal</span>
                      </div>
                      <div className="meta-item">
                        <PeopleIcon className="meta-icon" sx={{ color: "#4fc3f7" }} />
                        <span>Serves {item.serves || 1}</span>
                      </div>
                    </div>
                    <div className="card-footer">
                      <Typography variant="h6" className="food-price"><span>₹</span>{item.price}</Typography>
                      {!admin && (
                        <Button variant="contained" startIcon={<ShoppingCartIcon />} onClick={() => handleAddToCart(item)} className="add-btn">Add</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Grid>
            ))}

            {/* + Add Item card — admin only */}
            {admin && (
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Card className="food-card add-item-card" onClick={() => openAdd(subCategory === "All" ? "" : subCategory)}>
                  <div className="add-item-inner">
                    <AddIcon sx={{ fontSize: 40, color: "var(--primary)", mb: 1 }} />
                    <Typography fontWeight={700} color="var(--primary)">Add Item</Typography>
                    {subCategory !== "All" && <Typography variant="caption" color="text.secondary">{subCategory}</Typography>}
                  </div>
                </Card>
              </Grid>
            )}
          </Grid>
        </Box>
      ))}

      {/* Edit / Add Modal */}
      {editForm && (
        <div className="adm-modal-overlay" onClick={() => setEditForm(null)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580 }}>
            <div className="adm-modal-header">
              <h3>{editForm._id ? `Edit: ${editForm.name}` : "Add New Item"}</h3>
              <button className="adm-modal-close" onClick={() => setEditForm(null)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-form-grid">
                {[
                  { key: "name", label: "Name", type: "text" },
                  { key: "price", label: "Price (₹)", type: "number" },
                  { key: "calories", label: "Calories", type: "number" },
                  { key: "serves", label: "Serves", type: "number" },
                  { key: "rating", label: "Rating (0-5)", type: "number" },
                  { key: "imageUrl", label: "Image URL", type: "text" },
                ].map(({ key, label, type }) => (
                  <div key={key} className="adm-form-field">
                    <label>{label}</label>
                    <input type={type} value={editForm[key] || ""} onChange={(e) => setEditForm({ ...editForm, [key]: type === "number" ? Number(e.target.value) : e.target.value })} />
                  </div>
                ))}
                <div className="adm-form-field">
                  <label>Category</label>
                  <select value={editForm.category || ""} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}>
                    {MENU_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="adm-form-field">
                  <label>Sub Category</label>
                  <input type="text" value={editForm.subCategory || ""} onChange={(e) => setEditForm({ ...editForm, subCategory: e.target.value })} />
                </div>
                <div className="adm-form-field adm-form-full">
                  <label>Description</label>
                  <textarea rows={2} value={editForm.description || ""} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                </div>
                <div className="adm-form-checks">
                  {[["veg", "Vegetarian"], ["availability", "Available"], ["isHotOffer", "Hot Offer"]].map(([k, l]) => (
                    <label key={k} className="adm-check-label">
                      <input type="checkbox" checked={!!editForm[k]} onChange={(e) => setEditForm({ ...editForm, [k]: e.target.checked })} />
                      {l}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="adm-modal-footer">
              <button className="adm-btn-secondary" onClick={() => setEditForm(null)}>Cancel</button>
              <button className="adm-btn-primary" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : editForm._id ? "Update" : "Create"}</button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default MenuDisplay;
