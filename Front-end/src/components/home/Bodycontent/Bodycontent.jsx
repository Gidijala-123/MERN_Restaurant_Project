import React, { useState, Suspense } from "react";
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
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import FilterListIcon from "@mui/icons-material/FilterList";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

// carttttt
import { useDispatch } from "react-redux";
import { addToCart } from "../../features/cartSlice";
import { useGetAllProductsQuery } from "../../features/productsApi";
import { useMenu } from "../../../context/MenuContext";
import { MENU_DATA } from "../../../data/menuData";


const Bodycontent = (props) => {
  const { selectedCategory } = useMenu();

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

  const [discountBookmarked, setDiscountBookmarked] = useState({});
  const [trendingBookmarked, setTrendingBookmarked] = useState({});
  const [showFilter, setShowFilter] = useState(false);
  // Address state for billing form
  const [addressValue, setAddressValue] = useState("");

  // Load bookmarks from localStorage on mount
  React.useEffect(() => {
    const savedDiscount = JSON.parse(
      localStorage.getItem("discountBookmarked") || "{}",
    );
    const savedTrending = JSON.parse(
      localStorage.getItem("trendingBookmarked") || "{}",
    );
    setDiscountBookmarked(savedDiscount);
    setTrendingBookmarked(savedTrending);
  }, []);

  const handleBookmarkToggle = (itemId, section) => {
    if (section === "discount") {
      const updated = {
        ...discountBookmarked,
        [itemId]: !discountBookmarked[itemId],
      };
      setDiscountBookmarked(updated);
      localStorage.setItem("discountBookmarked", JSON.stringify(updated));
      window.dispatchEvent(new Event("favoritesUpdated"));
    } else if (section === "trending") {
      const updated = {
        ...trendingBookmarked,
        [itemId]: !trendingBookmarked[itemId],
      };
      setTrendingBookmarked(updated);
      localStorage.setItem("trendingBookmarked", JSON.stringify(updated));
      window.dispatchEvent(new Event("favoritesUpdated"));
    }
  };

  const getFavorites = () => {
    const favorites = [];

    // Check trending items (from API data)
    data?.forEach((product) => {
      if (trendingBookmarked[product.id]) {
        favorites.push({ ...product, section: "trending" });
      }
    });

    // Check discount items
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
        favorites.push({ ...item, price: item.newPrice, section: "discount" });
      }
    });

    return favorites;
  };

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

      if (mapped) {
        return mapped;
      }

      // If we don’t have a local mapping, use the item name to fetch a relevant Unsplash image.
      // This makes “Samosa” show a more appropriate image instead of a generic “food” asset.
      return `https://source.unsplash.com/600x400/?${encodeURIComponent(
        item?.name || item?.title || item?.category || "food",
      )}`;
    }

    // If candidate exists but is not a /menu-images reference, use it.
    if (candidate && !candidate.startsWith("/menu-images/")) {
      return candidate;
    }

    const categoryFallback = IMAGE_FALLBACK[item?.category];

    // Use a deterministic seed based on item name for consistent, realistic food images
    const seed = encodeURIComponent(
      (item?.name || item?.title || item?.category || "Food").replace(/\s+/g, "-").toLowerCase(),
    );

    return (
      categoryFallback ||
      `https://picsum.photos/seed/${seed}/600/400`
    );
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

  // Popular items (highest rated from selected category)
  const popularItems = selectedCategory === "Hot Offers"
    ? [...MENU_DATA].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 6)
    : MENU_DATA.filter((item) => item.category === selectedCategory)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 6);

  // Recent items (latest added from selected category)
  const recentItems = selectedCategory === "Hot Offers"
    ? [...MENU_DATA].slice(-6).reverse()
    : MENU_DATA.filter((item) => item.category === selectedCategory)
        .slice(-6)
        .reverse();

  // Trending items (top-rated from selected category)
  const trendingItems = selectedCategory === "Hot Offers"
    ? [...MENU_DATA].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 6)
    : MENU_DATA.filter((item) => item.category === selectedCategory)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 6);

  //  carttttt
  const { data, err, isLoading } = useGetAllProductsQuery();
  const dispatch = useDispatch();
  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
  };

  // carouselllll

  const containerStyles = {
    width: "100%",
    margin: "0 auto",
    maxWidth: "100%",
    overflow: "hidden",
    boxSizing: "border-box",
    position: "relative",
  };

  return (
    <div className="home-container">
      {isLoading ? (
        <div className="loading-div">
          <video width="640" height="360" autoPlay loop muted>
            <source src="/footer-images/loading.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      ) : err ? (
        <p>An error occured..!</p>
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
                    <>
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
                              className={`category-track ${
                                idx % 2 === 0 ? "scroll-left" : "scroll-right"
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
                    </>
                  );
                }
                return null;
              })()}
            </>
          )}
          {![
            "Fruits",
            "Vegetables",
            "Drinks",
            "Bakery",
            "Butter & Eggs",
            "Milk & Creams",
            "Meats",
            "Fish",
          ].includes(props.activeCategory) && (
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
                          <BannerCarousel sideopen={props.open} />
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
                        <Shop key={key} />
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
                  <span className="section-badge">OFFERS</span>
                  <h2 className="heading-title">Our Offers</h2>
                </div>
                <div className="offers-scroll">
                  <div className="offers-main-div">
                    {(() => {
                      const isIndianMenu = INDIAN_MENU_CATEGORIES.includes(
                        selectedCategory,
                      );

                      const offerItems = selectedCategory === "Hot Offers"
                        ? MENU_DATA.slice(0, 6)
                        : isIndianMenu
                        ? MENU_DATA.filter(
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
                      return offerItems.map((each) => (
                        <div key={each.id} className="offer-card section-card">
                          <img
                            className="offer-image"
                            src={resolveImageSrc(each)}
                            alt={each.name || each.title}
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/footer-images/food.png";
                            }}
                          />
                          <span className="offer-cat">
                            {CATEGORY_ICONS[each.category] || "🍽️"}{" "}
                            {(each.category || each.title || "").toString()}
                          </span>
                          <div className="offer-title">
                            {each.name || each.title}
                          </div>

                          {each.description && (
                            <div className="offer-description">
                              {each.description}
                            </div>
                          )}

                          <div className="offer-meta">
                            {each.calories != null && (
                              <span className="offer-meta-item">
                                {each.calories} kcal
                              </span>
                            )}
                            {each.serves != null && (
                              <span className="offer-meta-item">
                                Serves {each.serves}
                              </span>
                            )}
                          </div>

                          <div className="offer-pricing">
                            {each.oldPrice && (
                              <span className="old-price">
                                ₹{each.oldPrice}
                              </span>
                            )}
                            <span
                              className={
                                each.oldPrice ? "new-price" : "new-price solo"
                              }
                            >
                              ₹{each.price || each.newPrice}
                            </span>
                          </div>
                          <div className="trending-rating">
                            <span>
                              ⭐ {each.rating || (Math.random() * 1 + 4).toFixed(1)}
                            </span>
                            <span className="reviews-text">
                              (
                              {each.reviews ||
                                Math.floor(Math.random() * 150) + 10}{" "}
                              reviews)
                            </span>
                          </div>
                          <button className="btn shopnow-btn">SHOP NOW</button>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>

              <div className="preview-section fancy-section">
                <div className="preview-section-header section-title-wrapper">
                  <span className="section-badge">POPULAR</span>
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
                      <div className="discount-item section-card" key={item.id}>
                        <div className="discount-tag">{discount}% OFF</div>
                        <img
                          src={resolveImageSrc(item)}
                          alt={item.name}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/footer-images/food.png";
                          }}
                        />
                        <div className="discount-info">
                          <h4>{item.name}</h4>
                          <div className="discount-rating">
                            <span>⭐ {item.rating}</span>
                            <span className="reviews-text">({item.reviews} reviews)</span>
                          </div>
                          <div className="discount-pricing">
                            <span className="old-price">₹{oldPrice}</span>
                            <span className="new-price">₹{newPrice}</span>
                          </div>
                          <button
                            className="btn btn-sm"
                            onClick={() =>
                              handleAddToCart({
                                id: item.id,
                                title: item.name,
                                price: newPrice,
                                img: resolveImageSrc(item),
                              })
                            }
                          >
                            Grab Now
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="preview-section fancy-section">
                <div className="preview-section-header section-title-wrapper">
                  <span className="section-badge">RECENT</span>
                  <h2 className="heading-title">Recent Orders</h2>
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
                      <div className="discount-item section-card" key={item.id}>
                        <div className="discount-tag">{discount}% OFF</div>
                        <img
                          src={resolveImageSrc(item)}
                          alt={item.name}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/footer-images/food.png";
                          }}
                        />
                        <div className="discount-info">
                          <h4>{item.name}</h4>
                          <div className="discount-rating">
                            <span>⭐ {item.rating}</span>
                            <span className="reviews-text">({item.reviews} reviews)</span>
                          </div>
                          <div className="discount-pricing">
                            <span className="old-price">₹{oldPrice}</span>
                            <span className="new-price">₹{newPrice}</span>
                          </div>
                          <button
                            className="btn btn-sm"
                            onClick={() =>
                              handleAddToCart({
                                id: item.id,
                                title: item.name,
                                price: newPrice,
                                img: resolveImageSrc(item),
                              })
                            }
                          >
                            Grab Now
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

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
                    {[
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
                    ].map((item, index) => (
                      <div className="discount-item section-card" key={`${i}-${index}`}>
                        <button
                          type="button"
                          className={`bookmark-icon ${
                            discountBookmarked[item.id] ? "active" : ""
                          }`}
                          title={
                            discountBookmarked[item.id]
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }
                          aria-label="favorite-toggle"
                          onClick={() =>
                            handleBookmarkToggle(item.id, "discount")
                          }
                        >
                          {discountBookmarked[item.id] ? (
                            <FavoriteIcon fontSize="small" />
                          ) : (
                            <FavoriteBorderIcon fontSize="small" />
                          )}
                        </button>
                        <div className="discount-tag">{item.discount}</div>
                        <img src={item.img} alt={item.title} />
                        <div className="discount-info">
                          <h4>{item.title}</h4>
                          <div className="discount-rating">
                            <span>⭐ {item.rating}</span>
                            <span className="reviews-text">
                              ({item.reviews} reviews)
                            </span>
                          </div>
                          <div className="discount-pricing">
                            <span className="old-price">₹{item.oldPrice}</span>
                            <span className="new-price">₹{item.newPrice}</span>
                          </div>
                          <button className="btn btn-sm">Grab Now</button>
                        </div>
                      </div>
                    ))}
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
                        className="trending-items-sub-div section-card"
                        key={`${i}-${item.id}`}
                      >
                        <button
                          type="button"
                          className={`bookmark-icon ${
                            trendingBookmarked[item.id] ? "active" : ""
                          }`}
                          title={
                            trendingBookmarked[item.id]
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }
                          aria-label="favorite-toggle"
                          onClick={() =>
                            handleBookmarkToggle(item.id, "trending")
                          }
                        >
                          {trendingBookmarked[item.id] ? (
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
                        <p className="trending-items-title">
                          {CATEGORY_ICONS[item.category] || "🍽️"} {item.name}
                        </p>
                        <div className="trending-card-details-wrapper">
                          <div className="trending-items-decrp-container">
                            <span className="trending-items-decrp">
                              {item.description}
                            </span>
                          </div>
                          <div className="trending-items-decrp-container">
                            <span className="trending-items-decrp">
                              {item.calories} kcal
                            </span>
                            <b>•</b>
                            <span className="trending-items-decrp">
                              Serves {item.serves}
                            </span>
                          </div>
                          <div className="trending-rating">
                            <span>⭐ {item.rating}</span>
                            <span className="reviews-text">
                              ({item.reviews} reviews)
                            </span>
                          </div>
                          <div className="trending-items-btn">
                            <b>&#8377;{item.price}</b>
                            <button
                              onClick={() => handleAddToCart(item)}
                              className="trending-items-button"
                            >
                              + ADD
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
          {/* <Cart cartItems={cartItems} /> */}

          {/* Chef's Special Section */}
          <h2 className="heading-title">
            <img
              src={`/bodycontent-icons/growth-graph.png`}
              alt="Chef Special"
              className="header-text-icon"
              style={{ width: "30px", height: "30px" }}
            />
            Chef's Special
          </h2>
          <div className="chefs-special-card">
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
          <h2 className="heading-title">
            <img
              src="/bodycontent-icons/growth-graph.png"
              alt="Why Choose Us"
              className="header-text-icon"
              style={{ width: "30px", height: "30px" }}
            />
            Why Choose Us
          </h2>
          <div className="why-choose-us-section">
            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <img
                    src="/footer-images/noun_fresh food_3374221.png"
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
                  <img src="/footer-images/best-price.png" alt="Best Price" />
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
                    src="/footer-images/iconfinder_FoodDelivery-food-delivery-meal-order_6071826.png"
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

          {/* Delivery Payments */}
          <h2 className="heading-title">
            <img
              src="/footer-images/rupee.png"
              alt="Delivery and Payments"
              className="header-text-icon"
              style={{ width: "30px", height: "30px" }}
            />
            Delivery and Payments
          </h2>
          <div className="delivery-payment-section">
            <div className="delivery-content">
              <h2 className="special-heading">Delivery and Payments</h2>
              <p className="special-para">
                Enjoy hassle-free payment with the plenitude of payment options
                available for you. Get live tracking and locate your food on a
                live map. It's quite a sight to see your food arrive to your
                door. Plus, you get a 5% discount on every order every time you
                pay online.
              </p>
              <div className="payment-methods">
                <div className="payment-providers">
                  <p
                    style={{
                      fontSize: "0.85rem",
                      opacity: 0.9,
                      marginBottom: "12px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    Card Payments
                  </p>
                  <div
                    style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}
                  >
                    <img src="/footer-images/paypal.png" alt="paypal" />
                    <img src="/footer-images/visa.png" alt="visa" />
                    <img src="/footer-images/mastercard.png" alt="mastercard" />
                  </div>
                </div>
                <div className="alternative-methods">
                  <p
                    style={{
                      fontSize: "0.85rem",
                      opacity: 0.9,
                      marginBottom: "12px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    Alternative Methods
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <AttachMoneyIcon
                      style={{ fontSize: "1.8rem", color: "#fff" }}
                    />
                    <span style={{ fontWeight: "700", fontSize: "1.1rem" }}>
                      Cash on Delivery
                    </span>
                  </div>
                </div>
                <button
                  className="main-action-btn"
                  style={{ marginLeft: "auto" }}
                >
                  Order Now
                </button>
              </div>
            </div>
            <div className="payment-img-container">
              <img
                src="/footer-images/deliverypayment.jpg"
                alt="delivery"
                className="delivery-img"
              />
            </div>
          </div>

          {/* Pop-up Model */}
          <div
            className="modal fade"
            id="staticBackdrop"
            data-backdrop="static"
            data-keyboard="false"
            tabIndex={-1}
            aria-labelledby="staticBackdropLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog modal-dialog-centered ml-3 mr-3 m-md-auto">
              <div className="modal-content mt-md-3 mb-md-3">
                <div className="modal-header">
                  <h5 className="modal-title" id="staticBackdropLabel">
                    Bill Payment
                  </h5>
                  <button
                    className="close"
                    type="button"
                    data-dismiss="modal"
                    aria-label="Close"
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <div className="modal-body">
                  <div className="container">
                    <div className="row">
                      <div className="col-12">
                        <h4 className="mb-3">Billing address</h4>
                        <form
                          className="needs-validation"
                          noValidate="novalidate"
                        >
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label htmlFor="firstName">First name</label>
                              <input
                                className="form-control"
                                id="firstName"
                                type="text"
                                placeholder=""
                                defaultValue=""
                                required="required"
                              />
                              <div className="invalid-feedback">
                                Valid first name is required
                              </div>
                            </div>
                            <div className="col-md-6 mb-3">
                              <label htmlFor="lastName">Last name</label>
                              <input
                                className="form-control"
                                id="lastName"
                                type="text"
                                placeholder=""
                                defaultValue=""
                                required="required"
                              />
                              <div className="invalid-feedback">
                                Valid last name is required
                              </div>
                            </div>
                          </div>
                          <div className="mb-3">
                            <label htmlFor="username">Username</label>
                            <div className="input-group">
                              <div className="input-group-prepend">
                                <span className="input-group-text">@</span>
                              </div>
                              <input
                                className="form-control"
                                id="username"
                                type="text"
                                placeholder="Username"
                                required="required"
                              />
                              <div
                                className="invalid-feedback"
                                style={{ width: "100%" }}
                              >
                                Your username is required
                              </div>
                            </div>
                          </div>
                          <div className="mb-3">
                            <label htmlFor="email">
                              Email{" "}
                              <span className="text-muted">(Optional)</span>
                            </label>
                            <input
                              className="form-control"
                              id="email"
                              type="email"
                              placeholder="you@example.com"
                            />
                            <div className="invalid-feedback">
                              Please enter a valid email address for shipping
                              updates
                            </div>
                          </div>
                          <div className="mb-3">
                            <label htmlFor="address">Address</label>
                            <input
                              className="form-control"
                              id="address"
                              type="text"
                              placeholder="1234 Main St"
                              required="required"
                              value={addressValue || ""}
                              onChange={e => setAddressValue(e.target.value)}
                            />
                            <div className="invalid-feedback">
                              Please enter your shipping address
                            </div>

                          </div>
                          <div className="mb-3">
                            <label htmlFor="address2">
                              Address 2{" "}
                              <span className="text-muted">(Optional)</span>
                            </label>
                            <input
                              className="form-control"
                              id="address2"
                              type="text"
                              placeholder="Apartment or suite"
                            />
                          </div>
                          <div className="row">
                            <div className="col-md-5 mb-3">
                              <label htmlFor="country">Country</label>
                              <select
                                className="custom-select d-block w-100"
                                id="country"
                                required="required"
                              >
                                <option value="">Choose...</option>
                                <option>United States</option>
                              </select>
                              <div className="invalid-feedback">
                                Please select a valid country
                              </div>
                            </div>
                            <div className="col-md-4 mb-3">
                              <label htmlFor="state">State</label>
                              <select
                                className="custom-select d-block w-100"
                                id="state"
                                required="required"
                              >
                                <option value="">Choose...</option>
                                <option>California</option>
                              </select>
                              <div className="invalid-feedback">
                                Please provide a valid state
                              </div>
                            </div>
                            <div className="col-md-3 mb-3">
                              <label htmlFor="zip">Zip</label>
                              <input
                                className="form-control"
                                id="zip"
                                type="text"
                                placeholder=""
                                required="required"
                              />
                              <div className="invalid-feedback">
                                Zip code required
                              </div>
                            </div>
                          </div>
                          <hr className="mb-4" />
                          <div className="custom-control custom-checkbox">
                            <input
                              className="custom-control-input"
                              id="same-address"
                              type="checkbox"
                            />
                            <label
                              className="custom-control-label"
                              htmlFor="same-address"
                            >
                              Shipping address is the same as my billing address
                            </label>
                          </div>
                          <div className="custom-control custom-checkbox">
                            <input
                              className="custom-control-input"
                              id="save-info"
                              type="checkbox"
                            />
                            <label
                              className="custom-control-label"
                              htmlFor="save-info"
                            >
                              Save this information for next time
                            </label>
                          </div>
                          <hr className="mb-4" />
                          <h4 className="mb-3">Payment</h4>
                          <div className="d-block my-3">
                            <div className="custom-control custom-radio">
                              <input
                                className="custom-control-input"
                                id="credit"
                                name="paymentMethod"
                                type="radio"
                                defaultChecked="checked"
                                required="required"
                              />
                              <label
                                className="custom-control-label"
                                htmlFor="credit"
                              >
                                Credit card
                              </label>
                            </div>
                            <div className="custom-control custom-radio">
                              <input
                                className="custom-control-input"
                                id="debit"
                                name="paymentMethod"
                                type="radio"
                                required="required"
                              />
                              <label
                                className="custom-control-label"
                                htmlFor="debit"
                              >
                                Debit card
                              </label>
                            </div>
                            <div className="custom-control custom-radio">
                              <input
                                className="custom-control-input"
                                id="paypal"
                                name="paymentMethod"
                                type="radio"
                                required="required"
                              />
                              <label
                                className="custom-control-label"
                                htmlFor="paypal"
                              >
                                Paypal
                              </label>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label htmlFor="cc-name">Name on card</label>
                              <input
                                className="form-control"
                                id="cc-name"
                                type="text"
                                placeholder=""
                                required="required"
                              />
                              <small className="text-muted">
                                Full name as displayed on card
                              </small>
                              <div className="invalid-feedback">
                                Name on card is required
                              </div>
                            </div>
                            <div className="col-md-6 mb-3">
                              <label htmlFor="cc-number">
                                Credit card number
                              </label>
                              <input
                                className="form-control"
                                id="cc-number"
                                type="text"
                                placeholder=""
                                required="required"
                              />
                              <div className="invalid-feedback">
                                Credit card number is required
                              </div>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-md-3 mb-3">
                              <label htmlFor="cc-expiration">Expiration</label>
                              <input
                                className="form-control"
                                id="cc-expiration"
                                type="text"
                                placeholder=""
                                required="required"
                              />
                              <div className="invalid-feedback">
                                Expiration date required
                              </div>
                            </div>
                            <div className="col-md-3 mb-3">
                              <label htmlFor="cc-expiration">CVV</label>
                              <input
                                className="form-control"
                                id="cc-cvv"
                                type="text"
                                placeholder=""
                                required="required"
                              />
                              <div className="invalid-feedback">
                                Security code required
                              </div>
                            </div>
                          </div>
                          <hr className="mb-4" />
                          <div className="model-btn-div">
                            <button
                              className="btn btn-primary btn-lg btn-block"
                              type="submit"
                            >
                              Continue to checkout
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Thank you section */}
          <h2 className="heading-title">
            <img
              src={`/footer-images/best-price.png`}
              alt="Thank You"
              className="header-text-icon"
              style={{ width: "30px", height: "30px" }}
            />
            Thank You
          </h2>
          <div className="thankyou-section">
            <div className="row align-items-center">
              <div className="col-md-7">
                <h1 className="thankyou-heading">
                  Thank you for being a valuable customer to us
                </h1>
                <p className="thankyou-para">
                  We appreciate your trust in us. We hope you enjoyed our food
                  and service. Here is a small gift from our side for your next
                  order.
                </p>
                <b className="thankyou-b">Keep visiting - TASTY KITCHEN</b>
                <div className="mt-3">
                  <button
                    className="main-action-btn"
                    data-toggle="modal"
                    data-target="#ThankyouexampleModal"
                  >
                    Redeem Now
                  </button>
                </div>
              </div>
              <div className="col-md-5">
                <img
                  src="/footer-images/gift1.png"
                  alt="gift-box"
                  style={{
                    width: "100%",
                    maxWidth: "300px",
                    margin: "0 auto",
                    display: "block",
                  }}
                />
              </div>
            </div>
          </div>
          <div
            className="modal fade"
            id="ThankyouexampleModal"
            tabIndex={-1}
            aria-labelledby="exampleModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog modal-dialog-centered ml-3 mr-3 m-md-auto">
              <div
                className="modal-content mt-md-3 mb-md-3"
                id="tq-model-content"
              >
                <div className="modal-header">
                  <h5 className="modal-title" id="exampleModalLabel">
                    Here is your gift voucher!
                  </h5>
                  <button
                    className="close"
                    type="button"
                    data-dismiss="modal"
                    aria-label="Close"
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <div className="modal-body">...</div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    type="button"
                    data-dismiss="modal"
                  >
                    Close
                  </button>
                  <button className="btn btn-primary" type="button">
                    Save changes
                  </button>
                </div>
              </div>
            </div>
          </div>

          <Footer />

          {/* Filter Overlay */}
          {showFilter && <Filter onClose={() => setShowFilter(false)} />}
        </>
      )}
    </div>
  );
};

export default Bodycontent;
