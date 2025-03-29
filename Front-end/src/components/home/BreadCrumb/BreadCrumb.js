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
  const handleButtonClick = (key, setter) => () => setter(key);

  return (
    <div className="breadcrumb-div">
      <Breadcrumbs maxItems={2} aria-label="breadcrumb">
        {breadcrumbItems.map(({ label, key }) => (
          <Button
            key={key}
            className="breadcrumb-link"
            underline="hover"
            sx={{ backgroundColor: navC[key] ? "#ACBF60" : "" }}
            onClick={handleButtonClick(key, setters[`set${label}`])}
          >
            {label}
          </Button>
        ))}
      </Breadcrumbs>
    </div>
  );
}

export default BreadcrumbsComponent;
