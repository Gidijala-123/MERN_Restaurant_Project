import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  clearCart,
  decreaseCart,
  getTotals,
  removeFromCart,
} from "../../features/cartSlice";

import { Link } from "react-router-dom";
import "./Cart.css";
const orderNumber = (length = 7) =>
  [...Array(length)]
    .map(() => Math.random().toString(36)[2])
    .join("")
    .toUpperCase();

const Cart = () => {
  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getTotals());
  }, [cart, dispatch]);

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
  };
  const handleDecreaseCart = (product) => {
    dispatch(decreaseCart(product));
  };
  const handleRemoveFromCart = (product) => {
    dispatch(removeFromCart(product));
  };
  const handleClearCart = () => {
    dispatch(clearCart());
  };

  return (
    <div className="cart-container">
      <h2>Shopping Cart</h2>
      {cart.cartItems.length === 0 ? (
        <div className="cart-empty">
          <p>Your cart is currently empty</p>
          <div className="start-shopping">
            <Link to="/home">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                className="bi bi-arrow-left"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
                />
              </svg>
              <span>Start Shopping</span>
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <div className="d-flex justify-content-between">
            <div className="cart-items col-md-9 text-center">
              <div className="cart-items-heading form-control">
                <div className="col-md-5">
                  <h4>Item Name</h4>
                </div>
                <div className="col-md-1">
                  <h4>Cost</h4>
                </div>
                <div className="col-md-1">
                  <h4>Item count</h4>
                </div>
                <div className="col-md-1">
                  <h4>Price</h4>
                </div>
              </div>

              {cart.cartItems &&
                cart.cartItems.map((cartItem) => (
                  <div className="cart-item col-md-12" key={cartItem.id}>
                    <div className="cart-product col-md-5">
                      <img src={cartItem.img} alt={cartItem.title} />
                      <div className="item-texts">
                        <h3>{cartItem.title}</h3>
                        <p>{cartItem.decrp}</p>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleRemoveFromCart(cartItem)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="cart-product-price col-md-1">
                      {cartItem.price}
                    </div>

                    <div className="cart-product-quantity col-md-1">
                      <button
                        className="btn-minus"
                        onClick={() => handleDecreaseCart(cartItem)}
                      >
                        -
                      </button>

                      <div className="count col-md-2">
                        {cartItem.cartQuantity}
                      </div>
                      <button
                        className="btn-plus"
                        onClick={() => handleAddToCart(cartItem)}
                      >
                        +
                      </button>
                    </div>

                    <div className="cart-product-total-price col-md-1">
                      {cartItem.price * cartItem.cartQuantity}
                    </div>
                  </div>
                ))}
            </div>

            <div className="cart-summary col-md-3 d-flex flex-column">
              <div className="cart-summary-heading d-flex flex-row justify-content-between align-items-center form-control">
                <div>
                  <h4 style={{ margin: "0px", padding: "0px" }}>
                    Cart summary
                  </h4>
                  <small>
                    <b>Order no :</b> {orderNumber()}
                  </small>
                </div>
                <div className="cart-summary-img">
                  <img
                    src="/footer-images/cart.png"
                    alt="cart-logo"
                    style={{ width: "2rem" }}
                  />
                </div>
              </div>
              <div className="cart-checkout form-control w-100 mt-2">
                <div className="subtotal">
                  <span>Sub-Total</span>
                  <span className="amount">{cart.cartTotalAmount}</span>
                </div>
                <div className="subtotal">
                  <span>GST(18%)</span>
                  <span className="amount">
                    +{Math.ceil(cart.cartTotalAmount * 0.18)}
                  </span>
                </div>
                <hr />
                <div className="subtotal">
                  <span>Grand-Total</span>
                  <span className="amount">
                    {cart.cartTotalAmount +
                      Math.ceil(cart.cartTotalAmount * 0.18)}
                  </span>
                </div>{" "}
                <p>Taxes and shipping calculated at checkout</p>
                <button>Proceed To Checkout</button>
                <div className="continue-shopping">
                  <Link to="/home">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="currentColor"
                      className="bi bi-arrow-left"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fillRule="evenodd"
                        d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
                      />
                    </svg>
                    <span>Continue Shopping</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <button className="clear-btn" onClick={() => handleClearCart()}>
            Clear Cart
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
