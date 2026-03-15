import React, { useState, useEffect } from "react";
import styles from "./BannerCarousel.module.css";

const slides = [
  {
    url: "/banner-images/banner0.jpg",
    title: "Fruits and Salads",
    category: "Salads",
  },
  {
    url: "/banner-images/banner1.jpg",
    title: "Burgers and French Fries",
    category: "Hot Offers",
  },
  {
    url: "/banner-images/banner2.jpg",
    title: "Fresh and Organic Veggies",
    category: "Veg Starters",
  },
  {
    url: "/banner-images/banner3.jpg",
    title: "Hot and Spicy Sea Foods",
    category: "Non-Veg Starters",
  },
  {
    url: "/banner-images/banner4.jpg",
    title: "Fresh salads with Veggies",
    category: "Salads",
  },
];

const BannerCarousel = ({ onSectionChange }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Mapping of category display names to their section IDs (from Sidebar sectionMap)
  const categoryToSection = {
    "Hot Offers": "Home",
    "Veg Starters": "VegStarters",
    "Non-Veg Starters": "NonVegStarters",
    Tandooris: "Tandooris",
    Soups: "Soups",
    Salads: "Salads",
    Sandwiches: "Sandwiches",
    "Signature Dishes": "SignatureDishes",
    Biryanis: "Biryanis",
    "Main Course": "MainCourse",
    "Rice & Breads": "RiceBreads",
    "South Indian": "SouthIndian",
    "Chinese": "IndoChinese",
    Beverages: "Beverages",
    "Cocktails/Mocktails": "Cocktails",
    Desserts: "Desserts",
  };

  const handleViewMenu = (category) => {
    if (onSectionChange) {
      const section = categoryToSection[category] || "Home";
      onSectionChange(section, category);
      
      // Smooth scroll to the menu display section if it exists
      const menuSection = document.querySelector(".offers-section") || document.querySelector(".home-container");
      if (menuSection) {
        menuSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + slides.length) % slides.length
    );
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 6000); // Increased time slightly for better readability
    return () => clearInterval(interval);
  }, [currentIndex]); // Reset interval when slide changes manually

  const renderCarouselItem = (index) => (
    <div
      className={`${styles.item} ${currentIndex === index ? styles.itemActive : ""}`}
      key={index}
    >
      <div className={styles.imageWrapper}>
        <img
          src={slides[index].url}
          className={styles.itemImg}
          alt={slides[index].title}
          loading={index === 0 ? "eager" : "lazy"} // Eager load only the first slide
          onError={(e) => {
            console.error(`Failed to load banner image: ${slides[index].url}`);
            e.currentTarget.onerror = null;
            e.currentTarget.src = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&h=450";
          }}
        />
      </div>
      <div className={styles.captionOverlay}>
        <div className={styles.captionContent}>
          <span className={styles.subtitle}>Taste of Excellence</span>
          <h2 className={styles.title}>{slides[index].title}</h2>
          <p className={styles.description}>
            Experience culinary perfection with our fresh, locally sourced ingredients and masterfully crafted recipes.
          </p>
          <button 
            className={styles.ctaButton}
            onClick={() => handleViewMenu(slides[index].category)}
          >
            View Menu
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div 
      className={styles.carouselRoot}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div 
        className={styles.inner}
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((_, index) => renderCarouselItem(index))}
      </div>

      {/* Navigation Arrows */}
      <button className={`${styles.control} ${styles.prev}`} onClick={prevSlide}>
        ❰
      </button>
      <button className={`${styles.control} ${styles.next}`} onClick={nextSlide}>
        ❱
      </button>

      {/* Indicators */}
      <div className={styles.indicators}>
        {slides.map((_, index) => (
          <div
            key={index}
            className={`${styles.dot} ${currentIndex === index ? styles.dotActive : ""}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerCarousel;
