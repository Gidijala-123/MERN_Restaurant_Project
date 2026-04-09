import React, { useMemo } from "react";
import { Box, Typography, Button, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import HeartBrokenIcon from "@mui/icons-material/HeartBroken";
import { useGetAllProductsQuery } from "../features/productsApi";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../features/cartSlice";
import { MENU_DATA } from "../../data/menuData";
import { DISCOUNT_SALE_ITEMS } from "../../data/discountItems";
import { useMenu } from "../../context/MenuContext";
import useFavorites from "../../hooks/useFavorites";
import "./Favorites.css";

const FALLBACK_IMAGES = {
  "Veg Starters": "/footer-images/vegitem.jpg",
  "Non-Veg Starters": "/footer-images/nonvegitem.jpg",
  "Tandooris": "/footer-images/chicken.png",
  "Soups": "/footer-images/soups.jpg",
  "Salads": "/footer-images/salads.jpg",
  "Sandwiches": "/footer-images/burger.png",
  "Signature Dishes": "/footer-images/maincourse.jpg",
  "Biryanis": "/footer-images/peppers.png",
  "Main Course": "/footer-images/maincourse.jpg",
  "Rice & Breads": "/footer-images/food.png",
  "South Indian": "/footer-images/food.png",
  "Chinese/Indo-Chinese": "/footer-images/chinese.png",
  "Beverages": "/footer-images/drinks.jpg",
  "Cocktails/Mocktails": "/footer-images/cooldrinks.png",
  "Desserts": "/footer-images/desserts.jpg",
};

// Same logic as MenuDisplay — use imageUrl directly, fall back to category image on error
const getFallback = (category) => FALLBACK_IMAGES[category] || "/footer-images/food.png";
const getImageSrc = (item) => item?.imageUrl || item?.img || item?.image || getFallback(item?.category);

export default function Favorites() {
  const { data = [], isLoading } = useGetAllProductsQuery();
  const { allItems: liveMenuData = MENU_DATA } = useMenu();
  const { favorites: menuFavorites, remove: removeFav, loaded: favsLoaded, ids: favIds } = useFavorites();
  // Show loader only if we have no local data yet (first ever load)
  const hasLocalData = favIds.length > 0;

  const resolveImageSrc = getImageSrc;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const favorites = useMemo(() => {
    const list = [];
    const seen = new Set();

    const getKey = (item) => String(item?.itemId ?? item?.id ?? item?._id ?? "");
    const isBookmarked = (item) => {
      const key = getKey(item);
      return key !== "" && menuFavorites[key] === true;
    };

    // Search all possible sources — liveMenuData (DB-merged), raw MENU_DATA (fallback), API products, discount items
    const allSources = [
      ...liveMenuData,
      ...MENU_DATA,           // fallback if liveMenuData hasn't loaded from API yet
      ...(data || []),        // RTK Query API products
      ...DISCOUNT_SALE_ITEMS, // hardcoded frontend-only items
    ];

    allSources.forEach((item) => {
      if (!isBookmarked(item)) return;
      const key = getKey(item);
      if (seen.has(key)) return;
      seen.add(key);
      list.push({ ...item, title: item.name || item.title, desc: item.description });
    });

    return list;
  }, [data, liveMenuData, menuFavorites]);

  const toggleFavorite = (item) => {
    const id = String(item?.itemId ?? item?.id ?? item?._id ?? "");
    removeFav(id);
  };

  const handleAddToCart = (item) => {
    dispatch(
      addToCart({
        id: item.id,
        title: item.title || item.name,
        price: item.newPrice || item.price,
        img: item.img || item.image,
        cartQuantity: 1,
      })
    );
  };

  return (
    <div className="favorites-container">
      <div className="favorites-header">
        <IconButton onClick={() => navigate("/home")} className="back-btn">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" className="favorites-title">
          My Favorites
        </Typography>
      </div>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontWeight: 500 }}>
        Discover the items you love the most, all in one place.
      </Typography>

      {(isLoading || (!favsLoaded && !hasLocalData)) ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <video width="320" height="180" autoPlay loop muted style={{ borderRadius: '20px' }}>
            <source src="/footer-images/loading.mp4" type="video/mp4" />
          </video>
        </Box>
      ) : favorites.length === 0 ? (
        <div className="empty-favorites">
          <HeartBrokenIcon className="empty-fav-icon" />
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: 'var(--text-main)' }}>
            Your favorites list is empty
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
            Looks like you haven't bookmarked anything yet. Explore our menu and save your favorite dishes!
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/home")}
            sx={{
              borderRadius: "15px",
              px: 4,
              py: 1.5,
              fontWeight: 800,
              background: 'var(--primary-gradient)',
              boxShadow: '0 8px 20px rgba(230, 81, 0, 0.2)'
            }}
          >
            Explore Menu
          </Button>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map((item) => (
            <div key={String(item._id || item.id)} className="favorite-card-wrapper">
              <div className="favorite-card">
                <div className="favorite-image-wrapper">
                  <img
                    src={resolveImageSrc(item)}
                    alt={item.title || item.name}
                    loading="lazy"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = getFallback(item.category); }}
                  />
                  <div className="favorite-badges">
                    <span className="section-badge">{item.category}</span>
                    {item.discount && <span className="fav-badge">{item.discount}</span>}
                  </div>
                </div>

                <div className="favorite-content">
                  <Typography className="favorite-item-title">
                    {item.title || item.name}
                  </Typography>
                  <Typography className="favorite-item-desc">
                    {item.desc || item.description || "Indulge in this delicious selection, crafted with fresh ingredients and authentic flavors."}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: 'var(--primary)' }}>
                      ₹{item.newPrice || item.price}
                    </Typography>
                    {item.oldPrice && (
                      <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'var(--text-sub)', opacity: 0.6 }}>
                        ₹{item.oldPrice}
                      </Typography>
                    )}
                  </Box>
                </div>

                <div className="favorite-actions">
                  <Button
                    className="remove-fav-btn"
                    startIcon={<DeleteOutlineIcon />}
                    onClick={() => toggleFavorite(item)}
                  >
                    Remove
                  </Button>
                  <Button
                    className="add-to-cart-btn"
                    startIcon={<ShoppingBagIcon />}
                    onClick={() => handleAddToCart(item)}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
