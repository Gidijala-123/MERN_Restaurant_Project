import React, { useState } from "react";
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
  Rating,
  Paper,
} from "@mui/material";
import { useMenu } from "../../../context/MenuContext";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useDispatch, useSelector } from "react-redux";
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
  const { cartItems } = useSelector((state) => state.cart);
  const [favoriteItems, setFavoriteItems] = useState({});

  const subCategories = getSubCategories();

  const handleAddToCart = (item) => {
    dispatch(
      addToCart({
        cartQuantity: 1,
        ...item,
        title: item.name,
        img: item.imageUrl,
        price: item.price,
      }),
    );
  };

  const handleFavoriteToggle = (itemId) => {
    setFavoriteItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

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
    Beverages: "/footer-images/drinks.jpg",
    "Cocktails/Mocktails": "/footer-images/cooldrinks.png",
    Desserts: "/footer-images/desserts.jpg",
  };

  const getFallbackImage = (item) => {
    // Prefer a local placeholder image for the category
    return FALLBACK_IMAGES[item.category] || "/footer-images/food.png";
  };

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
  const groupedItems =
    selectedCategory === "Hot Offers"
      ? { All: filteredItems }
      : subCategories.reduce((acc, subCat) => {
          acc[subCat] = filteredItems.filter(
            (item) => item.subCategory === subCat,
          );
          return acc;
        }, {});

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header for selected category */}
      <Box sx={{ mb: 4, display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: "#FF8C00",
            letterSpacing: 0.5,
          }}
        >
          {selectedCategory}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Browse our curated selection of {selectedCategory.toLowerCase()}.
        </Typography>
      </Box>

      {/* Subcategory Filter Chips */}
      {subCategories.length > 0 && (
        <Box sx={{ mb: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Chip
            label="All"
            onClick={() => handleSubCategoryChange(null)}
            variant={selectedSubCategory === null ? "filled" : "outlined"}
            color={selectedSubCategory === null ? "primary" : "default"}
            sx={{
              backgroundColor:
                selectedSubCategory === null ? "#FF8C00" : "transparent",
              color: selectedSubCategory === null ? "white" : "inherit",
              fontWeight: selectedSubCategory === null ? "600" : "400",
              cursor: "pointer",
              "&:hover": {
                backgroundColor:
                  selectedSubCategory === null ? "#e67e00" : "#f0f0f0",
              },
            }}
          />
          {subCategories.map((subCat) => (
            <Chip
              key={subCat}
              label={subCat}
              onClick={() => handleSubCategoryChange(subCat)}
              variant={selectedSubCategory === subCat ? "filled" : "outlined"}
              color={selectedSubCategory === subCat ? "primary" : "default"}
              sx={{
                backgroundColor:
                  selectedSubCategory === subCat ? "#FF8C00" : "transparent",
                color: selectedSubCategory === subCat ? "white" : "inherit",
                fontWeight: selectedSubCategory === subCat ? "600" : "400",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor:
                    selectedSubCategory === subCat ? "#e67e00" : "#f0f0f0",
                },
              }}
            />
          ))}
        </Box>
      )}

      {/* Menu Items Display */}
      {Object.entries(groupedItems).map(([subCategory, items]) => (
        <Box key={subCategory}>
          {subCategories.length > 0 && items.length > 0 && (
            <Typography
              variant="h6"
              sx={{
                my: 2,
                fontWeight: "600",
                color: "#FF8C00",
                borderBottom: "2px solid #FF8C00",
                pb: 1,
              }}
            >
              {subCategory}
            </Typography>
          )}

          <Grid container spacing={2} sx={{ mb: 3 }}>
            {items.map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                    },
                    backgroundColor: "#fff",
                    border: "1px solid #f0f0f0",
                  }}
                >
                  {/* Image Section */}
                  <Box sx={{ position: "relative", overflow: "hidden" }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={
                        item.imageUrl?.startsWith("/menu-images/")
                          ? getFallbackImage(item)
                          : item.imageUrl
                      }
                      alt={item.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getFallbackImage(item);
                      }}
                      sx={{
                        objectFit: "cover",
                        transition: "transform 0.3s",
                        "&:hover": {
                          transform: "scale(1.05)",
                        },
                      }}
                    />
                    {/* Favorite Button */}
                    <Button
                      onClick={() => handleFavoriteToggle(item.id)}
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        minWidth: 0,
                        padding: "6px",
                        backgroundColor: "rgba(255,255,255,0.9)",
                        borderRadius: "50%",
                        "&:hover": {
                          backgroundColor: "#fff",
                        },
                      }}
                    >
                      {favoriteItems[item.id] ? (
                        <FavoriteIcon sx={{ color: "#FF8C00" }} />
                      ) : (
                        <FavoriteBorderIcon />
                      )}
                    </Button>
                    {/* Veg/Non-Veg Badge */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        backgroundColor: item.veg ? "green" : "red",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {item.veg ? "Veg" : "Non-Veg"}
                    </Box>
                  </Box>

                  <CardContent sx={{ flexGrow: 1 }}>
                    {/* Name */}
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "600",
                        mb: 0.5,
                        minHeight: "2em",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                      }}
                    >
                      {item.name}
                    </Typography>

                    {/* Description */}
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        overflow: "hidden",
                        mb: 1,
                      }}
                    >
                      {item.description}
                    </Typography>

                    {/* Rating */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <Rating
                        value={item.rating}
                        readOnly
                        size="small"
                        precision={0.1}
                      />
                      <Typography variant="caption" color="textSecondary">
                        ({item.reviews})
                      </Typography>
                    </Box>

                    {/* Nutrition Info */}
                    <Box
                      sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}
                    >
                      <Chip
                        label={`${item.calories} kcal`}
                        size="small"
                        variant="outlined"
                        sx={{ height: "24px" }}
                      />
                      <Chip
                        label={`Serves ${item.serves}`}
                        size="small"
                        variant="outlined"
                        sx={{ height: "24px" }}
                      />
                    </Box>

                    {/* Price and Add Button */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mt: 2,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "700",
                          color: "#FF8C00",
                        }}
                      >
                        ₹{item.price}
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<ShoppingCartIcon />}
                        onClick={() => handleAddToCart(item)}
                        sx={{
                          backgroundColor: "#FF8C00",
                          "&:hover": {
                            backgroundColor: "#e67e00",
                          },
                          textTransform: "none",
                          fontWeight: "600",
                        }}
                      >
                        Add
                      </Button>
                    </Box>
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
