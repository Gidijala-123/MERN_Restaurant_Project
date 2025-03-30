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
          <div>
            <BreadcrumbsComponent
              className="breadcrumb-div"
              navC={navTocomponents}
              setHome={() => goTo("Home")}
              setFreshFood={() => goTo("FreshFood")}
              setBakery={() => goTo("Bakery")}
              setDrinks={() => goTo("Drinks")}
              setShop={() => goTo("Shop")}
              setPages={() => goTo("Pages")}
              setBlog={() => goTo("Blog")}
              setContact={() => goTo("Contact")}
            />
            {Object.entries(navTocomponents)?.map(
              ([key, value]) =>
                value &&
                (key === "Home" ? (
                  <div className="bannerCarousel-div">
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
          <div className="offers-main-div d-flex flex-md-row flex-sm-column justify-content-between">
            {ourOffers?.map((each, index) => (
              <div
                key={index}
                className="individual-div col-12 col-md-4"
                style={{
                  backgroundImage: `url(${each.image})`,
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                  // backgroundPosition: "center",
                  padding: "20px",
                  color: "#fff",
                  textAlign: "center",
                }}
              >
                <p>{each.category}</p>
                <h4>
                  {each.description} &#8377;{each.cost}
                </h4>
                <button className="btn shopnow-btn ">SHOP NOW</button>
              </div>
            ))}
          </div>

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
          <h2 className="heading-title">
            {/* <span>
              <img
                src={`/bodycontent-icons/growth-graph.png`}
                alt="Flaticon Icon"
                width="30"
                height="25"
                className="header-text-icon"
              />
              &#8197;
            </span> */}
            Healthy Card
          </h2>
          <div className="healthy-card">
            <div className="container-fluid m-0">
              <div className="row">
                <div className="col-12 col-md-7 d-md-none">
                  <h1 className="col-12 healthy-heading">
                    Fresh, Healthy, Organic, Delicious Fruits
                  </h1>
                </div>
                <div className="col-12 col-md-5">
                  <img
                    className="healthy-img w-100 mb-3 mt-md-3"
                    src="/banner-images/banner0.jpg"
                    alt="healty-img"
                  />
                </div>
                <div className="col-12 col-md-7 m-md-auto">
                  <h1 className="col-12 healthy-heading d-none d-md-block">
                    Fresh, Healthy, Organic, Delicious Fruits
                  </h1>
                  <p className="healthy-para pl-2 pr-2">
                    Say no to harmful chemicals and go fully organic with our
                    range of fresh fruits and veggies. Pamper your body and your
                    senses with the true and unadulterated gifts from mother
                    nature. with the true and unadulterated gifts from mother
                    nature.
                  </p>
                  <button className="healthy-btn btn bg-success rounded-pill text-white ml-2">
                    Watch Video
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Payments */}
          <h2 className="heading-title">
            {/* <span>
              <img
                src={`/bodycontent-icons/growth-graph.png`}
                alt="Flaticon Icon"
                width="30"
                height="25"
                className="header-text-icon"
              />
              &#8197;
            </span> */}
            Delivery and Payments
          </h2>
          <div className="delivery-payments-section healthy-card">
            <div className="container-fluid">
              <div className="row">
                <div className="col-12 col-md-7 d-md-none">
                  <h1 className="col-12 healthy-heading">
                    Delivery and payment
                  </h1>
                </div>
                <div className="col-12 col-md-5 order-md-last">
                  <img
                    className="healthy-img w-100 mb-3 mt-md-3"
                    src="/footer-images/deliverypayment.jpg"
                    alt="healthy-img"
                  />
                </div>
                <div className="col-12 col-md-7 m-md-auto">
                  <h1 className="col-12 healthy-heading d-none d-md-block">
                    Delivery and Payments
                  </h1>
                  <p className="healthy-para pl-2 pr-2">
                    Enjoy hassle free payment with the plenitude of payment
                    options available for you. Get live tracking and locate your
                    food on a live map. It's quite a sight to see your food
                    arrive to your door. Plus, you get a
                    <em>
                      <b> 5% discount </b>
                    </em>
                    on every order every time you pay online.
                  </p>
                  <div className="d-flex flex-row justify-content-center justify-content-md-start">
                    <img
                      alt="payment-img"
                      className="payment-icon mt-3"
                      src="/footer-images/paypal.png"
                    />
                    <img
                      alt="payment-img"
                      className="payment-icon mt-3"
                      src="/footer-images/visa.png"
                    />
                    <img
                      alt="payment-img"
                      className="payment-icon mt-3"
                      src="/footer-images/americanexpress.png"
                    />
                    <img
                      alt="payment-img"
                      className="payment-icon mt-3"
                      src="/footer-images/mastercard.png"
                    />
                    <button
                      className="payment-btn-md btn bg-warning rounded-pill text-black font-weight-bold ml-3 mt-3 d-none d-md-block"
                      data-toggle="modal"
                      data-target="#staticBackdrop"
                    >
                      Order Now
                    </button>
                  </div>
                  <div className="text-center d-md-none">
                    <button
                      className="payment-btn-xm btn bg-warning rounded-pill text-black font-weight-bold ml-2 mb-3 mt-1"
                      data-toggle="modal"
                      data-target="#staticBackdrop"
                    >
                      Order Now
                    </button>
                  </div>
                </div>
              </div>
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
            {/* <span>
              <img
                src={`/bodycontent-icons/growth-graph.png`}
                alt="Flaticon Icon"
                width="30"
                height="25"
                className="header-text-icon"
              />
              &#8197;
            </span> */}
            Thank You
          </h2>
          <div className="thankyou-section">
            <div className="container-fluid">
              <div className="row">
                <div className="col-12 col-md-7 d-md-none">
                  <h1 className="thankyou-heading">
                    Thank you for being a valuable customer to us
                  </h1>
                </div>
                <div className="col-12 d-md-none mb-3">
                  <img
                    alt="thankyou"
                    className="thankyou-img1 w-100"
                    src="/footer-images/gift1.png"
                  />
                </div>
                <div className="col-12 col-md-5 order-md-last d-none d-md-block">
                  <img
                    alt="thankyou"
                    className="thankyou-img2"
                    src="/footer-images/gift1.png"
                  />
                </div>
                <div className="col-12 col-md-7 m-md-auto">
                  <h1 className="thankyou-heading d-none d-md-block">
                    Thank you for being a valuable customer to us
                  </h1>
                  <p className="thankyou-para">
                    Thankyou for choosing us for your food delivery. Hope we
                    reached your expectation. Here is a small gift from our side
                  </p>
                  <b className="thankyou-b">keep visiting...THANKYOU!</b>
                  <button
                    className="payment-btn-md payment-btn btn rounded-pill font-weight-bold my-3 d-none d-md-block"
                    data-toggle="modal"
                    data-target="#ThankyouexampleModal"
                  >
                    Redeem Now
                  </button>
                </div>
                <div className="text-center d-md-none m-3">
                  <button
                    className="btn payment-btn rounded-pill font-weight-bold mb-3 mt-1"
                    data-toggle="modal"
                    data-target="#ThankyouexampleModal"
                  >
                    Redeem Now
                  </button>
                </div>
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

          {/* Follow Us */}
          <div className="follow-us d-flex flex-column justify-content-center">
            <div className="container-fluid">
              <div className="row">
                <h2 className="heading-title col-12">
                  {/* <span>
                    <img
                      src={`/bodycontent-icons/growth-graph.png`}
                      alt="Flaticon Icon"
                      width="30"
                      height="25"
                      className="header-text-icon"
                    />
                    &#8197;
                  </span> */}
                  Follow Us
                </h2>

                <div className="col-12 d-flex-flex-row-justify-content-center mb-3 text-center">
                  <span className="fa-stack fa-lg">
                    <i className="icon fa fa-facebook" />
                  </span>
                  <span className="fa-stack fa-lg">
                    <i className="icon fa fa-instagram" />
                  </span>
                  <span className="fa-stack fa-lg">
                    <i className="icon fa fa-whatsapp" />
                  </span>
                  <span className="fa-stack fa-lg">
                    <i className="icon fa fa-github" />
                  </span>
                  <span className="fa-stack fa-lg">
                    <i className="icon fa fa-linkedin" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Footer />
        </>
      )}
    </div>
  );
};

export default Bodycontent;
