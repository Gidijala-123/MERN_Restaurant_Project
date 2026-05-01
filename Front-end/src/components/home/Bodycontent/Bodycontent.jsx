import React, { useState, Suspense, useMemo, useCallback } from "react";
import Rating from "@mui/material/Rating";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import SentimentSatisfiedIcon from "@mui/icons-material/SentimentSatisfied";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfied";
import { styled } from "@mui/material/styles";
import { toast } from "react-toastify";
import BannerCarousel from "../BannerCarousel/BannerCarousel";
const FreshFood = React.lazy(() => import("./FRESHFOOD/FreshFood"));
const Bakery = React.lazy(() => import("./BAKERY/Bakery"));
const Drinks = React.lazy(() => import("./DRINKS/Drinks"));
const Shop = React.lazy(() => import("./SHOP/Shop"));
const Pages = React.lazy(() => import("./PAGES/Pages"));
const Blog = React.lazy(() => import("./BLOG/Blog"));
const Contact = React.lazy(() => import("./CONTACT/Contact"));
const MenuDisplay = React.lazy(() => import("./MenuDisplay"));
import "./Bodycontent.css";
import Footer from "./FOOTER/Footer";
import Filter from "./FILTER_COMPONENT/Filter";
import SkeletonLoader from "../../common/SkeletonLoader.jsx";
import FoodLoader from "../../common/FoodLoader";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import FilterListIcon from "@mui/icons-material/FilterList";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import PeopleIcon from "@mui/icons-material/People";

import { useDispatch } from "react-redux";
import { addToCart } from "../../features/cartSlice";
import { useGetAllProductsQuery } from "../../features/productsApi";
import { useMenu } from "../../../context/MenuContext";
import { MENU_DATA } from "../../../data/menuData";
import useFavorites from "../../../hooks/useFavorites";
import { resolveItemImage } from "../../../utils/imageUtils";
import { DISCOUNT_SALE_ITEMS } from "../../../data/discountItems";

const StyledRating = styled(Rating)(() => ({
  "& .MuiRating-iconEmpty .MuiSvgIcon-root": {
    color: "#e0d0c0",
  },
  "& .MuiRating-iconFilled .MuiSvgIcon-root": {
    filter: "drop-shadow(0 1px 3px rgba(234,88,12,0.4))",
  },
}));

const ORANGE = document.documentElement.getAttribute("data-role") === "admin" ? "#4f46e5" : "#ea580c";
const ORANGE_LIGHT = document.documentElement.getAttribute("data-role") === "admin" ? "#7c3aed" : "#fb923c";

const customIcons = {
  1: {
    icon: <SentimentVeryDissatisfiedIcon sx={{ color: ORANGE, fontSize: "1.6rem" }} />,
    label: "Very Dissatisfied",
  },
  2: {
    icon: <SentimentDissatisfiedIcon sx={{ color: ORANGE, fontSize: "1.6rem" }} />,
    label: "Dissatisfied",
  },
  3: {
    icon: <SentimentSatisfiedIcon sx={{ color: ORANGE_LIGHT, fontSize: "1.6rem" }} />,
    label: "Neutral",
  },
  4: {
    icon: <SentimentSatisfiedAltIcon sx={{ color: ORANGE, fontSize: "1.6rem" }} />,
    label: "Satisfied",
  },
  5: {
    icon: <SentimentVerySatisfiedIcon sx={{ color: ORANGE, fontSize: "1.6rem" }} />,
    label: "Very Satisfied",
  },
};

function IconContainer(props) {
  const { value, ...other } = props;
  return <span {...other}>{customIcons[value].icon}</span>;
}

const Bodycontent = (props) => {
  const { selectedCategory, allItems: liveMenuData = MENU_DATA } = useMenu();
  const [itemRatings, setItemRatings] = useState({});

  const handleRatingChange = useCallback((itemId, newValue) => {
    setItemRatings((prev) => ({ ...prev, [itemId]: newValue }));
    if (newValue) {
      toast.success(`Thank you for your feedback! You rated it ${newValue} stars.`, {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    }
  }, []);

  const [navTocomponents, setNav] = useState({
    Home: true,
    FreshFood: false,
    Bakery: false,
    Drinks: false,
    Shop: false,
    Pages: false,
    Blog: false,
    Contact: false,
  });

  const { isFav, toggle } = useFavorites();

  // Always use itemId (stable numeric key) for bookmarking — consistent across static and DB items
  const getItemKey = (item) => String(item?.itemId ?? item?.id ?? item?._id ?? "");
  const handleBookmarkToggle = (item) => toggle(getItemKey(item));
  const [showFilter, setShowFilter] = useState(false);

  const { err, isLoading } = useGetAllProductsQuery();

  // Sync with props.currentSection
  React.useEffect(() => {
    if (props.currentSection) {
      setNav((prev) => ({
        ...Object.fromEntries(
          Object.keys(prev).map((key) => [key, key === props.currentSection]),
        ),
      }));
    }
  }, [props.currentSection]);

  const goTo = (section) => {
    if (props.onSectionChange) {
      props.onSectionChange(section);
    } else {
      setNav((prev) => ({
        ...Object.fromEntries(
          Object.keys(prev).map((key) => [key, key === section]),
        ),
      }));
    }
  };

  const CATEGORY_LIST = [
    "Fruits",
    "Vegetables",
    "Drinks",
    "Bakery",
    "Butter & Eggs",
    "Milk & Creams",
    "Meats",
    "Fish",
  ];

  const CATEGORY_ITEMS = Object.fromEntries(
    CATEGORY_LIST.map((cat) => [cat, []]),
  );

  const CATEGORY_ICONS = {
    Fruits: "🍎",
    Vegetables: "🥦",
    Drinks: "🍹",
    Bakery: "🥐",
    "Butter & Eggs": "🍳",
    "Milk & Creams": "🥛",
    Meats: "🍗",
    Fish: "🐟",

    // Indian menu categories
    "Veg Starters": "🥗",
    "Non-Veg Starters": "🍖",
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
  };

  const INDIAN_MENU_CATEGORIES = [
    "Veg Starters",
    "Non-Veg Starters",
    "Tandooris",
    "Soups",
    "Salads",
    "Sandwiches",
    "Signature Dishes",
    "Biryanis",
    "Main Course",
    "Rice & Breads",
    "South Indian",
    "Chinese",
    "Beverages",
    "Cocktails/Mocktails",
    "Desserts",
  ];

  // predefined sample products for each category
  const SAMPLE_PRODUCTS = {
    Fruits: [
      { name: "Fresh Mango", price: 120, image: "/banner-images/banner0.jpg" },
      { name: "Red Apples", price: 80, image: "/banner-images/banner1.jpg" },
      {
        name: "Mixed Berries",
        price: 150,
        image: "/banner-images/banner2.jpg",
      },
      { name: "Banana Bunch", price: 60, image: "/banner-images/banner3.jpg" },
    ],
    Vegetables: [
      {
        name: "Organic Spinach",
        price: 50,
        image: "/banner-images/banner4.jpg",
      },
      { name: "Broccoli", price: 70, image: "/banner-images/banner0.jpg" },
      { name: "Tomato Basket", price: 45, image: "/banner-images/banner1.jpg" },
      { name: "Carrot Pack", price: 55, image: "/banner-images/banner2.jpg" },
    ],
    Drinks: [
      { name: "Mint Mojito", price: 90, image: "/banner-images/banner0.jpg" },
      {
        name: "Orange Juice",
        price: 60,
        image: "/banner-images/banner1.jpg",
      },
      { name: "Cold Coffee", price: 80, image: "/banner-images/banner2.jpg" },
      {
        name: "Strawberry Smoothie",
        price: 100,
        image: "/banner-images/banner3.jpg",
      },
    ],
    Bakery: [
      {
        name: "Chocolate Cake",
        price: 250,
        image: "/banner-images/banner0.jpg",
      },
      {
        name: "Butter Croissant",
        price: 40,
        image: "/banner-images/banner1.jpg",
      },
      {
        name: "Blueberry Muffin",
        price: 35,
        image: "/banner-images/banner2.jpg",
      },
      { name: "Bagel", price: 30, image: "/banner-images/banner3.jpg" },
    ],
    // others can remain generic if needed
  };

  // build PRODUCTS list from samples, repeating to reach TOTAL_ITEMS
  const TOTAL_ITEMS = 36;
  const PRODUCTS = [];

  // optional category-specific fallback images (stored in public/banner-images).
  // if the map is left empty the onError handler will automatically request
  // a random Unsplash photo for the category.
  const IMAGE_FALLBACK = {
    Fruits: "/banner-images/banner0.jpg",
    Vegetables: "/banner-images/banner1.jpg",
    Drinks: "/banner-images/banner2.jpg",
    Bakery: "/banner-images/banner3.jpg",
    "Butter & Eggs": "/banner-images/banner4.jpg",
    "Milk & Creams": "/banner-images/banner0.jpg",
    Meats: "/banner-images/banner1.jpg",
    Fish: "/banner-images/banner2.jpg",

    // Indian menu categories (fallbacks to assets that exist in /public/footer-images)
    "Veg Starters": "/footer-images/vegitem.jpg",
    "Non-Veg Starters": "/footer-images/nonvegitem.jpg",
    Tandooris: "/footer-images/meat.png",
    Soups: "/footer-images/soups.jpg",
    Salads: "/footer-images/salads.jpg",
    Sandwiches: "/footer-images/burger.png",
    "Signature Dishes": "/footer-images/food.png",
    Biryanis: "/footer-images/chicken.png",
    "Main Course": "/footer-images/maincourse.jpg",
    "Rice & Breads": "/footer-images/food.png",
    "South Indian": "/footer-images/food.png",
    Chinese: "/footer-images/chinese.png",
    Beverages: "/footer-images/drinks.jpg",
    "Cocktails/Mocktails": "/footer-images/cooldrinks.png",
    Desserts: "/footer-images/desserts.jpg",
  };

  const getDiscountPercent = (item) => {
    // Deterministic discount based on item id (stable, but varying)
    const base = 10;
    const range = 21; // 10-30%
    const idSeed = Number(item?.id) || 0;
    return base + (idSeed * 13) % range;
  };
  for (let i = 0; i < TOTAL_ITEMS; i++) {
    const cat = CATEGORY_LIST[i % CATEGORY_LIST.length];
    const samples = SAMPLE_PRODUCTS[cat] || [];
    const sample = samples[i % samples.length] || {
      name: `${cat} Item`,
      price: 70,
      image: "",
    };
    const unsplashUrl = `https://source.unsplash.com/600x400/?${encodeURIComponent(sample.name)}`;
    const primaryImage = sample.image || IMAGE_FALLBACK[cat] || unsplashUrl;
    const fallbackImage = unsplashUrl;
    const item = {
      id: `${cat.toLowerCase().replace(/[^\w]+/g, "-")}-${i + 1}`,
      name: sample.name,
      price: sample.price,
      rating: (4 + (i % 6) * 0.1).toFixed(1),
      calories: 150 + i * 15,
      image: primaryImage,
      imageFallback: fallbackImage,
      oldPrice: i % 3 === 0 ? sample.price + 20 : null,
      category: cat,
    };
    CATEGORY_ITEMS[cat].push(item);
    PRODUCTS.push(item);
  }

  // Memoize filtered and sorted lists to prevent unnecessary re-calculation on every render
  const popularItems = useMemo(() => {
    return selectedCategory === "Hot Offers"
      ? [...liveMenuData].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 6)
      : liveMenuData.filter((item) => item.category === selectedCategory)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 6);
  }, [selectedCategory, liveMenuData]);

  const recentItems = useMemo(() => {
    return selectedCategory === "Hot Offers"
      ? [...liveMenuData].slice(-6).reverse()
      : liveMenuData.filter((item) => item.category === selectedCategory)
        .slice(-6)
        .reverse();
  }, [selectedCategory, liveMenuData]);

  const trendingItems = useMemo(() => {
    return selectedCategory === "Hot Offers"
      ? [...liveMenuData].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 6)
      : liveMenuData.filter((item) => item.category === selectedCategory)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 6);
  }, [selectedCategory, liveMenuData]);

  const dispatch = useDispatch();
  const handleAddToCart = useCallback((product) => {
    dispatch(addToCart(product));
  }, [dispatch]);

  const containerStyles = useMemo(() => ({
    width: "100%",
    margin: "0 auto",
    maxWidth: "100%",
    overflow: "hidden",
    boxSizing: "border-box",
    position: "relative",
  }), []);

  return (
    <div className="home-container">
      {isLoading ? (
        <div className="loading-div" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
          width: '100%'
        }}>
          <video width="320" height="180" autoPlay loop muted style={{ borderRadius: '20px' }}>
            <source src="/footer-images/loading.mp4" type="video/mp4" />
          </video>
        </div>
      ) : err ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h3>Oops! Something went wrong</h3>
          <p>Please try refreshing the page or contact support if the issue persists.</p>
        </div>
      ) : (
        <>
          {/* Check if it's an Indian menu category */}
          {selectedCategory !== "Hot Offers" &&
            [
              "Veg Starters",
              "Non-Veg Starters",
              "Tandooris",
              "Soups",
              "Salads",
              "Sandwiches",
              "Signature Dishes",
              "Biryanis",
              "Main Course",
              "Rice & Breads",
              "South Indian",
              "Chinese",
              "Beverages",
              "Cocktails/Mocktails",
              "Desserts",
            ].includes(selectedCategory) ? (
            <Suspense fallback={<SkeletonLoader />}>
              <MenuDisplay />
            </Suspense>
          ) : (
            // Original legacy components for other categories
            <>
              {(() => {
                const allowed = [
                  "Fruits",
                  "Vegetables",
                  "Drinks",
                  "Bakery",
                  "Buffer & Eggs",
                  "Milk & Creams",
                  "Meats",
                  "Fish",
                ];
                const isCategory = allowed.includes(props.activeCategory);
                if (isCategory) {
                  const filtered = CATEGORY_ITEMS[props.activeCategory] || [];
                  const chunk = (arr, size) =>
                    arr.reduce((rows, item, idx) => {
                      const r = Math.floor(idx / size);
                      (rows[r] || (rows[r] = [])).push(item);
                      return rows;
                    }, []);
                  const rows = chunk(filtered, 6);
                  return (
                    <React.Fragment key={props.activeCategory}>
                      <h2 className="heading-title">{props.activeCategory}</h2>
                      {filtered.length === 0 ? (
                        <div
                          style={{
                            width: "100%",
                            textAlign: "center",
                            padding: "30px",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
                            <FoodLoader size={100} />
                          </div>
                          <h4>No items found</h4>
                          <p>Try a different category</p>
                        </div>
                      ) : (
                        rows.map((row, idx) => (
                          <div className="category-viewport" key={`row-${idx}`}>
                            <div
                              className={`category-track ${idx % 2 === 0 ? "scroll-left" : "scroll-right"
                                }`}
                            >
                              {[...row, ...row].map((item, j) => (
                                <div
                                  className="trending-items-sub-div"
                                  key={`${item.id}-${j}`}
                                >
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src = "/footer-images/food.png";
                                    }}
                                    loading="lazy"
                                  />
                                  <p className="trending-items-title">
                                    {CATEGORY_ICONS[item.category] || "🍽️"}{" "}
                                    {item.name}
                                  </p>
                                  <div className="trending-card-details-wrapper">
                                    <div className="trending-rating">
                                      <span>⭐ {item.rating}</span>
                                      <span className="reviews-text">
                                        (200+)
                                      </span>
                                    </div>
                                    <div className="trending-items-decrp-container">
                                      <span className="trending-items-decrp">
                                        {item.calories} kcal
                                      </span>
                                      <b>•</b>
                                      <span className="trending-items-decrp">
                                        Serves 1
                                      </span>
                                    </div>
                                    <div className="trending-items-btn">
                                      <b>&#8377;{item.price}</b>
                                      <button
                                        onClick={() =>
                                          handleAddToCart({
                                            id: item.id,
                                            title: item.name,
                                            price: item.price,
                                            img: item.image,
                                          })
                                        }
                                        className="trending-items-button"
                                      >
                                        + ADD
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </React.Fragment>
                  );
                }
                return null;
              })()}
            </>
          )}
          {/* Main Home Content - Only show when Hot Offers is selected */}
          {selectedCategory === "Hot Offers" && (
            <>
              {/* Banner Carousel */}
              <div className="banner-carousel-wrapper">
                <div className="filter-trigger-container">
                  <button
                    className="filter-trigger-btn"
                    onClick={() => setShowFilter(true)}
                  >
                    <FilterListIcon fontSize="small" />
                    <span>Filter</span>
                  </button>
                </div>
                {Object.entries(navTocomponents)?.map(
                  ([key, value]) =>
                    value &&
                    (key === "Home" ? (
                      <div
                        key={key}
                        className="bannerCarousel-div"
                        style={{
                          width: "100%",
                          maxWidth: "100%",
                          overflow: "hidden",
                          boxSizing: "border-box",
                        }}
                      >
                        <div style={containerStyles}>
                          <BannerCarousel
                            sideopen={props.open}
                            onSectionChange={props.onSectionChange}
                          />
                        </div>
                      </div>
                    ) : key === "FreshFood" ? (
                      <Suspense fallback={<SkeletonLoader />}>
                        <FreshFood key={key} />
                      </Suspense>
                    ) : key === "Bakery" ? (
                      <Suspense fallback={<SkeletonLoader />}>
                        <Bakery key={key} />
                      </Suspense>
                    ) : key === "Drinks" ? (
                      <Suspense fallback={<SkeletonLoader />}>
                        <Drinks key={key} />
                      </Suspense>
                    ) : key === "Shop" ? (
                      <Suspense fallback={<SkeletonLoader />}>
                        <Shop key={key} searchQuery={props.searchQuery || ""} />
                      </Suspense>
                    ) : key === "Pages" ? (
                      <Suspense fallback={<SkeletonLoader />}>
                        <Pages key={key} />
                      </Suspense>
                    ) : key === "Blog" ? (
                      <Suspense fallback={<SkeletonLoader />}>
                        <Blog key={key} />
                      </Suspense>
                    ) : (
                      <Suspense fallback={<SkeletonLoader />}>
                        <Contact key={key} />
                      </Suspense>
                    )),
                )}
              </div>

              {/* Our offers */}
              <div className="fancy-section offers-section">
                <div className="section-title-wrapper">
                  <span className="section-badge" style={{ background: "linear-gradient(135deg,#e65100,#ff8f00)", color: "white" }}>OFFERS</span>
                  <h2 className="heading-title">Our Offers</h2>
                </div>
                <div className="offers-scroll">
                  <div className="offers-main-div">
                    {(() => {
                      const isIndianMenu = INDIAN_MENU_CATEGORIES.includes(
                        selectedCategory,
                      );

                      const offerItems =
                        selectedCategory === "Hot Offers"
                          ? liveMenuData.slice(0, 6)
                          : isIndianMenu
                            ? liveMenuData.filter(
                              (item) => item.category === selectedCategory,
                            ).slice(0, 6)
                            : (() => {
                              const allowed = [
                                "Fruits",
                                "Vegetables",
                                "Drinks",
                                "Bakery",
                                "Buffer & Eggs",
                                "Milk & Creams",
                                "Meats",
                                "Fish",
                              ];
                              const isCategory = allowed.includes(
                                props.activeCategory,
                              );
                              return isCategory
                                ? PRODUCTS.filter(
                                  (p) => p.category === props.activeCategory,
                                )
                                : PRODUCTS;
                            })();

                      if (offerItems.length === 0) {
                        return (
                          <div
                            style={{
                              width: "100%",
                              textAlign: "center",
                              padding: "30px",
                            }}
                          >
                            <h4>No items found</h4>
                            <p>Try a different category</p>
                          </div>
                        );
                      }
                      return offerItems.map((each) => {
                        const discount = getDiscountPercent(each);
                        const isBookmarked = isFav(getItemKey(each));
                        return (
                          <div key={each.id} className="offer-card section-card">
                            <div className="card-badge">
                              {discount > 0 ? `${discount}% OFF` : "SPECIAL"}
                            </div>
                            <button
                              type="button"
                              className={`bookmark-icon ${isBookmarked ? "active" : ""
                                }`}
                              onClick={() => handleBookmarkToggle(each)}
                            >
                              {isBookmarked ? (
                                <FavoriteIcon fontSize="small" />
                              ) : (
                                <FavoriteBorderIcon fontSize="small" />
                              )}
                            </button>
                            <img
                              src={resolveItemImage(each)}
                              alt={each.name || each.title}
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "/footer-images/food.png";
                              }}
                            />
                            <h4 className="trending-items-title">
                              <span className="title-icon">
                                {CATEGORY_ICONS[each.category] || "🍽️"}
                              </span>
                              {each.name || each.title}
                            </h4>

                            <p className="card-description">
                              {each.description ||
                                `Delicious ${each.name || each.title
                                } prepared with fresh ingredients and traditional spices.`}
                            </p>

                            <div className="card-meta-info">
                              <div className="meta-item">
                                <LocalFireDepartmentIcon
                                  sx={{ fontSize: 16, color: "#ff7043" }}
                                />
                                <span>
                                  {each.calories ||
                                    150 + Math.floor(Math.random() * 200)}{" "}
                                  kcal
                                </span>
                              </div>
                              <div className="meta-item">
                                <PeopleIcon
                                  sx={{ fontSize: 16, color: "#4fc3f7" }}
                                />
                                <span>Serves {each.serves || 1}</span>
                              </div>
                            </div>

                            <div className="trending-rating">
                              <span className="star">⭐</span>
                              <span>
                                {each.rating ||
                                  (Math.random() * 1 + 4).toFixed(1)}
                              </span>
                              <span className="reviews-text">
                                ({each.reviews ||
                                  Math.floor(Math.random() * 150) + 10}{" "}
                                reviews)
                              </span>
                            </div>

                            <div className="price-container">
                              {each.oldPrice && (
                                <span className="original-price">
                                  ₹{each.oldPrice}
                                </span>
                              )}
                              <span className="discounted-price">
                                ₹{each.price || each.newPrice}
                              </span>
                            </div>
                            <button
                              className="btn shopnow-btn"
                              onClick={() => handleAddToCart({
                                id: each.id,
                                title: each.name || each.title,
                                price: each.price || each.newPrice,
                                img: resolveItemImage(each)
                              })}
                            >
                              SHOP NOW
                            </button>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>

              <div className="preview-section fancy-section">
                <div className="preview-section-header section-title-wrapper">
                  <span className="section-badge" style={{ background: "linear-gradient(135deg,#e65100,#ff8f00)", color: "white" }}>POPULAR</span>
                  <h2 className="heading-title">Popular Dishes</h2>
                  <span
                    className="view-all-link"
                    onClick={() =>
                      props.onSectionChange &&
                      props.onSectionChange("Home", selectedCategory)
                    }
                  >
                    View All
                  </span>
                </div>
                <div className="trending-items-container">
                  {popularItems.map((item) => {
                    const discount = getDiscountPercent(item);
                    const oldPrice = item.price;
                    const newPrice = Math.round(oldPrice * (1 - discount / 100));
                    return (
                      <div className="section-card" key={item.id}>
                        <div className="card-badge">{discount}% OFF</div>
                        <button
                          type="button"
                          className={`bookmark-icon ${isFav(getItemKey(item)) ? "active" : ""
                            }`}
                          onClick={() => handleBookmarkToggle(item)}
                        >
                          {isFav(getItemKey(item)) ? (
                            <FavoriteIcon fontSize="small" />
                          ) : (
                            <FavoriteBorderIcon fontSize="small" />
                          )}
                        </button>
                        <img
                          src={resolveItemImage(item)}
                          alt={item.name}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/footer-images/food.png";
                          }}
                        />
                        <h4 className="trending-items-title">
                          <span className="title-icon">{CATEGORY_ICONS[item.category] || "🍽️"}</span>
                          {item.name}
                        </h4>

                        <p className="card-description">
                          {item.description || `Delicious ${item.name} prepared with fresh ingredients and traditional spices.`}
                        </p>

                        <div className="card-meta-info">
                          <div className="meta-item">
                            <LocalFireDepartmentIcon sx={{ fontSize: 16, color: "#ff7043" }} />
                            <span>{item.calories || (150 + Math.floor(Math.random() * 200))} kcal</span>
                          </div>
                          <div className="meta-item">
                            <PeopleIcon sx={{ fontSize: 16, color: "#4fc3f7" }} />
                            <span>Serves {item.serves || 1}</span>
                          </div>
                        </div>

                        <div className="trending-rating feedback-rating" style={{ flexDirection: 'column', gap: '3px', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', fontWeight: '600' }}>Your Feedback:</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <StyledRating
                              name={`rating-${item.id}`}
                              value={itemRatings[item.id] || 0}
                              onChange={(event, newValue) => handleRatingChange(item.id, newValue)}
                              IconContainerComponent={IconContainer}
                              getLabelText={(value) => customIcons[value].label}
                              highlightSelectedOnly
                            />
                            {itemRatings[item.id] && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '700' }}>
                                {customIcons[itemRatings[item.id]].label}
                              </span>
                            )}
                          </div>
                          <div className="reviews-text" style={{ marginTop: '1px' }}>
                            (Previously: ⭐ {item.rating})
                          </div>
                        </div>
                        <div className="price-container">
                          <span className="original-price">₹{oldPrice}</span>
                          <span className="discounted-price">₹{newPrice}</span>
                        </div>
                        <button
                          className="btn shopnow-btn"
                          onClick={() =>
                            handleAddToCart({
                              id: item.id,
                              title: item.name,
                              price: newPrice,
                              img: resolveItemImage(item),
                            })
                          }
                        >
                          Grab Now
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="preview-section fancy-section">
                <div className="preview-section-header section-title-wrapper">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span className="section-badge" style={{ background: "linear-gradient(135deg,#e65100,#ff8f00)", color: "white" }}>RECENT</span>
                    <h2 className="heading-title">Recent Orders</h2>
                  </div>
                  <span
                    className="view-all-link"
                    onClick={() =>
                      props.onSectionChange &&
                      props.onSectionChange("Home", selectedCategory)
                    }
                  >
                    View All
                  </span>
                </div>
                <div className="trending-items-container">
                  {recentItems.map((item) => {
                    const discount = getDiscountPercent(item);
                    const oldPrice = item.price;
                    const newPrice = Math.round(oldPrice * (1 - discount / 100));
                    return (
                      <div className="section-card" key={item.id}>
                        <div className="card-badge">{discount}% OFF</div>
                        <button
                          type="button"
                          className={`bookmark-icon ${isFav(getItemKey(item)) ? "active" : ""
                            }`}
                          onClick={() => handleBookmarkToggle(item)}
                        >
                          {isFav(getItemKey(item)) ? (
                            <FavoriteIcon fontSize="small" />
                          ) : (
                            <FavoriteBorderIcon fontSize="small" />
                          )}
                        </button>
                        <img
                          src={resolveItemImage(item)}
                          alt={item.name}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/footer-images/food.png";
                          }}
                        />
                        <h4 className="trending-items-title">
                          <span className="title-icon">{CATEGORY_ICONS[item.category] || "🍽️"}</span>
                          {item.name}
                        </h4>

                        <p className="card-description">
                          {item.description || `Delicious ${item.name} prepared with fresh ingredients and traditional spices.`}
                        </p>

                        <div className="card-meta-info">
                          <div className="meta-item">
                            <LocalFireDepartmentIcon sx={{ fontSize: 16, color: "#ff7043" }} />
                            <span>{item.calories || (150 + Math.floor(Math.random() * 200))} kcal</span>
                          </div>
                          <div className="meta-item">
                            <PeopleIcon sx={{ fontSize: 16, color: "#4fc3f7" }} />
                            <span>Serves {item.serves || 1}</span>
                          </div>
                        </div>

                        <div className="trending-rating">
                          <span className="star">⭐</span>
                          <span>{item.rating}</span>
                          <span className="reviews-text">({item.reviews} reviews)</span>
                        </div>
                        <div className="price-container">
                          <span className="original-price">₹{oldPrice}</span>
                          <span className="discounted-price">₹{newPrice}</span>
                        </div>
                        <button
                          className="btn shopnow-btn"
                          onClick={() =>
                            handleAddToCart({
                              id: item.id,
                              title: item.name,
                              price: newPrice,
                              img: resolveItemImage(item),
                            })
                          }
                        >
                          Grab Now
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Today's Discount Sale Marquee */}
              <div className="discount-sale-container">
                <div className="discount-title-wrapper">
                  <span className="discount-badge">LIVE SALE</span>
                  <h2 className="heading-title m-0">Today's Discount Sale</h2>
                </div>
                <div className="marquee-viewport">
                  <div className="marquee-track">
                    {[...Array(2)].map((_, i) => (
                      <React.Fragment key={i}>
                        {DISCOUNT_SALE_ITEMS.map((item, index) => {
                          const isBookmarked = isFav(getItemKey(item));
                          return (
                            <div className="section-card" key={`${i}-${index}`}>
                              <button
                                type="button"
                                className={`bookmark-icon ${isBookmarked ? "active" : ""
                                  }`}
                                onClick={() =>
                                  handleBookmarkToggle(item)
                                }
                              >
                                {isBookmarked ? (
                                  <FavoriteIcon fontSize="small" />
                                ) : (
                                  <FavoriteBorderIcon fontSize="small" />
                                )}
                              </button>
                              <div className="card-badge">{item.discount}</div>
                              <img src={item.img} alt={item.title} loading="lazy" />
                              <h4 className="trending-items-title">
                                <span className="title-icon">🔥</span>
                                {item.title}
                              </h4>

                              <p className="card-description">
                                {item.desc || `Delicious ${item.title} at an unbeatable price for a limited time.`}
                              </p>

                              <div className="card-meta-info">
                                <div className="meta-item">
                                  <LocalFireDepartmentIcon sx={{ fontSize: 16, color: "#ff7043" }} />
                                  <span>{180 + (index * 20)} kcal</span>
                                </div>
                                <div className="meta-item">
                                  <PeopleIcon sx={{ fontSize: 16, color: "#4fc3f7" }} />
                                  <span>Serves 1</span>
                                </div>
                              </div>

                              <div className="trending-rating">
                                <span className="star">⭐</span>
                                <span>{item.rating}</span>
                                <span className="reviews-text">
                                  ({item.reviews} reviews)
                                </span>
                              </div>
                              <div className="price-container">
                                <span className="original-price">₹{item.oldPrice}</span>
                                <span className="discounted-price">₹{item.newPrice}</span>
                              </div>
                              <button
                                className="btn shopnow-btn"
                                onClick={() => handleAddToCart({
                                  id: item.id,
                                  title: item.title,
                                  price: item.newPrice,
                                  img: item.img
                                })}
                              >
                                Grab Now
                              </button>
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              {/* Trending today */}
              <div className="trending-today-container">
                <div className="trending-title-wrapper">
                  <span className="trending-badge">TRENDING</span>
                  <h2 className="heading-title m-0">Trending Today</h2>
                </div>
                <div className="trending-viewport">
                  <div className="trending-track">
                    {[...Array(2)].map((_, i) => (
                      <React.Fragment key={i}>
                        {trendingItems.map((item) => (
                          <div
                            className="section-card"
                            key={`${i}-${item.id}`}
                          >
                            <div className="card-badge">TRENDING</div>
                            <button
                              type="button"
                              className={`bookmark-icon ${isFav(getItemKey(item)) ? "active" : ""
                                }`}
                              onClick={() =>
                                handleBookmarkToggle(item)
                              }
                            >
                              {isFav(getItemKey(item)) ? (
                                <FavoriteIcon fontSize="small" />
                              ) : (
                                <FavoriteBorderIcon fontSize="small" />
                              )}
                            </button>
                            <img
                              src={resolveImageSrc(item)}
                              alt={item.name}
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "/footer-images/food.png";
                              }}
                            />
                            <h4 className="trending-items-title">
                              <span className="title-icon">{CATEGORY_ICONS[item.category] || "🍽️"}</span>
                              {item.name}
                            </h4>

                            <p className="card-description">
                              {item.description || `Delicious ${item.name} prepared with fresh ingredients and traditional spices.`}
                            </p>

                            <div className="card-meta-info">
                              <div className="meta-item">
                                <LocalFireDepartmentIcon sx={{ fontSize: 16, color: "#ff7043" }} />
                                <span>{item.calories || (150 + Math.floor(Math.random() * 200))} kcal</span>
                              </div>
                              <div className="meta-item">
                                <PeopleIcon sx={{ fontSize: 16, color: "#4fc3f7" }} />
                                <span>Serves {item.serves || 1}</span>
                              </div>
                            </div>

                            <div className="trending-rating">
                              <span className="star">⭐</span>
                              <span>{item.rating}</span>
                              <span className="reviews-text">
                                ({item.reviews} reviews)
                              </span>
                            </div>
                            <div className="price-container">
                              <span className="discounted-price">₹{item.price}</span>
                            </div>
                            <button
                              onClick={() => handleAddToCart({
                                id: item.id,
                                title: item.name,
                                price: item.price,
                                img: resolveImageSrc(item)
                              })}
                              className="btn shopnow-btn"
                            >
                              + ADD
                            </button>
                          </div>
                        ))}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chef's Special Section */}
              <div className="chefs-special-card">
                <div className="section-title-wrapper border-0">
                  <div className="section-title-left">
                    <span className="section-badge" style={{ background: 'rgba(255,255,255,0.2)', boxShadow: 'none' }}>CHEF'S CHOICE</span>
                    <h2 className="heading-title" style={{ color: 'white' }}>Chef's Special</h2>
                  </div>
                </div>
                <div className="row align-items-center">
                  <div className="col-md-5">
                    <img
                      className="special-img"
                      src="/footer-images/original-bd99e6afd7177b69f8bdf6bfe7fd0643.jpg"
                      alt="special-dish"
                    />
                  </div>
                  <div className="col-md-7">
                    <h1 className="special-heading">
                      Experience Our Signature Smoked BBQ Ribs
                    </h1>
                    <p className="special-para">
                      Slow-cooked for 12 hours with our secret spice rub and glazed
                      with house-made honey bourbon sauce. Served with crispy slaw
                      and buttery cornbread. A taste that brings people back again
                      and again!
                    </p>
                    <div className="special-meta">
                      <span>⭐ 4.9 (500+ Reviews)</span>
                      <span>🔥 Most Ordered This Week</span>
                    </div>
                    <button className="main-action-btn">
                      Order Signature Dish
                    </button>
                  </div>
                </div>
              </div>

              {/* Why Choose Us Section */}
              <div className="why-choose-us-section">
                <div className="section-title-wrapper border-0">
                  <span className="section-badge" style={{ background: "linear-gradient(135deg,#e65100,#ff8f00)", color: "white" }}>WHY US?</span>
                  <h2 className="heading-title">Why Choose Us</h2>
                </div>
                <div className="feature-grid">
                  <div className="feature-card">
                    <div className="feature-icon-wrapper">
                      <img
                        src="/footer-images/veggies.jpg"
                        alt="Fresh Food"
                      />
                    </div>
                    <h3>Fresh Food</h3>
                    <p>
                      We provide only the freshest ingredients from local organic
                      farms.
                    </p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon-wrapper">
                      <img src="/footer-images/food.png" alt="Best Price" />
                    </div>
                    <h3>Best Price</h3>
                    <p>
                      Enjoy premium quality food at the most competitive prices in
                      town.
                    </p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon-wrapper">
                      <img
                        src="/footer-images/deliverypayment.jpg"
                        alt="Fast Delivery"
                      />
                    </div>
                    <h3>Fast Delivery</h3>
                    <p>
                      Hot and fresh meals delivered to your doorstep in under 30
                      minutes.
                    </p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon-wrapper">
                      <SupportAgentIcon
                        style={{ fontSize: "30px", color: "var(--primary)" }}
                      />
                    </div>
                    <h3>24/7 Support</h3>
                    <p>
                      Our dedicated support team is always ready to assist you
                      anytime.
                    </p>
                  </div>
                </div>
              </div>

              {/* Why Choose Flavora */}
              <div className="delivery-payment-section">
                <div className="section-title-wrapper border-0">
                  <div className="section-title-left">
                    <span className="section-badge" style={{ background: 'rgba(255,255,255,0.2)', boxShadow: 'none' }}>WHY US</span>
                    <h2 className="heading-title" style={{ color: 'white' }}>Why Choose Flavora</h2>
                  </div>
                </div>
                <div className="delivery-content">
                  <h2 className="special-heading">More than just food delivery</h2>
                  <p className="special-para">
                    From farm-fresh ingredients to your doorstep in under 30 minutes.
                    Every order is crafted with care, packed with love, and delivered
                    with speed. Join thousands of happy customers who trust Flavora
                    for their daily meals.
                  </p>
                  <div className="payment-methods" style={{ flexWrap: "wrap", gap: "18px" }}>
                    {[
                      { icon: "⚡", label: "30-min delivery", sub: "Guaranteed fast" },
                      { icon: "🌿", label: "Farm fresh", sub: "100% natural" },
                      { icon: "🏆", label: "Top rated", sub: "4.8★ avg rating" },
                      { icon: "🔒", label: "Safe & hygienic", sub: "FSSAI certified" },
                    ].map(({ icon, label, sub }) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.12)", borderRadius: "14px", padding: "10px 16px", minWidth: "140px" }}>
                        <span style={{ fontSize: "1.6rem" }}>{icon}</span>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: "0.85rem", color: "#fff" }}>{label}</p>
                          <p style={{ margin: 0, fontSize: "0.7rem", color: "rgba(255,255,255,0.75)" }}>{sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="main-action-btn" style={{ marginTop: "20px", alignSelf: "flex-start" }}>
                    Explore Menu
                  </button>
                </div>
                <div className="payment-img-container">
                  <img
                    src="/footer-images/deliverypayment.jpg"
                    alt="flavora delivery"
                    className="delivery-img"
                  />
                </div>
              </div>

              {/* Thank you section */}
              <div className="thankyou-section">
                <div className="section-title-wrapper border-0 mb-4">
                  <div className="section-title-left">
                    <span className="section-badge" style={{ background: 'rgba(255,255,255,0.2)', boxShadow: 'none' }}>GRATITUDE</span>
                    <h2 className="heading-title" style={{ color: 'white', borderBottom: '2px solid rgba(255,255,255,0.3)', display: 'inline-block', paddingBottom: '5px' }}>Thank You</h2>
                  </div>
                </div>
                <div className="row align-items-center">
                  <div className="col-md-7">
                    <div className="thankyou-content-card">
                      <h1 className="thankyou-heading">
                        Thank you for being a valuable customer to us
                      </h1>
                      <p className="thankyou-para">
                        We appreciate your trust in us. We hope you enjoyed our food
                        and service. Here is a small gift from our side for your next
                        order.
                      </p>
                      <span className="thankyou-b">Keep visiting — FLAVORA</span>
                      <div className="mt-2">
                        <button
                          className="main-action-btn"
                          data-toggle="modal"
                          data-target="#ThankyouexampleModal"
                        >
                          Redeem Now
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-5">
                    <div className="thankyou-img-wrapper">
                      <img
                        src="/footer-images/gift1.png"
                        alt="gift-box"
                        className="thankyou-img"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <Footer />

          {/* Filter Overlay */}
          {showFilter && <Filter onClose={() => setShowFilter(false)} />}
        </>
      )}
    </div>
  );
};

export default Bodycontent;
