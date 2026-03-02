import React from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import { Button } from "@mui/material";
import "./BreadCrumb.css";

const breadcrumbItems = [
  { label: "HOME", key: "Home" },
  { label: "FRESH FOOD", key: "FreshFood" },
  { label: "BAKERY", key: "Bakery" },
  { label: "DRINKS", key: "Drinks" },
  { label: "SHOP", key: "Shop" },
  { label: "PAGES", key: "Pages" },
  { label: "BLOG", key: "Blog" },
  { label: "CONTACT", key: "Contact" },
];

function BreadcrumbsComponent({ navC, ...setters }) {
  const handleButtonClick = (key, label) => () => {
    // Standardize the key name from the label or use the explicit key
    const setterName = `set${label.replace(/\s+/g, "")}`;
    if (setters[setterName]) {
      setters[setterName]();
    }
  };

  return (
    <div className="breadcrumb-div">
      <Breadcrumbs maxItems={8} aria-label="breadcrumb">
        {breadcrumbItems.map(({ label, key }) => (
          <Button
            key={key}
            className="breadcrumb-link"
            underline="hover"
            sx={{ 
              backgroundColor: navC[key] ? "#ACBF60" : "transparent",
              color: navC[key] ? "white" : "inherit",
              "&:hover": {
                backgroundColor: navC[key] ? "#8E9F4F" : "rgba(172, 191, 96, 0.1)"
              }
            }}
            onClick={handleButtonClick(key, label)}
          >
            {label}
          </Button>
        ))}
      </Breadcrumbs>
    </div>
  );
}

export default BreadcrumbsComponent;
