import React, { useState } from "react";
import BannerCarousel from "../BannerCarousel/BannerCarousel";
import FreshFood from "./FRESHFOOD/FreshFood";
import Bakery from "./BAKERY/Bakery";
import Drinks from "./DRINKS/Drinks";
import Shop from "./SHOP/Shop";
import Pages from "./PAGES/Pages";
import Blog from "./BLOG/Blog";
import Contact from "./CONTACT/Contact";
import "./Bodycontent.css";
import Footer from "./FOOTER/Footer";
import Filter from "./FILTER_COMPONENT/Filter";

// carttttt
import { useDispatch } from "react-redux";
import { addToCart } from "../../features/cartSlice";
import { useGetAllProductsQuery } from "../../features/productsApi";

const Bodycontent = (props) => {
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

  // Load bookmarks from localStorage on mount
  React.useEffect(() => {
    const savedDiscount = JSON.parse(
      localStorage.getItem("discountBookmarked") || "{}"
    );
    const savedTrending = JSON.parse(
      localStorage.getItem("trendingBookmarked") || "{}"
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
    } else if (section === "trending") {
      const updated = {
        ...trendingBookmarked,
        [itemId]: !trendingBookmarked[itemId],
      };
      setTrendingBookmarked(updated);
      localStorage.setItem("trendingBookmarked", JSON.stringify(updated));
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
          Object.keys(prev).map((key) => [key, key === props.currentSection])
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
          Object.keys(prev).map((key) => [key, key === section])
        ),
      }));
    }
  };

  const CATEGORY_LIST = [
    "Fruits",
    "Vegetables",
    "Drinks",
    "Bakery",
    "Buffer & Eggs",
    "Milk & Creams",
    "Meats",
    "Fish",
  ];

  const CATEGORY_ITEMS = Object.fromEntries(
    CATEGORY_LIST.map((cat) => [cat, []])
  );

  const TOTAL_ITEMS = 36;
  const IMAGE_KEYWORDS = {
    Fruits: "fresh-fruit,fruits,apple,banana,citrus",
    Vegetables: "vegetables,greens,broccoli,carrot,lettuce",
    Drinks: "drinks,juice,smoothie,mojito",
    Bakery: "bakery,bread,croissant,cake,pastry",
    "Buffer & Eggs": "eggs,breakfast",
    "Milk & Creams": "milk,ice-cream,cream,dairy",
    Meats: "meat,steak,chicken,bbq",
    Fish: "fish,seafood,salmon,sushi",
  };
  const IMAGE_FALLBACK = {
    Fruits: "/footer-images/veggies.jpg",
    Vegetables: "/footer-images/veggies.jpg",
    Drinks: "/footer-images/drinks.jpg",
    Bakery: "/footer-images/desserts.jpg",
    "Buffer & Eggs": "/footer-images/burger.png",
    "Milk & Creams": "/footer-images/ice_cream.jpg",
    Meats: "/footer-images/original-bd99e6afd7177b69f8bdf6bfe7fd0643.jpg",
    Fish: "/footer-images/desserts.jpg",
  };
  const PRODUCTS = Array.from({ length: TOTAL_ITEMS }, (_, i) => {
    const cat = CATEGORY_LIST[i % CATEGORY_LIST.length];
    const base = cat.toLowerCase().replace(/[^\w]+/g, "-");
    const item = {
      id: `${base}-${i + 1}`,
      name: `${cat} Item ${i + 1}`,
      price: 60 + ((i * 17) % 240),
      rating: (4 + (i % 6) * 0.1).toFixed(1),
      calories: 150 + i * 15,
      image: `https://source.unsplash.com/600x400/?${encodeURIComponent(
        IMAGE_KEYWORDS[cat]
      )}&sig=${i}`,
      imageFallback: IMAGE_FALLBACK[cat],
      category: cat,
    };
    CATEGORY_ITEMS[cat].push(item);
    return item;
  });

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
                                  e.currentTarget.src = item.imageFallback;
                                }}
                              />
                              <p className="trending-items-title">
                                {item.name}
                              </p>
                              <div className="trending-card-details-wrapper">
                                <div className="trending-rating">
                                  <span>⭐ {item.rating}</span>
                                  <span className="reviews-text">(200+)</span>
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
          {![
            "Fruits",
            "Vegetables",
            "Drinks",
            "Bakery",
            "Buffer & Eggs",
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
                    <i className="fas fa-filter"></i>
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
                      <FreshFood key={key} />
                    ) : key === "Bakery" ? (
                      <Bakery key={key} />
                    ) : key === "Drinks" ? (
                      <Drinks key={key} />
                    ) : key === "Shop" ? (
                      <Shop key={key} />
                    ) : key === "Pages" ? (
                      <Pages key={key} />
                    ) : key === "Blog" ? (
                      <Blog key={key} />
                    ) : (
                      <Contact key={key} />
                    ))
                )}
              </div>

              {/* Our offers */}
              <h2 className="heading-title">
                {/* <span>
              <img
                src={`/bodycontent-icons/sale-time.png`}
                alt="Flaticon Icon"
                width="30"
                height="30"
                className="header-text-icon"
              />
              &#8197;
            </span> */}
                Our Offers
              </h2>
              <div className="offers-main-div">
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
                  const filtered = isCategory
                    ? PRODUCTS.filter(
                        (p) => p.category === props.activeCategory
                      )
                    : PRODUCTS;
                  if (filtered.length === 0) {
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
                  return filtered.map((each) => (
                    <div key={each.id} className="offer-card">
                      <img
                        className="offer-image"
                        src={each.image}
                        alt={each.name}
                        onError={(e) => {
                          e.currentTarget.src = IMAGE_FALLBACK[each.category];
                        }}
                      />
                      <span className="offer-cat">{each.category}</span>
                      <div className="offer-title">
                        {each.name} &#8377;{each.price}
                      </div>
                      <button className="btn shopnow-btn">SHOP NOW</button>
                    </div>
                  ));
                })()}
              </div>

              <div className="preview-section">
                <div className="preview-section-header">
                  <h2 className="heading-title">Popular Dishes</h2>
                  <span
                    className="view-all-link"
                    onClick={() =>
                      props.onSectionChange &&
                      props.onSectionChange("Home", "Bakery")
                    }
                  >
                    View All
                  </span>
                </div>
                <div className="trending-items-container">
                  {PRODUCTS.filter((p) => p.category === "Bakery")
                    .slice(0, 6)
                    .map((item) => (
                      <div className="trending-items-sub-div" key={item.id}>
                        <img
                          src={item.imageFallback}
                          alt={item.name}
                          onError={(e) => {
                            e.currentTarget.src =
                              IMAGE_FALLBACK["Bakery"] ||
                              "/footer-images/desserts.jpg";
                          }}
                        />
                        <p className="trending-items-title">{item.name}</p>
                        <div className="trending-card-details-wrapper">
                          <div className="trending-rating">
                            <span>⭐ 4.8</span>
                            <span className="reviews-text">(120+)</span>
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

              <div className="preview-section">
                <div className="preview-section-header">
                  <h2 className="heading-title">Recent Orders</h2>
                  <span
                    className="view-all-link"
                    onClick={() =>
                      props.onSectionChange &&
                      props.onSectionChange("Home", "Meats")
                    }
                  >
                    View All
                  </span>
                </div>
                <div className="trending-items-container">
                  {PRODUCTS.filter((p) => p.category === "Meats")
                    .slice(0, 6)
                    .map((item) => (
                      <div className="trending-items-sub-div" key={item.id}>
                        <img
                          src={item.imageFallback}
                          alt={item.name}
                          onError={(e) => {
                            e.currentTarget.src =
                              IMAGE_FALLBACK["Meats"] ||
                              "/footer-images/original-bd99e6afd7177b69f8bdf6bfe7fd0643.jpg";
                          }}
                        />
                        <p className="trending-items-title">{item.name}</p>
                        <div className="trending-card-details-wrapper">
                          <div className="trending-rating">
                            <span>⭐ 4.7</span>
                            <span className="reviews-text">(90+)</span>
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
                      <div className="discount-item" key={`${i}-${index}`}>
                        <i
                          className={`${
                            discountBookmarked[item.id] ? "fas" : "far"
                          } fa-heart bookmark-icon`}
                          title={
                            discountBookmarked[item.id]
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }
                          aria-label="favorite-toggle"
                          onClick={() =>
                            handleBookmarkToggle(item.id, "discount")
                          }
                        ></i>
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
          <h2 className="heading-title">
            <img
              src={`/bodycontent-icons/trending.png`}
              alt="Trending"
              className="header-text-icon"
              style={{ width: "30px", height: "30px" }}
            />
            Trending Today
          </h2>
          <div className="trending-items-container">
            {data?.map((product) => {
              return (
                <div className="trending-items-sub-div" key={product.id}>
                  <i
                    className={`${
                      trendingBookmarked[product.id] ? "fas" : "far"
                    } fa-heart bookmark-icon`}
                    title={
                      trendingBookmarked[product.id]
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                    aria-label="favorite-toggle"
                    onClick={() => handleBookmarkToggle(product.id, "trending")}
                  ></i>
                  <img src={product.img} alt="trending-items-img " />
                  <p className="trending-items-title">{product.title}</p>
                  <div className="trending-card-details-wrapper">
                    <div className="trending-rating">
                      <span>⭐ {product.rating || "4.5"}</span>
                      <span className="reviews-text">
                        ({product.reviews || "100+"} reviews)
                      </span>
                    </div>
                    <div className="trending-items-decrp-container">
                      <span className="trending-items-decrp">
                        {product.decrp}
                      </span>
                      <b>&#x2B29;</b>
                      <span className="trending-items-decrp">
                        {product.serves}
                      </span>
                    </div>
                    <div className="trending-items-btn">
                      <b>&#8377;{product.price}</b>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="trending-items-button"
                      >
                        + ADD
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
              src="/footer-images/best-price.png"
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
                  <i
                    className="fas fa-headset"
                    style={{ fontSize: "30px", color: "var(--primary)" }}
                  ></i>
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
              src={`/bodycontent-icons/sale-time.png`}
              alt="Delivery"
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
                    <i
                      className="fas fa-money-bill-wave"
                      style={{ fontSize: "1.8rem", color: "#fff" }}
                    ></i>
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

          {/* Download App Section */}
          <div className="download-app-section">
            <div className="download-app-content">
              <h2>Experience the best with our Mobile App</h2>
              <p>
                Download our app for exclusive deals, live order tracking, and a
                smoother ordering experience.
              </p>
              <div className="app-buttons">
                <a href="#" className="app-btn">
                  <i className="fab fa-apple"></i>
                  <div className="app-btn-text">
                    <span>Download on the</span>
                    <strong>App Store</strong>
                  </div>
                </a>
                <a href="#" className="app-btn">
                  <i className="fab fa-google-play"></i>
                  <div className="app-btn-text">
                    <span>Get it on</span>
                    <strong>Google Play</strong>
                  </div>
                </a>
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
