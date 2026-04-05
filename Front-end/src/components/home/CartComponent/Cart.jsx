import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  clearCart,
  decreaseCart,
  getTotals,
  removeFromCart,
} from "../../features/cartSlice";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Cart.css";

// Dynamically load Razorpay checkout script
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

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

  const [pdfLoading, setPdfLoading] = useState(false);

  const gst = Math.ceil(cart.cartTotalAmount * 0.18);
  const grandTotal = cart.cartTotalAmount + gst;
  const totalItems = cart.cartItems.reduce((s, i) => s + i.cartQuantity, 0);

  // Accepts optional snapshot so it can be called after cart is cleared
  const generatePDF = async (itemsSnapshot, totalSnapshot, gstSnapshot, grandSnapshot) => {
    const items = Array.isArray(itemsSnapshot) ? itemsSnapshot : cart.cartItems;
    const total = typeof totalSnapshot === "number" ? totalSnapshot : cart.cartTotalAmount;
    const gstVal = typeof gstSnapshot === "number" ? gstSnapshot : gst;
    const grand = typeof grandSnapshot === "number" ? grandSnapshot : grandTotal;

    setPdfLoading(true);
    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);
      const doc = new jsPDF();
      const pageW = doc.internal.pageSize.getWidth();
      const orderNo = Math.random().toString(36).substr(2, 7).toUpperCase();
      const dateStr = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
      const timeStr = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

      // ── Header band ──
      doc.setFillColor(234, 88, 12);
      doc.rect(0, 0, pageW, 48, "F");

      // Decorative circles in header
      doc.setFillColor(255, 255, 255, 0.08);
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.3);
      doc.circle(185, 8, 22, "S");
      doc.circle(185, 8, 14, "S");
      doc.circle(10, 48, 18, "S");

      // Brand name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(26);
      doc.setTextColor(255, 255, 255);
      doc.text("FLAVORA", 18, 22);

      // Tagline
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(255, 220, 180);
      doc.text("Fresh & Healthy Food Delivery", 18, 30);

      // "INVOICE" label on right
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text("INVOICE", pageW - 18, 22, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(255, 220, 180);
      doc.text(`# ${orderNo}`, pageW - 18, 30, { align: "right" });

      // ── Orange accent line below header ──
      doc.setFillColor(251, 146, 60);
      doc.rect(0, 48, pageW, 3, "F");

      // ── Info row ──
      const infoY = 62;
      // Left box — Order info
      doc.setFillColor(255, 247, 237);
      doc.roundedRect(14, infoY - 6, 85, 28, 3, 3, "F");
      doc.setDrawColor(254, 215, 170);
      doc.setLineWidth(0.4);
      doc.roundedRect(14, infoY - 6, 85, 28, 3, 3, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(180, 80, 10);
      doc.text("ORDER DETAILS", 19, infoY);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(60, 60, 60);
      doc.text(`Order ID:`, 19, infoY + 7);
      doc.setFont("helvetica", "bold");
      doc.text(`#${orderNo}`, 42, infoY + 7);

      doc.setFont("helvetica", "normal");
      doc.text(`Date:`, 19, infoY + 14);
      doc.setFont("helvetica", "bold");
      doc.text(`${dateStr}  ${timeStr}`, 34, infoY + 14);

      // Right box — Status (ESTIMATE — payment not yet made)
      doc.setFillColor(255, 247, 237);
      doc.roundedRect(111, infoY - 6, 85, 28, 3, 3, "F");
      doc.setDrawColor(254, 215, 170);
      doc.roundedRect(111, infoY - 6, 85, 28, 3, 3, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(180, 80, 10);
      doc.text("PAYMENT STATUS", 116, infoY);

      // Orange clock circle
      doc.setFillColor(234, 88, 12);
      doc.circle(122, infoY + 10, 5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text("!", 121, infoY + 12.5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(234, 88, 12);
      doc.text("ESTIMATE", 130, infoY + 12);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 100, 100);
      doc.text("Payment pending at checkout", 116, infoY + 19);

      // ── Section label ──
      const tableStartY = infoY + 36;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(180, 80, 10);
      doc.text("ORDER ITEMS", 14, tableStartY - 3);

      // ── Items table ──
      const tableData = items.map((item, i) => [
        `${i + 1}`,
        item.title || item.name || "—",
        `Rs. ${item.price}`,
        `${item.cartQuantity || item.quantity || 1}`,
        `Rs. ${item.price * (item.cartQuantity || item.quantity || 1)}`,
      ]);

      autoTable(doc, {
        startY: tableStartY,
        head: [["#", "Item Name", "Unit Price", "Qty", "Total"]],
        body: tableData,
        theme: "plain",
        headStyles: {
          fillColor: [234, 88, 12],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: "bold",
          halign: "center",
          cellPadding: { top: 5, bottom: 5, left: 4, right: 4 },
        },
        columnStyles: {
          0: { cellWidth: 10, halign: "center", valign: "middle", fontStyle: "bold", textColor: [150, 150, 150] },
          1: { cellWidth: 80, fontStyle: "bold", textColor: [30, 30, 30] },
          2: { halign: "center", textColor: [80, 80, 80] },
          3: { halign: "center", textColor: [80, 80, 80] },
          4: { halign: "right", fontStyle: "bold", textColor: [234, 88, 12] },
        },
        styles: { font: "helvetica", fontSize: 9, cellPadding: { top: 8, bottom: 8, left: 5, right: 5 }, lineColor: [240, 240, 240], lineWidth: 0.3, valign: "middle" },
        alternateRowStyles: { fillColor: [255, 251, 247] },
        rowPageBreak: "avoid",
        didParseCell: (data) => {
          if (data.column.index === 0 && data.section === "body") {
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.halign = "center";
            data.cell.styles.valign = "middle";
            data.cell.styles.textColor = [180, 80, 10];
          }
          if (data.section === "body") {
            data.cell.styles.valign = "middle";
          }
        },
      });

      // ── Totals section ──
      const tY = doc.lastAutoTable.finalY + 8;

      // Thin separator
      doc.setDrawColor(234, 88, 12);
      doc.setLineWidth(0.5);
      doc.line(110, tY, pageW - 14, tY);

      // Sub-total row
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text("Sub-Total", 130, tY + 9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 40, 40);
      doc.text(`Rs. ${total}`, pageW - 14, tY + 9, { align: "right" });

      // GST row
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text("GST (18%)", 130, tY + 18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 40, 40);
      doc.text(`+ Rs. ${gstVal}`, pageW - 14, tY + 18, { align: "right" });

      // Grand total band
      doc.setFillColor(234, 88, 12);
      doc.roundedRect(110, tY + 23, pageW - 124, 14, 3, 3, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(255, 255, 255);
      doc.text("GRAND TOTAL", 116, tY + 32);
      doc.text(`Rs. ${grand}`, pageW - 20, tY + 32, { align: "right" });

      // ── Items count badge ──
      doc.setFillColor(255, 247, 237);
      doc.roundedRect(14, tY + 8, 60, 18, 3, 3, "F");
      doc.setDrawColor(254, 215, 170);
      doc.roundedRect(14, tY + 8, 60, 18, 3, 3, "S");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(180, 80, 10);
      doc.text(`${items.length} item${items.length !== 1 ? "s" : ""}  ·  ${items.reduce((s, i) => s + i.cartQuantity, 0)} qty`, 19, tY + 19);

      // ── Footer ──
      const footerY = 272;
      doc.setFillColor(245, 245, 245);
      doc.rect(0, footerY, pageW, 25, "F");
      doc.setFillColor(234, 88, 12);
      doc.rect(0, footerY, pageW, 1.5, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(234, 88, 12);
      doc.text("Thank you for ordering with Flavora!", pageW / 2, footerY + 9, { align: "center" });

      doc.setFont("helvetica", "italic");
      doc.setFontSize(7.5);
      doc.setTextColor(150, 150, 150);
      doc.text("This is a computer-generated invoice. No signature required.", pageW / 2, footerY + 17, { align: "center" });

      doc.save(`Flavora_Estimate_${orderNo}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleCheckout = async () => {
    const btn = document.querySelector(".btn-checkout");
    btn.innerText = "Loading…";
    btn.disabled = true;

    const loaded = await loadRazorpay();
    if (!loaded) {
      toast.error("Failed to load payment gateway. Check your connection.");
      btn.innerText = "🚀 Proceed to Checkout";
      btn.disabled = false;
      return;
    }

    // Amount in paise (Razorpay requires smallest currency unit)
    const amountInPaise = grandTotal * 100;

    const options = {
      // Replace with your actual Razorpay Key ID from https://dashboard.razorpay.com
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_YourKeyHere",
      amount: amountInPaise,
      currency: "INR",
      name: "Flavora",
      description: cart.cartItems.map(i => i.title).join(", "),
      // image only works with a publicly accessible URL (not localhost)
      ...(window.location.hostname !== "localhost" && {
        image: `${window.location.origin}/footer-images/logo.png`,
      }),
      handler: function (response) {
        // Snapshot cart data before clearing so success page can generate PDF
        const snapshot = {
          items: [...cart.cartItems],
          total: cart.cartTotalAmount,
          gst,
          grandTotal,
        };

        // Persist order to localStorage for order history
        const existingOrders = JSON.parse(localStorage.getItem("userOrders") || "[]");
        const newOrder = {
          id: response.razorpay_payment_id,
          date: new Date().toISOString(),
          items: [...cart.cartItems],
          subtotal: cart.cartTotalAmount,
          gst,
          grandTotal,
        };
        localStorage.setItem("userOrders", JSON.stringify([newOrder, ...existingOrders]));

        // Persist order to backend DB for analytics
        const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:1111").replace(/\/$/, "");
        fetch(`${API_URL}/api/csrf`, { credentials: "include" })
          .then((r) => r.json())
          .then((csrf) => fetch(`${API_URL}/api/order`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json", "x-csrf-token": csrf?.csrfToken || "" },
            body: JSON.stringify({
              items: cart.cartItems,
              paymentId: response.razorpay_payment_id,
              subtotal: cart.cartTotalAmount,
              gst,
              grandTotal,
            }),
          }))
          .catch(() => { });

        dispatch(clearCart());
        navigate("/checkout-success", {
          state: { paymentId: response.razorpay_payment_id, snapshot },
        });
      },
      prefill: {
        name: "",
        email: "",
        contact: "",
      },
      theme: {
        color: "#ea580c",
      },
      modal: {
        ondismiss: () => {
          btn.innerText = "🚀 Proceed to Checkout";
          btn.disabled = false;
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (response) => {
      toast.error(`Payment failed: ${response.error.description}`);
      btn.innerText = "🚀 Proceed to Checkout";
      btn.disabled = false;
    });
    rzp.open();
    btn.innerText = "🚀 Proceed to Checkout";
    btn.disabled = false;
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
                <button className="btn-bill" onClick={generatePDF} disabled={pdfLoading}>
                  <span>📄</span> {pdfLoading ? "Generating PDF…" : "Download Estimate (PDF)"}
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
