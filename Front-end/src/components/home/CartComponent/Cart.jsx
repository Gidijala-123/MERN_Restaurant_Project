import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  clearCart,
  decreaseCart,
  getTotals,
  removeFromCart,
} from "../../features/cartSlice";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./Cart.css";

const Cart = () => {
  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getTotals());
  }, [cart, dispatch]);

  const handleAddToCart = (product) => dispatch(addToCart(product));
  const handleDecreaseCart = (product) => dispatch(decreaseCart(product));
  const handleRemoveFromCart = (product) => dispatch(removeFromCart(product));
  const handleClearCart = () => dispatch(clearCart());

  const generatePDF = () => {
    const doc = new jsPDF();
    const orderNo = Math.random().toString(36).substr(2, 7).toUpperCase();
    const gst = Math.ceil(cart.cartTotalAmount * 0.18);
    const grandTotal = cart.cartTotalAmount + gst;

    // Background accent
    doc.setFillColor(248, 248, 248);
    doc.rect(0, 0, 210, 40, "F");

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(237, 31, 36); // Zomato Red
    doc.text("Tasty Kitchen", 20, 25);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text("Fresh & Healthy Food Delivery", 20, 32);

    // Order Info Box
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(232, 232, 232);
    doc.roundedRect(20, 45, 170, 25, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setTextColor(28, 28, 28);
    doc.text("INVOICE DETAILS", 25, 52);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(105, 105, 105);
    doc.text(`Order ID: #${orderNo}`, 25, 60);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 25, 65);
    doc.text(`Status: Paid`, 160, 60, { align: "right" });

    // Table
    const tableData = cart.cartItems.map((item) => [
      item.title,
      `Rs. ${item.price}`,
      item.cartQuantity,
      `Rs. ${item.price * item.cartQuantity}`,
    ]);

    autoTable(doc, {
      startY: 75,
      head: [["Item Name", "Cost", "Qty", "Total"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [237, 31, 36],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { halign: "center" },
        2: { halign: "center" },
        3: { halign: "right", fontStyle: "bold" },
      },
      styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: 5,
      },
      alternateRowStyles: { fillColor: [252, 252, 252] },
    });

    // Summary Section
    const finalY = doc.lastAutoTable.finalY + 15;

    doc.setDrawColor(232, 232, 232);
    doc.line(120, finalY - 5, 190, finalY - 5);

    doc.setFontSize(10);
    doc.setTextColor(105, 105, 105);
    doc.text("Sub-Total:", 140, finalY);
    doc.text(`Rs. ${cart.cartTotalAmount}`, 190, finalY, { align: "right" });

    doc.text("GST (18%):", 140, finalY + 8);
    doc.text(`Rs. ${gst}`, 190, finalY + 8, { align: "right" });

    doc.setFillColor(237, 31, 36);
    doc.rect(130, finalY + 13, 60, 10, "F");

    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Grand Total:", 135, finalY + 20);
    doc.text(`Rs. ${grandTotal}`, 185, finalY + 20, { align: "right" });

    // Footer
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(150);
    doc.text("This is a computer generated invoice.", 105, 275, {
      align: "center",
    });

    doc.setFont("helvetica", "bold");
    doc.setTextColor(237, 31, 36);
    doc.text("Thank you for ordering with Tasty Kitchen!", 105, 282, {
      align: "center",
    });

    doc.save(`TastyKitchen_Invoice_${orderNo}.pdf`);
  };

  const handleCheckout = () => {
    // Professional Mock Checkout Flow
    const btn = document.querySelector(".btn-checkout");
    btn.innerText = "Processing Payment...";
    btn.disabled = true;

    setTimeout(() => {
      dispatch(clearCart());
      navigate("/checkout-success");
    }, 2000);
  };

  return (
    <div className="cart-container">
      <h2>Your Food Basket</h2>
      {cart.cartItems.length === 0 ? (
        <div className="cart-empty">
          <p
            style={{ fontSize: "18px", color: "#696969", marginBottom: "20px" }}
          >
            Your basket is currently empty
          </p>
          <Link
            to="/home"
            style={{
              display: "inline-block",
              backgroundColor: "#ed1f24",
              color: "white",
              padding: "12px 30px",
              borderRadius: "12px",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Start Ordering
          </Link>
        </div>
      ) : (
        <div className="row">
          <div className="col-md-8">
            <div className="cart-items-heading d-none d-md-grid">
              <h4>Item</h4>
              <h4>Cost</h4>
              <h4>Quantity</h4>
              <h4>Total</h4>
            </div>

            {cart.cartItems.map((cartItem) => (
              <div className="cart-item" key={cartItem.id}>
                <div className="cart-product">
                  <img src={cartItem.img} alt={cartItem.title} />
                  <div className="item-texts">
                    <h3>{cartItem.title}</h3>
                    <p>{cartItem.decrp}</p>
                    <button
                      className="btn-remove"
                      onClick={() => handleRemoveFromCart(cartItem)}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="cart-product-price">Rs. {cartItem.price}</div>

                <div className="cart-product-quantity">
                  <button
                    className="quantity-btn"
                    onClick={() => handleDecreaseCart(cartItem)}
                  >
                    -
                  </button>
                  <span className="quantity-count">
                    {cartItem.cartQuantity}
                  </span>
                  <button
                    className="quantity-btn"
                    onClick={() => handleAddToCart(cartItem)}
                  >
                    +
                  </button>
                </div>

                <div className="cart-product-total-price">
                  Rs. {cartItem.price * cartItem.cartQuantity}
                </div>
              </div>
            ))}

            <button className="btn-clear" onClick={() => handleClearCart()}>
              Clear Entire Basket
            </button>
          </div>

          <div className="col-md-4">
            <div className="cart-summary">
              <h4 className="summary-title">Order Summary</h4>
              <div className="summary-row">
                <span>Sub-total</span>
                <span>Rs. {cart.cartTotalAmount}</span>
              </div>
              <div className="summary-row">
                <span>GST (18%)</span>
                <span>+ Rs. {Math.ceil(cart.cartTotalAmount * 0.18)}</span>
              </div>
              <div className="summary-row total">
                <span>Grand Total</span>
                <span>
                  Rs.{" "}
                  {cart.cartTotalAmount +
                    Math.ceil(cart.cartTotalAmount * 0.18)}
                </span>
              </div>

              <button className="btn-checkout" onClick={handleCheckout}>
                Proceed to Checkout
              </button>

              <button className="btn-bill" onClick={generatePDF}>
                Download Bill (PDF)
              </button>

              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <Link
                  to="/home"
                  style={{
                    color: "var(--text-sub)",
                    textDecoration: "none",
                    fontSize: "14px",
                  }}
                >
                  ← Back to Menu
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
