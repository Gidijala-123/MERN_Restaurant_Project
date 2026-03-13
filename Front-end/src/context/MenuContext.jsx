import React, { createContext, useState, useCallback } from "react";
import MENU_DATA, {
  getItemsByCategory,
  getSubCategoriesByCategory,
} from "../data/menuData";

export const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
  const [selectedCategory, setSelectedCategory] = useState("Hot Offers");
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [filteredItems, setFilteredItems] = useState(MENU_DATA);

  /**
   * Handle category change
   */
  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
    setSelectedSubCategory(null);

    if (category === "Hot Offers") {
      setFilteredItems(MENU_DATA);
    } else {
      const items = getItemsByCategory(category);
      setFilteredItems(items);
    }
  }, []);

  /**
   * Handle subcategory filter
   */
  const handleSubCategoryChange = useCallback(
    (subCategory) => {
      setSelectedSubCategory(subCategory);

      if (subCategory === null) {
        const items = getItemsByCategory(selectedCategory);
        setFilteredItems(items);
      } else {
        const items = MENU_DATA.filter(
          (item) =>
            item.category === selectedCategory &&
            item.subCategory === subCategory,
        );
        setFilteredItems(items);
      }
    },
    [selectedCategory],
  );

  /**
   * Get subcategories for the selected category
   */
  const getSubCategories = useCallback(() => {
    if (selectedCategory === "Hot Offers") {
      return [];
    }
    return getSubCategoriesByCategory(selectedCategory);
  }, [selectedCategory]);

  const value = {
    selectedCategory,
    selectedSubCategory,
    filteredItems,
    handleCategoryChange,
    handleSubCategoryChange,
    getSubCategories,
  };

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};

export const useMenu = () => {
  const context = React.useContext(MenuContext);
  if (!context) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return context;
};
