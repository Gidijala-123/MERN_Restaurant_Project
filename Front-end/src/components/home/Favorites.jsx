import React, { useEffect, useMemo, useState } from "react";
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
import { useMenu } from "../../context/MenuContext";
import "./Favorites.css";

export default function Favorites() {
  const { data = [], isLoading } = useGetAllProductsQuery();
  const { allItems: liveMenuData = MENU_DATA } = useMenu();

  const resolveImageSrc = (item) => {
    // Prefer explicit image fields.
    const candidate = item?.image || item?.img || item?.imageUrl;

    // If candidate is from /menu-images, map it to a real public image (menu-images isn't included in build).
    if (candidate?.startsWith("/menu-images/")) {
      const filename = candidate.split("/").pop()?.toLowerCase();
      const mapped = {
        "samosa.jpg": "/footer-images/vegitem.jpg",
        "paneer-tikka.jpg": "/footer-images/vegitem.jpg",
        "spring-rolls.jpg": "/footer-images/veggies.jpg",
        "aloo-tikki.jpg": "/footer-images/vegitem.jpg",
        "corn-fritters.jpg": "/footer-images/vegitem.jpg",
        "chicken-tikka.jpg": "/footer-images/chicken.png",
        "tandoori-prawns.jpg": "/footer-images/chicken.png",
        "fish-amritsari.jpg": "/footer-images/seafood.jpg",
        "chicken-pakora.jpg": "/footer-images/chicken.png",
        "mutton-seekh.jpg": "/footer-images/meat.png",
        "tandoori-chicken-half.jpg": "/footer-images/meat.png",
        "tandoori-fish.jpg": "/footer-images/seafood.jpg",
        "tandoori-mushroom.jpg": "/footer-images/vegitem.jpg",
        "tandoori-paneer.jpg": "/footer-images/vegitem.jpg",
        "tomato-soup.jpg": "/footer-images/soups.jpg",
        "chicken-soup.jpg": "/footer-images/soups.jpg",
        "mulligatawny.jpg": "/footer-images/soups.jpg",
        "veg-soup.jpg": "/footer-images/soups.jpg",
        "greek-salad.jpg": "/footer-images/salads.jpg",
        "chicken-salad.jpg": "/footer-images/salads.jpg",
        "caesar-salad.jpg": "/footer-images/salads.jpg",
        "veg-manchurian.jpg": "/footer-images/veggies.jpg",
        "chicken-manchurian.jpg": "/footer-images/chicken.png",
        "veg-fried-rice.jpg": "/footer-images/food.png",
        "chicken-fried-rice.jpg": "/footer-images/food.png",
        "paneer-butter-masala.jpg": "/footer-images/food.png",
        "butter-chicken.jpg": "/footer-images/chicken.png",
        "mutton-biryani.jpg": "/footer-images/chicken.png",
        "hyd-biryani.jpg": "/footer-images/chicken.png",
        "gulab-jamun.jpg": "/footer-images/desserts.jpg",
        "rasmalai.jpg": "/footer-images/desserts.jpg",
        "kheer.jpg": "/footer-images/desserts.jpg",
        "ice-cream.jpg": "/footer-images/ice_cream.jpg",
      }[filename];

      if (mapped) return mapped;
      return `https://source.unsplash.com/600x400/?${encodeURIComponent(item?.name || item?.title || "food")}`;
    }
    return candidate || "/footer-images/food.png";
  };

  const [discountBookmarked, setDiscountBookmarked] = useState({});
  const [trendingBookmarked, setTrendingBookmarked] = useState({});
  const [offerBookmarked, setOfferBookmarked] = useState({});
  const [popularBookmarked, setPopularBookmarked] = useState({});
  const [recentBookmarked, setRecentBookmarked] = useState({});
  const [menuFavorites, setMenuFavorites] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const loadBookmarks = () => {
      const savedDiscount = JSON.parse(localStorage.getItem("discountBookmarked") || "{}");
      const savedTrending = JSON.parse(localStorage.getItem("trendingBookmarked") || "{}");
      const savedOffer = JSON.parse(localStorage.getItem("offerBookmarked") || "{}");
      const savedPopular = JSON.parse(localStorage.getItem("popularBookmarked") || "{}");
      const savedRecent = JSON.parse(localStorage.getItem("recentBookmarked") || "{}");
      const savedMenu = JSON.parse(localStorage.getItem("menuFavorites") || "{}");
      setDiscountBookmarked(savedDiscount);
      setTrendingBookmarked(savedTrending);
      setOfferBookmarked(savedOffer);
      setPopularBookmarked(savedPopular);
      setRecentBookmarked(savedRecent);
      setMenuFavorites(savedMenu);
    };

    loadBookmarks();
    window.addEventListener("favoritesUpdated", loadBookmarks);
    window.addEventListener("storage", loadBookmarks);

    return () => {
      window.removeEventListener("favoritesUpdated", loadBookmarks);
      window.removeEventListener("storage", loadBookmarks);
    };
  }, []);

  const favorites = useMemo(() => {
    const list = [];

    const isItemBookmarked = (id) => {
      const idStr = String(id).trim();
      return trendingBookmarked[idStr] ||
        discountBookmarked[idStr] ||
        offerBookmarked[idStr] ||
        popularBookmarked[idStr] ||
        recentBookmarked[idStr] ||
        menuFavorites[idStr];
    };

    const getBookmarkSection = (id) => {
      const idStr = String(id).trim();
      if (trendingBookmarked[idStr]) return "Trending";
      if (offerBookmarked[idStr]) return "Offer";
      if (popularBookmarked[idStr]) return "Popular";
      if (recentBookmarked[idStr]) return "Recent";
      if (discountBookmarked[idStr]) return "Discount";
      if (menuFavorites[idStr]) return "Menu";
      return "";
    };

    liveMenuData.forEach((item) => {
      if (isItemBookmarked(item.id)) {
        list.push({
          ...item,
          section: getBookmarkSection(item.id),
          title: item.name,
          img: item.imageUrl,
          desc: item.description
        });
      }
    });

    data?.forEach((product) => {
      if (list.some(existing => String(existing.id).trim() === String(product.id).trim())) return;
      if (isItemBookmarked(product.id)) {
        list.push({ ...product, section: getBookmarkSection(product.id) });
      }
    });

    return list;
  }, [data, liveMenuData, trendingBookmarked, discountBookmarked, offerBookmarked, popularBookmarked, recentBookmarked, menuFavorites]);

  const toggleFavorite = (item) => {
    const { id } = item;
    // Remove from ALL bookmark stores to ensure count and list stay in sync
    const allKeys = [
      { key: "trendingBookmarked", setter: setTrendingBookmarked },
      { key: "discountBookmarked", setter: setDiscountBookmarked },
      { key: "offerBookmarked", setter: setOfferBookmarked },
      { key: "popularBookmarked", setter: setPopularBookmarked },
      { key: "recentBookmarked", setter: setRecentBookmarked },
      { key: "menuFavorites", setter: setMenuFavorites },
    ];

    allKeys.forEach(({ key, setter }) => {
      const saved = JSON.parse(localStorage.getItem(key) || "{}");
      if (saved[id]) {
        const updated = { ...saved, [id]: false };
        localStorage.setItem(key, JSON.stringify(updated));
        setter(updated);
      }
    });

    window.dispatchEvent(new Event("favoritesUpdated"));
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

      {isLoading ? (
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
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(3, 1fr)'
            },
            gap: 3,
            mt: 2
          }}
          className="favorites-grid"
        >
          {favorites.map((item) => (
            <div key={`${item.section}-${item.id}`}>
              <div className="favorite-card">
                <div className="favorite-image-wrapper">
                  <img
                    src={resolveImageSrc(item)}
                    alt={item.title || item.name}
                    loading="lazy"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/footer-images/food.png"; }}
                  />
                  <div className="favorite-badges">
                    <span className="section-badge">{item.section}</span>
                    {item.discount && <span className="fav-badge">{item.discount}</span>}
                  </div>
                </div>

                <div className="favorite-content">
                  <Typography className="favorite-item-title">
                    {item.title || item.name}
                  </Typography>
                  <Typography className="favorite-item-desc">
                    {item.desc || item.description || "Indulge in this delicious selection, crafted with fresh ingredients and authentic flavors for a perfect dining experience."}
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
        </Box>
      )}
    </div>
  );
}
