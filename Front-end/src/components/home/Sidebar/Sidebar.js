// Material Components
import {
  styled,
  useTheme,
  Box,
  Drawer as MuiDrawer,
  AppBar as MuiAppBar,
  Toolbar,
  List,
  CssBaseline,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  Typography,
} from "@mui/material";

// Material Icons
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Mail as MailIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";

import "./Sidebar.css";
import React, { useState } from "react";
import { Sidebar_Content } from "../../../APIs/Sidebar";
import Bodycontent from "../Bodycontent/Bodycontent";
import LocalMallIcon from "@mui/icons-material/LocalMall";

// carttttt
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import SearchBar from "../Bodycontent/SEARCH_COMPONENT/SearchBar";

const drawerWidth = 240;

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export default function Sidebar() {
  const theme = useTheme();
  const [open, setOpen] = useState(true);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  // cartttttt
  const cartTotalQuantity = useSelector((state) => state);
  console.log(cartTotalQuantity, "data");
  const quantity = cartTotalQuantity.cart.cartItems.reduce(
    (total, cartItem) => {
      return total + cartItem.cartQuantity;
    },
    0
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: "none" }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <div className="nav-logo">
            <img
              src="/footer-images/logo.png"
              alt="kitchen-logo"
              className="fa fa-spin kitchen-logo "
            />
            <div className="navlogo-text">
              <Typography variant="h6" className="website-title">
                Tasty Kitchen
              </Typography>
              <Typography variant="body2">Fresh & Healthy Food</Typography>
            </div>
          </div>
          <Box sx={{ flexGrow: 1 }} />
          <SearchBar />
          <Box className="mx-3" sx={{ display: { xs: "none", md: "flex" } }}>
            <IconButton
              key="cart"
              size="large"
              color="inherit"
              component={Link}
              to="/cart"
              sx={{ padding: "16px 20px 8px 5px" }}
            >
              <Badge
                badgeContent={10}
                color="error"
                sx={{ width: "20px", height: "20px" }}
              >
                <MailIcon />
              </Badge>
            </IconButton>
            <IconButton
              key="cart"
              size="large"
              color="inherit"
              component={Link}
              to="/cart"
              sx={{ padding: "16px 20px 8px 5px" }}
            >
              <Badge
                badgeContent={11}
                color="error"
                sx={{ width: "20px", height: "20px" }}
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton
              key="cart"
              size="large"
              color="inherit"
              component={Link}
              to="/cart"
              sx={{ padding: "16px 20px 8px 5px" }}
            >
              <Badge
                badgeContent={quantity}
                color="error"
                sx={{ width: "20px", height: "20px" }}
              >
                <LocalMallIcon />
              </Badge>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {Sidebar_Content.map((text, index) => (
            <ListItem
              divider={index < Sidebar_Content.length - 1}
              key={text}
              disablePadding
              sx={{ display: "block" }}
            >
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  {index >= 0 && index <= 10 && (
                    <img
                      src={`/sidebar_icons/icon${index}.png`}
                      alt="Flaticon Icon"
                      width="25"
                      height="25"
                      className="sidebar-icon"
                    />
                  )}
                </ListItemIcon>

                <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 1 }}>
        <DrawerHeader />
        <Bodycontent open={open} sx={{ padding: "0px" }} />
      </Box>
    </Box>
  );
}
