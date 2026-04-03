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

  const gst = Math.ceil(cart.cartTotalAmount * 0.18);
  const grandTotal = cart.cartTotalAmount + gst;
  const totalItems = cart.cartItems.reduce((s, i) => s + i.cartQuantity, 0);

  const generatePDF = async () => {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);
    const doc = new jsPDF();
    const orderNo = Math.random().toString(36).substr(2, 7).toUpperCase();

    doc.setFillColor(248, 248, 248);
    doc.rect(0, 0, 210, 40, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(237, 31, 36);
    doc.text("Flavora", 20, 25);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text("Fresh & Healthy Food Delivery", 20, 32);
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
      headStyles: { fillColor: [237, 31, 36], textColor: [255, 255, 255], fontSize: 10, fontStyle: "bold", halign: "center" },
      columnStyles: { 0: { cellWidth: 80 }, 1: { halign: "center" }, 2: { halign: "center" }, 3: { halign: "right", fontStyle: "bold" } },
      styles: { font: "helvetica", fontSize: 9, cellPadding: 5 },
      alternateRowStyles: { fillColor: [252, 252, 252] },
    });

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
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(150);
    doc.text("This is a computer generated invoice.", 105, 275, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setTextColor(237, 31, 36);
    doc.text("Thank you for ordering with Flavora!", 105, 282, { align: "center" });
    doc.save(`Flavora_Invoice_${orderNo}.pdf`);
  };

  const handleCheckout = () => {
    const btn = document.querySelector(".btn-checkout");
    btn.innerText = "Processing…";
    btn.disabled = true;
    setTimeout(() => {
      dispatch(clearCart());
      navigate("/checkout-success");
    }, 2000);
  };

  return (
    <div className="cart-container">
      {/* Page header */}
      <div className="cart-page-header">
        <h2>
          🛒 Your Food Basket
          {cart.cartItems.length > 0 && (
            <span className="cart-count-badge">{totalItems}</span>
          )}
        </h2>
        <Link to="/home" className="cart-back-link">← Back to Menu</Link>
      </div>

      {cart.cartItems.length === 0 ? (
        <div className="cart-empty">
          <div className="cart-empty__animation">
            <div style={{ width: 160, height: 160 }}>
              <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="plateGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FF8C00" />
                    <stop offset="100%" stopColor="#FFB74D" />
                  </linearGradient>
                </defs>
                <circle className="plate" cx="60" cy="70" r="38" fill="url(#plateGrad)" />
                <ellipse cx="60" cy="78" rx="40" ry="8" fill="rgba(0,0,0,0.12)" />
                <circle cx="60" cy="60" r="18" fill="#FFEB3B" />
                <path d="M44 38c4-6 10-6 10 0s-6 10-10 12s-10 0-10-6s6-10 10-6" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M70 34c4-6 10-6 10 0s-6 10-10 12s-10 0-10-6s6-10 10-6" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <p style={{ fontSize: "18px", color: "#696969", marginBottom: "20px" }}>
            Your basket is currently empty
          </p>
          <Link to="/home" style={{ display: "inline-block", backgroundColor: "#ea580c", color: "white", padding: "12px 30px", borderRadius: "12px", textDecoration: "none", fontWeight: 700 }}>
            Start Ordering
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          {/* ── Left: items panel ── */}
          <div className="cart-items-panel">
            {/* Sticky column headings */}
            <div className="cart-items-heading d-none d-md-grid">
              <h4>Item</h4>
              <h4>Cost</h4>
              <h4>Quantity</h4>
              <h4>Total</h4>
            </div>

            {/* Scrollable items list */}
            <div className="cart-items-list">
              {cart.cartItems.map((cartItem, idx) => (
                <div className="cart-item" key={cartItem.id} style={{ animationDelay: `${idx * 0.05}s` }}>
                  {/* Product */}
                  <div className="cart-product">
                    <div className="cart-product-img-wrap">
                      <img
                        src={cartItem.img}
                        alt={cartItem.title}
                        onError={(e) => { e.target.onerror = null; e.target.src = "/footer-images/food.png"; }}
                      />
                    </div>
                    <div className="item-texts">
                      <h3>{cartItem.title}</h3>
                      <p className="item-cal">{cartItem.decrp || "Fresh & delicious"}</p>
                      <button className="btn-remove" onClick={() => handleRemoveFromCart(cartItem)}>
                        ✕ Remove
                      </button>
                    </div>
                  </div>

                  {/* Cost */}
                  <div className="cart-product-price">Rs. {cartItem.price}</div>

                  {/* Quantity stepper */}
                  <div className="cart-product-quantity">
                    <button className="quantity-btn" onClick={() => handleDecreaseCart(cartItem)}>−</button>
                    <span className="quantity-count">{cartItem.cartQuantity}</span>
                    <button className="quantity-btn" onClick={() => handleAddToCart(cartItem)}>+</button>
                  </div>

                  {/* Line total */}
                  <div className="cart-product-total-price">
                    Rs. {cartItem.price * cartItem.cartQuantity}
                  </div>
                </div>
              ))}
            </div>

            {/* Panel footer */}
            <div className="cart-panel-footer">
              <span className="cart-item-count-label">
                {cart.cartItems.length} item{cart.cartItems.length !== 1 ? "s" : ""} · {totalItems} qty
              </span>
              <button className="btn-clear" onClick={handleClearCart}>
                🗑 Clear Basket
              </button>
            </div>
          </div>

          {/* ── Right: order summary ── */}
          <div className="cart-summary-sticky">
            <div className="cart-summary">
              {/* Gradient header */}
              <div className="summary-header">
                <div className="summary-header-icon">🧾</div>
                <h4 className="summary-title">Order Summary</h4>
              </div>

              {/* Rows */}
              <div className="summary-body">
                <div className="summary-row">
                  <span className="label"><span className="label-icon">🛍</span> Sub-total</span>
                  <span>Rs. {cart.cartTotalAmount}</span>
                </div>
                <div className="summary-row">
                  <span className="label"><span className="label-icon">🏛</span> GST (18%)</span>
                  <span>+ Rs. {gst}</span>
                </div>

                <div className="summary-divider" />

                <div className="summary-row total">
                  <div>
                    <div>Grand Total</div>
                    <div className="total-label">Incl. all taxes</div>
                  </div>
                  <span>Rs. {grandTotal}</span>
                </div>

                {/* Savings nudge */}
                <div className="savings-badge">
                  <span>🎉</span>
                  <span>You're saving Rs. {Math.floor(cart.cartTotalAmount * 0.05)} with Flavora pricing!</span>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="summary-actions">
                <button className="btn-checkout" onClick={handleCheckout}>
                  <span>🚀</span> Proceed to Checkout
                </button>
                <button className="btn-bill" onClick={generatePDF}>
                  <span>📄</span> Download Bill (PDF)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
