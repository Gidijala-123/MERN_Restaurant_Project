import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const CheckoutSuccess = () => {
  const { state } = useLocation();
  const paymentId = state?.paymentId;

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
        Your order has been placed successfully. You can track your order in the dashboard or download your receipt.
      </p>
      {paymentId && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginBottom: '24px', fontFamily: 'monospace', background: 'var(--bg-light)', padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
          Transaction ID: {paymentId}
        </p>
      )}
      <div style={{ display: 'flex', gap: '15px', marginTop: paymentId ? 0 : '22px' }}>
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
      </div>
    </div>
  );
};

export default CheckoutSuccess;
