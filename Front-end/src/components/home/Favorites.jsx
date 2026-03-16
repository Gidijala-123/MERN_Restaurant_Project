import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, Grid, Card, CardContent, CardActions, Button, Chip, IconButton } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useGetAllProductsQuery } from "../features/productsApi";
import { useNavigate } from "react-router-dom";

export default function Favorites() {
  const { data = [], isLoading } = useGetAllProductsQuery();
  const [discountBookmarked, setDiscountBookmarked] = useState({});
  const [trendingBookmarked, setTrendingBookmarked] = useState({});
  const navigate = useNavigate();

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

  return (
    <Box sx={{ p: 3, minHeight: "calc(100vh - 72px)" }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <IconButton onClick={() => navigate("/home")} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Favorites
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Items you bookmarked while browsing the restaurant menu.
      </Typography>

      {isLoading ? (
        <Typography sx={{ mt: 4 }}>Loading favorites...</Typography>
      ) : favorites.length === 0 ? (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Nothing here yet.
          </Typography>
          <Typography color="text.secondary">
            Visit the menu and tap the heart icon to save your favorites.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {favorites.map((item) => (
            <Grid item xs={12} md={6} lg={4} key={`${item.section}-${item.id}`}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardContent>
                  <Box
                    component="img"
                    src={item.img}
                    alt={item.title}
                    sx={{ width: "100%", borderRadius: 2, mb: 2, maxHeight: 180, objectFit: "cover" }}
                  />
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {item.desc}
                  </Typography>
                  <Chip label={item.section} size="small" sx={{ mr: 1, mb: 1 }} />
                  {item.discount && (
                    <Chip label={item.discount} color="primary" size="small" sx={{ mb: 1 }} />
                  )}
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={
                      trendingBookmarked[item.id] || discountBookmarked[item.id] ? (
                        <FavoriteIcon />
                      ) : (
                        <FavoriteBorderIcon />
                      )
                    }
                    onClick={() => toggleFavorite(item)}
                  >
                    {trendingBookmarked[item.id] || discountBookmarked[item.id]
                      ? "Remove"
                      : "Save"}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
