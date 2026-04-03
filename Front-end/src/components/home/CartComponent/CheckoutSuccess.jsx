import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const CheckoutSuccess = () => {
  const { state } = useLocation();
  const paymentId = state?.paymentId;
  const snapshot = state?.snapshot;
  const [downloading, setDownloading] = useState(false);

  const downloadPDF = async () => {
    if (!snapshot) return;
    setDownloading(true);
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
    if (paymentId) doc.text(`Txn: ${paymentId}`, 25, 70);
    doc.text(`Status: Paid`, 160, 60, { align: "right" });

    const tableData = snapshot.items.map((item) => [
      item.title,
      `Rs. ${item.price}`,
      item.cartQuantity,
      `Rs. ${item.price * item.cartQuantity}`,
    ]);
    autoTable(doc, {
      startY: paymentId ? 78 : 75,
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
    doc.text(`Rs. ${snapshot.total}`, 190, finalY, { align: "right" });
    doc.text("GST (18%):", 140, finalY + 8);
    doc.text(`Rs. ${snapshot.gst}`, 190, finalY + 8, { align: "right" });
    doc.setFillColor(237, 31, 36);
    doc.rect(130, finalY + 13, 60, 10, "F");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Grand Total:", 135, finalY + 20);
    doc.text(`Rs. ${snapshot.grandTotal}`, 185, finalY + 20, { align: "right" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(150);
    doc.text("This is a computer generated invoice.", 105, 275, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setTextColor(237, 31, 36);
    doc.text("Thank you for ordering with Flavora!", 105, 282, { align: "center" });
    doc.save(`Flavora_Invoice_${orderNo}.pdf`);
    setDownloading(false);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      textAlign: 'center',
      padding: '20px'
    }}>
      <CheckCircleOutlineIcon sx={{ fontSize: 100, color: '#48c479', marginBottom: '20px' }} />
      <h1 style={{ fontWeight: 800, color: 'var(--text-main)' }}>Payment Successful!</h1>
      <p style={{ color: 'var(--text-sub)', maxWidth: '400px', margin: '10px 0 8px 0' }}>
        Your order has been placed successfully. Download your invoice below or head back to the menu.
      </p>
      {paymentId && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginBottom: '24px', fontFamily: 'monospace', background: 'var(--bg-light)', padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
          Transaction ID: {paymentId}
        </p>
      )}
      <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/home" style={{
          backgroundColor: '#ea580c',
          color: 'white',
          padding: '12px 25px',
          borderRadius: '12px',
          textDecoration: 'none',
          fontWeight: 700
        }}>
          Back to Menu
        </Link>
        {snapshot && (
          <button
            onClick={downloadPDF}
            disabled={downloading}
            style={{
              backgroundColor: 'transparent',
              color: '#ea580c',
              padding: '12px 25px',
              borderRadius: '12px',
              border: '2px solid #ea580c',
              fontWeight: 700,
              cursor: downloading ? 'not-allowed' : 'pointer',
              opacity: downloading ? 0.7 : 1,
            }}
          >
            {downloading ? 'Generating…' : '📄 Download Invoice'}
          </button>
        )}
      </div>
    </div>
  );
};

export default CheckoutSuccess;
