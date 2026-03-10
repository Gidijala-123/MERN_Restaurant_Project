import React from "react";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import * as IoIcons from "react-icons/io";

export const SidebarData = [
  {
    title: "Hot Offers",
    path: "/",
    icon: <AiIcons.AiFillFire />,
    cName: "nav-text",
  },
  {
    title: "New Arrivals",
    path: "/reports",
    icon: <FaIcons.FaStar />,
    cName: "nav-text",
  },
  {
    title: "Deals Of The Day",
    path: "/products",
    icon: <FaIcons.FaTags />,
    cName: "nav-text",
  },
  {
    title: "Fruits",
    path: "/team",
    icon: <FaIcons.FaAppleAlt />,
    cName: "nav-text",
  },
  {
    title: "Vegetables",
    path: "/messages",
    icon: <FaIcons.FaCarrot />,
    cName: "nav-text",
  },
  {
    title: "Drinks",
    path: "/support",
    icon: <IoIcons.IoMdBeer />,
    cName: "nav-text",
  },
  {
    title: "Bakery",
    path: "/support",
    icon: <FaIcons.FaBreadSlice />,
    cName: "nav-text",
  },
  {
    title: "Butter & Eggs",
    path: "/support",
    icon: <FaIcons.FaEgg />,
    cName: "nav-text",
  },
  {
    title: "Fish",
    path: "/support",
    icon: <FaIcons.FaFish />,
    cName: "nav-text",
  },
  {
    title: "Milk & Meat",
    path: "/support",
    icon: <FaIcons.FaDrumstickBite />,
    cName: "nav-text",
  },
];

export const Sidebar_Content = [
  "Hot Offers",
  "New Arrivals",
  "Deals Of The Day",
  "Fruits",
  "Vegetables",
  "Drinks",
  "Bakery",
  "Butter & Eggs",
  "Milk & Creams",
  "Meats",
  "Fish",
];

export const BreadCrumbText = [
  "HOME",
  "FRESHFOOD",
  "BAKERY",
  "DRINKS",
  "SHOP",
  "PAGES",
  "BLOG",
  "CONTACT",
];
