import React, { useState, useEffect } from "react";
import styles from "./BannerCarousel.module.css";

const slides = [
  {
    url: "/banner-images/banner0.jpg",
    title: "Fruits and Salads",
  },
  {
    url: "/banner-images/banner1.jpg",
    title: "Burgers and French Fries",
  },
  {
    url: "/banner-images/banner2.jpg",
    title: "Fresh and Organic Veggies",
  },
  {
    url: "/banner-images/banner3.jpg",
    title: "Hot and Spicy Sea Foods",
  },
  {
    url: "/banner-images/banner4.jpg",
    title: "Fresh salads with Veggies",
  },
];

const BannerCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + slides.length) % slides.length
    );
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  const renderCarouselItem = (index) => (
    <div
      className={`${styles.item} carousel-item ${
        currentIndex === index ? "active" : ""
      }`}
      key={index}
    >
      <img
        src={slides[index].url}
        className={`${styles.itemImg} d-block w-100`}
        alt="..."
        loading="lazy"
      />
      <div
        className={`${styles.captionOverlay} carousel-caption d-flex flex-column justify-content-center align-items-center`}
      >
        <h4 style={{ textShadow: "0 0 2px #fff" }}>Are You Hungry ?</h4>
        <h2 className={styles.title}>{slides[index].title}</h2>
        <p style={{ fontStyle: "italic", color: "#ffdd4d", fontWeight: "500" }}>
          Start to order food now
        </p>
        <button className="btn" style={{ backgroundColor: "#ACBF60", color: "#fff", margin: "10px 0" }}>
          Check Out Menu
        </button>
      </div>
    </div>
  );

  return (
    <div id="carouselExampleDark" className={`carousel slide ${styles.carouselRoot}`}>
      <div
        className={`carousel-inner ${styles.inner}`}
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((_, index) => renderCarouselItem(index))}
      </div>
      <button
        className="carousel-control-prev"
        type="button"
        onClick={prevSlide}
        style={{
          width: "5%",
          zIndex: "5",
          background: "none",
          border: "none",
          position: "absolute",
          top: "50%",
          left: 0,
          transform: "translateY(-50%)",
          cursor: "pointer",
          color: "white",
        }}
      >
        <div style={{ fontSize: "2rem" }}>❰</div>
        <span className="visually-hidden">Previous</span>
      </button>
      <button
        className="carousel-control-next"
        type="button"
        onClick={nextSlide}
        style={{
          width: "5%",
          zIndex: "5",
          background: "none",
          border: "none",
          position: "absolute",
          top: "50%",
          right: 0,
          transform: "translateY(-50%)",
          cursor: "pointer",
          color: "white",
        }}
      >
        <div style={{ fontSize: "2rem" }}>❱</div>
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
};

export default BannerCarousel;
