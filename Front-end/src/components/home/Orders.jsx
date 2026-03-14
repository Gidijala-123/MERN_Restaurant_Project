import React, { useEffect, useState } from "react";
import { Box, Typography, List, ListItem, ListItemText, Divider, Button } from "@mui/material";
import { Link } from "react-router-dom";

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("userOrders") || "[]");
    setOrders(Array.isArray(stored) ? stored : []);
  }, []);

  return (
    <Box sx={{ p: 3, minHeight: "calc(100vh - 72px)" }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        My Orders
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Your order history will show here once you place an order.
      </Typography>

      {orders.length === 0 ? (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            No orders yet.
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Track and manage your past orders quickly.
          </Typography>
          <Button component={Link} to="/home" variant="contained">
            Browse Menu
          </Button>
        </Box>
      ) : (
        <List sx={{ mt: 2, bgcolor: "background.paper", borderRadius: 2 }}>
          {orders.map((order, idx) => (
            <React.Fragment key={idx}>
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={order.title || `Order #${order.id || idx + 1}`}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {order.date || "Unknown date"}
                      </Typography>
                      {order.details ? ` — ${order.details}` : ""}
                    </>
                  }
                />
              </ListItem>
              {idx < orders.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
}
