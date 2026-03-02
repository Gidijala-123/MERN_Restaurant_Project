import React from 'react';
import { Link } from 'react-router-dom';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const CheckoutSuccess = () => {
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
      <h1 style={{ fontWeight: 800, color: '#1c1c1c' }}>Payment Successful!</h1>
      <p style={{ color: '#696969', maxWidth: '400px', margin: '10px 0 30px 0' }}>
        Your order has been placed successfully. You can track your order in the dashboard or download your receipt.
      </p>
      <div style={{ display: 'flex', gap: '15px' }}>
        <Link to="/home" style={{
          backgroundColor: '#ed1f24',
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
