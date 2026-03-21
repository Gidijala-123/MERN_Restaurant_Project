import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, Grid, Card, CardContent, CardActions, Button, Chip, IconButton, Container } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import HeartBrokenIcon from "@mui/icons-material/HeartBroken";
import { useGetAllProductsQuery } from "../features/productsApi";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../features/cartSlice";
import "./Favorites.css";

export default function Favorites() {
  const { data = [], isLoading } = useGetAllProductsQuery();
  const [discountBookmarked, setDiscountBookmarked] = useState({});
  const [trendingBookmarked, setTrendingBookmarked] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const savedDiscount = JSON.parse(localStorage.getItem("discountBookmarked") || "{}");
    const savedTrending = JSON.parse(localStorage.getItem("trendingBookmarked") || "{}");
    setDiscountBookmarked(savedDiscount);
    setTrendingBookmarked(savedTrending);
  }, []);

  const favorites = useMemo(() => {
    const list = [];
    data?.forEach((product) => {
      if (trendingBookmarked[product.id]) {
        list.push({ ...product, section: "Trending" });
      }
    });

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
        list.push({ ...item, section: "Discount" });
      }
    });

    return list;
  }, [data, discountBookmarked, trendingBookmarked]);

  const toggleFavorite = (item) => {
    const isTrending = item.section === "Trending";
    if (isTrending) {
      const next = { ...trendingBookmarked, [item.id]: !trendingBookmarked[item.id] };
      setTrendingBookmarked(next);
      localStorage.setItem("trendingBookmarked", JSON.stringify(next));
    } else {
      const next = { ...discountBookmarked, [item.id]: !discountBookmarked[item.id] };
      setDiscountBookmarked(next);
      localStorage.setItem("discountBookmarked", JSON.stringify(next));
    }
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
          <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
            Curating your favorites...
          </Typography>
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
        <Grid container spacing={2} className="favorites-grid">
          {favorites.map((item) => (
            <Grid item xs={12} sm={4} md={4} lg={4} key={`${item.section}-${item.id}`}>
              <div className="favorite-card">
                <div className="favorite-image-wrapper">
                  <img
                    src={item.img || item.image}
                    alt={item.title || item.name}
                    loading="lazy"
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
                    fullWidth
                    sx={{ mr: 1 }}
                  >
                    Remove
                  </Button>
                  <IconButton 
                    onClick={() => handleAddToCart(item)}
                    sx={{ 
                      background: 'var(--primary-gradient)', 
                      color: 'white',
                      borderRadius: '12px',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        background: 'var(--primary-dark)',
                      }
                    }}
                  >
                    <ShoppingBagIcon />
                  </IconButton>
                </div>
              </div>
            </Grid>
          ))}
        </Grid>
      )}
    </div>
  );
}
