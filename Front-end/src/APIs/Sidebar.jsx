import React from "react";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import * as IoIcons from "react-icons/io";
import * as GiIcons from "react-icons/gi";
import * as MdIcons from "react-icons/md";

export const SidebarData = [
  {
    title: "Hot Offers",
    path: "/",
    icon: <AiIcons.AiFillFire />,
    cName: "nav-text",
  },
  {
    title: "Veg Starters",
    path: "/veg-starters",
    icon: <GiIcons.GiLeafSwirl />,
    cName: "nav-text",
  },
  {
    title: "Non-Veg Starters",
    path: "/non-veg-starters",
    icon: <GiIcons.GiChicken />,
    cName: "nav-text",
  },
  {
    title: "Tandooris",
    path: "/tandooris",
    icon: <GiIcons.GiKebabSpit />,
    cName: "nav-text",
  },
  {
    title: "Soups",
    path: "/soups",
    icon: <FaIcons.FaUtensilSpoon />,
    cName: "nav-text",
  },
  {
    title: "Salads",
    path: "/salads",
    icon: <FaIcons.FaLeaf />,
    cName: "nav-text",
  },
  {
    title: "Sandwiches",
    path: "/sandwiches",
    icon: <FaIcons.FaHamburger />,
    cName: "nav-text",
  },
  {
    title: "Signature Dishes",
    path: "/signature-dishes",
    icon: <MdIcons.MdRestaurant />,
    cName: "nav-text",
  },
  {
    title: "Biryanis",
    path: "/biryanis",
    icon: <GiIcons.GiBowlOfRice />,
    cName: "nav-text",
  },
  {
    title: "Main Course",
    path: "/main-course",
    icon: <GiIcons.GiChicken />,
    cName: "nav-text",
    subcategories: [
      "Paneer Specialities",
      "Chicken/Mutton Curries",
      "Dal/Lentils",
    ],
  },
  {
    title: "Rice & Breads",
    path: "/rice-breads",
    icon: <FaIcons.FaBreadSlice />,
    cName: "nav-text",
    subcategories: ["Naan", "Roti", "Paratha", "Flavored Rice"],
  },
  {
    title: "South Indian",
    path: "/south-indian",
    icon: <GiIcons.GiIndiaGate />,
    cName: "nav-text",
    subcategories: ["Dosa", "Idli", "Vada"],
  },
  {
    title: "Chinese",
    path: "/indo-chinese",
    icon: <GiIcons.GiNoodles />,
    cName: "nav-text",
    subcategories: ["Noodles", "Manchurian", "Fried Rice"],
  },
  {
    title: "Beverages",
    path: "/beverages",
    icon: <IoIcons.IoMdBeer />,
    cName: "nav-text",
    subcategories: ["Lassi", "Soft Drinks", "Shakes"],
  },
  {
    title: "Cocktails/Mocktails",
    path: "/cocktails",
    icon: <FaIcons.FaGlassMartini />,
    cName: "nav-text",
  },
  {
    title: "Desserts",
    path: "/desserts",
    icon: <FaIcons.FaIceCream />,
    cName: "nav-text",
    subcategories: ["Gulab Jamun", "Ice Creams", "Traditional Sweets"],
  },
];

export const Sidebar_Content = [
  "Hot Offers",
  "Veg Starters",
  "Non-Veg Starters",
  "Tandooris",
  "Soups",
  "Salads",
  "Sandwiches",
  "Signature Dishes",
  "Biryanis",
  "Main Course",
  "Rice & Breads",
  "South Indian",
  "Chinese",
  "Beverages",
  "Cocktails/Mocktails",
  "Desserts",
];

export const BreadCrumbText = [
  "HOME",
  "VEG STARTERS",
  "NON-VEG STARTERS",
  "TANDOORIS",
  "SOUPS",
  "SALADS",
  "SANDWICHES",
  "SIGNATURE DISHES",
  "BIRYANIS",
  "MAIN COURSE",
  "RICE & BREADS",
  "SOUTH INDIAN",
  "Chinese",
  "BEVERAGES",
  "COCKTAILS/MOCKTAILS",
  "DESSERTS",
];
