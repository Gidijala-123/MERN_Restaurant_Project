import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import useSound from '../../../hooks/useSound';

const CheckoutSuccess = () => {
  const { state } = useLocation();
  const paymentId = state?.paymentId;
  const snapshot = state?.snapshot;
  const [downloading, setDownloading] = useState(false);
  const { playSound } = useSound();

  useEffect(() => {
    playSound("success");
  }, [playSound]);

  const downloadPDF = async () => {
    if (!snapshot) return;
    setDownloading(true);
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

      // Header band
      doc.setFillColor(234, 88, 12);
      doc.rect(0, 0, pageW, 48, "F");
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.3);
      doc.circle(185, 8, 22, "S");
      doc.circle(185, 8, 14, "S");
      doc.circle(10, 48, 18, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(26);
      doc.setTextColor(255, 255, 255);
      doc.text("FLAVORA", 18, 22);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(255, 220, 180);
      doc.text("Fresh & Healthy Food Delivery", 18, 30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text("INVOICE", pageW - 18, 22, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(255, 220, 180);
      doc.text(`# ${orderNo}`, pageW - 18, 30, { align: "right" });

      doc.setFillColor(251, 146, 60);
      doc.rect(0, 48, pageW, 3, "F");

      // Info row
      const infoY = 62;
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

      doc.setFillColor(236, 253, 245);
      doc.roundedRect(111, infoY - 6, 85, 28, 3, 3, "F");
      doc.setDrawColor(167, 243, 208);
      doc.roundedRect(111, infoY - 6, 85, 28, 3, 3, "S");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(5, 150, 105);
      doc.text("PAYMENT STATUS", 116, infoY);
      doc.setFillColor(16, 185, 129);
      doc.circle(122, infoY + 10, 5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text("✓", 120, infoY + 12.5);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(5, 150, 105);
      doc.text("PAID", 130, infoY + 12);
      if (paymentId) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.5);
        doc.setTextColor(100, 100, 100);
        doc.text(`Txn: ${paymentId}`, 116, infoY + 19);
      } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(100, 100, 100);
        doc.text("Secured via Razorpay", 116, infoY + 19);
      }

      // Table
      const tableStartY = infoY + 36;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(180, 80, 10);
      doc.text("ORDER ITEMS", 14, tableStartY - 3);

      const tableData = snapshot.items.map((item, i) => [
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
        headStyles: { fillColor: [234, 88, 12], textColor: [255, 255, 255], fontSize: 9, fontStyle: "bold", halign: "center", cellPadding: { top: 5, bottom: 5, left: 4, right: 4 } },
        columnStyles: {
          0: { cellWidth: 10, halign: "center", valign: "middle", fontStyle: "bold", textColor: [150, 150, 150] },
          1: { cellWidth: 80, fontStyle: "bold", textColor: [30, 30, 30] },
          2: { halign: "center", textColor: [80, 80, 80] },
          3: { halign: "center", textColor: [80, 80, 80] },
          4: { halign: "right", fontStyle: "bold", textColor: [234, 88, 12] },
        },
        styles: { font: "helvetica", fontSize: 9, cellPadding: { top: 8, bottom: 8, left: 5, right: 5 }, lineColor: [240, 240, 240], lineWidth: 0.3, valign: "middle" },
        alternateRowStyles: { fillColor: [255, 251, 247] },
        didParseCell: (data) => {
          if (data.section === "body") {
            data.cell.styles.valign = "middle";
          }
          if (data.column.index === 0 && data.section === "body") {
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.halign = "center";
            data.cell.styles.valign = "middle";
            data.cell.styles.textColor = [180, 80, 10];
          }
        },
      });

      // Totals
      const tY = doc.lastAutoTable.finalY + 8;
      doc.setDrawColor(234, 88, 12);
      doc.setLineWidth(0.5);
      doc.line(110, tY, pageW - 14, tY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text("Sub-Total", 130, tY + 9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 40, 40);
      doc.text(`Rs. ${snapshot.total}`, pageW - 14, tY + 9, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text("GST (18%)", 130, tY + 18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 40, 40);
      doc.text(`+ Rs. ${snapshot.gst}`, pageW - 14, tY + 18, { align: "right" });
      doc.setFillColor(234, 88, 12);
      doc.roundedRect(110, tY + 23, pageW - 124, 14, 3, 3, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(255, 255, 255);
      doc.text("GRAND TOTAL", 116, tY + 32);
      doc.text(`Rs. ${snapshot.grandTotal}`, pageW - 20, tY + 32, { align: "right" });

      // Items badge
      doc.setFillColor(255, 247, 237);
      doc.roundedRect(14, tY + 8, 60, 18, 3, 3, "F");
      doc.setDrawColor(254, 215, 170);
      doc.roundedRect(14, tY + 8, 60, 18, 3, 3, "S");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(180, 80, 10);
      doc.text(`${snapshot.items.length} item${snapshot.items.length !== 1 ? "s" : ""}  ·  ${snapshot.items.reduce((s, i) => s + (i.cartQuantity || i.quantity || 1), 0)} qty`, 19, tY + 19);

      // Footer
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

      doc.save(`Flavora_Invoice_${paymentId || orderNo}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', padding: '20px' }}>
      <CheckCircleOutlineIcon sx={{ fontSize: 100, color: '#48c479', marginBottom: '20px' }} />
      <h1 style={{ fontWeight: 800, color: 'var(--text-main)' }}>Payment Successful!</h1>
      <p style={{ color: 'var(--text-sub)', maxWidth: '400px', margin: '10px 0 8px 0' }}>
        Your order has been placed. Download your invoice below or head back to the menu.
      </p>
      {paymentId && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginBottom: '24px', fontFamily: 'monospace', background: 'var(--bg-light)', padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
          Transaction ID: {paymentId}
        </p>
      )}
      <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/home" style={{ backgroundColor: '#ea580c', color: 'white', padding: '12px 25px', borderRadius: '12px', textDecoration: 'none', fontWeight: 700 }}>
          Back to Menu
        </Link>
        {snapshot && (
          <button onClick={downloadPDF} disabled={downloading} style={{ backgroundColor: 'transparent', color: '#ea580c', padding: '12px 25px', borderRadius: '12px', border: '2px solid #ea580c', fontWeight: 700, cursor: downloading ? 'not-allowed' : 'pointer', opacity: downloading ? 0.7 : 1 }}>
            {downloading ? 'Generating…' : '📄 Download Invoice'}
          </button>
        )}
      </div>
    </div>
  );
};

export default CheckoutSuccess;
