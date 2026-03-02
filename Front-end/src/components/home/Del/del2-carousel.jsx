import { useState, useEffect } from "react";

const slideStyles = {
  width: "100%",
  height: "100%",
  borderRadius: "10px",
  backgroundSize: "cover",
  backgroundPosition: "center",
  position: "relative", // Added position relative for positioning text and button
};

const rightArrowStyles = {
  position: "absolute",
  top: "50%",
  transform: "translate(0, -50%)",
  right: "32px",
  fontSize: "45px",
  color: "#fff",
  zIndex: 1,
  cursor: "pointer",
};

const leftArrowStyles = {
  position: "absolute",
  top: "50%",
  transform: "translate(0, -50%)",
  left: "32px",
  fontSize: "45px",
  color: "#fff",
  zIndex: 1,
  cursor: "pointer",
};

const sliderStyles = {
  position: "relative",
  height: "100%",
};

const BannerCarousel = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };
  const goToNext = () => {
    const isLastSlide = currentIndex === slides.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      goToNext();
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const slideStylesWidthBackground = {
    ...slideStyles,
    backgroundImage: `url(${slides[currentIndex].url})`,
  };

  return (
    <div style={sliderStyles}>
      <div>
        <div onClick={goToPrevious} style={leftArrowStyles}>
          ❰
        </div>
        <div onClick={goToNext} style={rightArrowStyles}>
          ❱
        </div>
      </div>
      <div style={slideStylesWidthBackground}>
        <div className="d-flex flex-column align-items-center justify-content-center h-100">
          <h4
            style={{
              color: "#fff",
              textShadow: "0 0 2px #fff",
            }}
          >
            Are You Hungry ?
          </h4>
          <h2
            className="carousal-title"
            style={{
              color: "wheat",
              fontWeight: "600",
              textShadow: "0 0 3px #ACBF60,0 0 9px #ACBF60",
            }}
          >
            {slides[currentIndex].title}
          </h2>
          <p style={{ color: "#fff",fontStyle:'italic' }}>Start to order food now</p>
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
    </div>
  );
};

export default BannerCarousel;
