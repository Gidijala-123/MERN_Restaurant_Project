import React, { useState } from "react";

const slides = [
  {
    url: "./banner-images/banner0.jpg",
    title: "Fruits and Salads",
  },
  {
    url: "./banner-images/banner1.jpg",
    title: "Burgers and French Fries",
  },
  {
    url: "./banner-images/banner2.jpg",
    title: "Fresh and Organic Veggies",
  },
  {
    url: "./banner-images/banner3.jpg",
    title: "Hot and Spicy Sea Foods",
  },
  {
    url: "./banner-images/banner4.jpg",
    title: "Fresh salads with Veggies",
  },
];

const BannerCarousel = () => {
  const [currentIndex] = useState(0);

  const renderCarouselItem = (index) => (
    <div
      className={`carousel-item ${currentIndex === index ? "active" : ""}`}
      key={index}
      data-bs-interval={5000}
      style={{ height: "35rem", position: "relative" }}
    >
      <img
        src={slides[index].url}
        className="d-block w-100"
        alt="..."
        loading="lazy"
      />
      <div
        className="carousel-caption d-flex flex-column justify-content-center align-items-center"
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          color: "#fff",
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          borderRadius: "0.8rem",
          padding: "20px",
        }}
      >
        <h4 style={{ textShadow: "0 0 2px #fff" }}>Are You Hungry ?</h4>
        <h2
          className="carousal-title"
          style={{
            fontWeight: "600",
            textShadow: "0 0 3px #ACBF60,0 0 9px #ACBF60",
          }}
        >
          {slides[index].title}
        </h2>
        <p style={{ fontStyle: "italic", color: "#ffdd4d", fontWeight: "500" }}>
          Start to order food now
        </p>
        <button
          className="btn"
          style={{
            backgroundColor: "#ACBF60",
            color: "#fff",
            margin: "10px 0",
          }}
        >
          Check Out Menu
        </button>
      </div>
    </div>
  );

  return (
    <div
      id="carouselExampleDark"
      className="carousel carousel-dark slide"
      data-bs-ride="carousel"
      style={{
        maxHeight: "33rem",
        overflow: "hidden",
        borderRadius: "0.8rem",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="carousel-inner">
        {slides.map((_, index) => renderCarouselItem(index))}
      </div>
      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#carouselExampleDark"
        data-bs-slide="prev"
        style={{ width: "5%", zIndex: "1" }}
      >
        <div style={{ fontSize: "2rem" }}>❰</div>
        <span className="visually-hidden">Previous</span>
      </button>
      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#carouselExampleDark"
        data-bs-slide="next"
        style={{ width: "5%", zIndex: "1" }}
      >
        <div style={{ fontSize: "2rem" }}>❱</div>
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
};

export default BannerCarousel;
