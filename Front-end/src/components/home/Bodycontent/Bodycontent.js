import React, { useState } from "react";
import BreadcrumbsComponent from "../BreadCrumb/BreadCrumb";
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

  const goTo = (section) => {
    setNav((prev) => ({
      ...Object.fromEntries(
        Object.keys(prev).map((key) => [key, key === section])
      ),
    }));
  };

  const ourOffers = [
    {
      image: "/footer-images/drinks.jpg",
      category: "Fresh Veggies",
      description: "FRESH SUMMER DRINKS WITH JUST",
      cost: "121.00",
    },
    {
      image: "/footer-images/veggies.jpg",
      category: "Ice Creams",
      description: "FRESH SUMMER WITH JUST",
      cost: "190.00",
    },
    {
      image: "/footer-images/ice_cream.jpg",
      category: "Cool Beverages",
      description: "FRESH SUMMER WITH JUST",
      cost: "99.00",
    },
  ];

  //  carttttt
  const { data, err, isLoading } = useGetAllProductsQuery();
  const dispatch = useDispatch();
  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
  };

  // carouselllll

  const containerStyles = {
    width: "100%",
    height: "32rem",
    margin: "0 auto",
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
          {/* Bread Crumb */}

          {/* Our offers */}

          {/* Trending today */}
          <h2 className="heading-title">
            <span>
              <img
                src={`/bodycontent-icons/growth-graph.png`}
                alt="Flaticon Icon"
                width="30"
                height="25"
                className="header-text-icon"
              />
              &#8197;
            </span>
            Trending Today
          </h2>
          <div className="trending-items-container d-flex flex-row flex-md-row flex-sm-column justify-content-between ">
            {data?.map((product) => {
              return (
                <div className="trending-items-sub-div" key={product.id}>
                  <img src={product.img} alt="trending-items-img " />
                  <p className="trending-items-title">{product.title}</p>
                  <div>
                    <span className="trending-items-decrp">
                      {product.decrp}
                    </span>
                    <b>&#x2B29;</b>
                    <span className="trending-items-decrp">
                      {product.serves}
                    </span>
                  </div>
                  <p className="trending-items-btn">
                    <b>&#8377;{product.price}</b>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="trending-items-button"
                    >
                      + ADD
                    </button>
                  </p>
                </div>
              );
            })}
          </div>
          {/* <Cart cartItems={cartItems} /> */}

          {/* Healthy Card */}

          {/* Delivery Payments */}

          {/* Pop-up Model */}

          {/* Thank you section */}

          {/* Follow Us */}

          {/* <Footer /> */}
        </>
      )}
    </div>
  );
};

export default Bodycontent;
