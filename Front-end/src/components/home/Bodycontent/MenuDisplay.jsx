import React, { useState, useMemo, useCallback } from "react";
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Chip,
  Container,
} from "@mui/material";
import { useMenu } from "../../../context/MenuContext";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import PeopleIcon from "@mui/icons-material/People";
import { useDispatch } from "react-redux";
import { addToCart } from "../../features/cartSlice";
import "./MenuDisplay.css";

const MenuDisplay = () => {
  const {
    selectedCategory,
    selectedSubCategory,
    filteredItems,
    handleSubCategoryChange,
    getSubCategories,
  } = useMenu();

  const dispatch = useDispatch();
  const [favoriteItems, setFavoriteItems] = useState(() => {
    return JSON.parse(localStorage.getItem("menuFavorites") || "{}");
  });

  const subCategories = useMemo(() => getSubCategories(), [getSubCategories]);

  const CATEGORY_ICONS = useMemo(() => ({
    "Veg Starters": "🥗",
    "Non-Veg Starters": "🍗",
    Tandooris: "🔥",
    Soups: "🥣",
    Salads: "🥗",
    Sandwiches: "🥪",
    "Signature Dishes": "🏆",
    Biryanis: "🍚",
    "Main Course": "🍛",
    "Rice & Breads": "🥖",
    "South Indian": "🍛",
    Chinese: "🥡",
    Beverages: "🥤",
    "Cocktails/Mocktails": "🍸",
    Desserts: "🍰",
  }), []);

  const handleAddToCart = useCallback((item) => {
    dispatch(
      addToCart({
        cartQuantity: 1,
        ...item,
        title: item.name,
        img: item.imageUrl,
        price: item.price,
      }),
    );
  }, [dispatch]);

  const handleFavoriteToggle = useCallback((itemId) => {
    const saved = JSON.parse(localStorage.getItem("menuFavorites") || "{}");
    const updated = { ...saved, [itemId]: !saved[itemId] };
    
    // 1. Update localStorage synchronously first
    localStorage.setItem("menuFavorites", JSON.stringify(updated));
    
    // 2. Update React state
    setFavoriteItems(updated);
    
    // 3. Dispatch event to update navbar favorites count
    window.dispatchEvent(new Event("favoritesUpdated"));
  }, []);

  const FALLBACK_IMAGES = useMemo(() => ({
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
    Beverages: "/footer-images/drinks.jpg",
    "Cocktails/Mocktails": "/footer-images/cooldrinks.png",
    Desserts: "/footer-images/desserts.jpg",
  }), []);

  const getFallbackImage = useCallback((category) => {
    // Prefer a local placeholder image for the category
    return FALLBACK_IMAGES[category] || "/footer-images/food.png";
  }, [FALLBACK_IMAGES]);

  if (filteredItems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography variant="h5" color="textSecondary">
            No items available in this category
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Try selecting a different menu item from the left sidebar.
          </Typography>
        </Box>
      </Container>
    );
  }

  // Group items by subcategory if applicable
  const groupedItems = useMemo(() => {
    return selectedCategory === "Hot Offers"
      ? { All: filteredItems }
      : subCategories.reduce((acc, subCat) => {
          acc[subCat] = filteredItems.filter(
            (item) => item.subCategory === subCat,
          );
          return acc;
        }, {});
  }, [selectedCategory, filteredItems, subCategories]);

  return (
    <Container maxWidth="lg" className="menu-display-container">
      {/* Header for selected category */}
      <Box className="category-header">
        <Typography variant="h4" className="category-title">
          {selectedCategory}
        </Typography>
        <Typography variant="body2" className="category-description">
          Browse our curated selection of {selectedCategory.toLowerCase()}.
        </Typography>
      </Box>

      {/* Subcategory Filter Chips */}
      {subCategories.length > 0 && (
        <Box className="subcategory-filter-container">
          <Chip
            label="All"
            onClick={() => handleSubCategoryChange(null)}
            className={`filter-chip ${selectedSubCategory === null ? "active" : ""}`}
          />
          {subCategories.map((subCat) => (
            <Chip
              key={subCat}
              label={subCat}
              onClick={() => handleSubCategoryChange(subCat)}
              className={`filter-chip ${selectedSubCategory === subCat ? "active" : ""}`}
            />
          ))}
        </Box>
      )}

      {/* Menu Items Display */}
      {Object.entries(groupedItems).map(([subCategory, items]) => (
        <Box key={subCategory}>
          {subCategories.length > 0 && items.length > 0 && (
            <Typography variant="h6" className="subcategory-title">
              {subCategory}
            </Typography>
          )}

          <Grid container spacing={3} sx={{ mb: 5 }}>
            {items.map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                <Card className="food-card">
                  {/* Image Section */}
                  <div className="card-image-wrapper">
                    <img
                      src={
                        item.imageUrl?.startsWith("/menu-images/")
                          ? getFallbackImage(item.category)
                          : item.imageUrl
                      }
                      alt={item.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getFallbackImage(item.category);
                      }}
                      loading="lazy"
                    />
                    
                    {/* Floating Badges */}
                    <div className="card-badges">
                      <div className="veg-badge">
                        <div className={item.veg ? "veg-icon" : "non-veg-icon"}></div>
                        <span className="veg-text">{item.veg ? "Veg" : "Non-Veg"}</span>
                      </div>
                    </div>

                    {/* Favorite Button */}
                    <div className="favorite-btn-wrapper">
                      <Button
                        onClick={() => handleFavoriteToggle(item.id)}
                        className={`floating-fav-btn ${favoriteItems[item.id] ? "active" : ""}`}
                      >
                        {favoriteItems[item.id] ? (
                          <FavoriteIcon />
                        ) : (
                          <FavoriteBorderIcon />
                        )}
                      </Button>
                    </div>
                  </div>

                  <CardContent className="food-card-content">
                    <div className="card-title-row">
                      <Typography variant="h6" className="food-name">
                        {item.name}
                      </Typography>
                    </div>

                    <Typography variant="body2" className="food-description">
                      {item.description || `Delicious ${item.name} prepared with fresh ingredients and authentic spices.`}
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
                      <Typography variant="h6" className="food-price">
                        <span>₹</span>{item.price}
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<ShoppingCartIcon />}
                        onClick={() => handleAddToCart(item)}
                        className="add-btn"
                      >
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Container>
  );
};

export default MenuDisplay;
