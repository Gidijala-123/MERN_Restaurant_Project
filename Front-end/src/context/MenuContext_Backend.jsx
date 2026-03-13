import React, { createContext, useState, useCallback, useEffect } from "react";

export const MenuContext = createContext();

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:1234/api/menu";

/**
 * Menu Provider Component
 * Manages menu data fetching from backend API
 */
export const MenuProvider = ({ children }) => {
  const [selectedCategory, setSelectedCategory] = useState("Hot Offers");
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  /**
   * Fetch all categories from backend
   */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const data = await response.json();
        if (data.status === "success") {
          setCategories(data.data.categories);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  /**
   * Handle category change - fetch items for that category
   */
  const handleCategoryChange = useCallback(async (category) => {
    setSelectedCategory(category);
    setSelectedSubCategory(null);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/${category}`);
      const data = await response.json();

      if (data.status === "success") {
        setFilteredItems(data.data.items);
        setSubCategories([]); // Reset subcategories
      } else {
        setFilteredItems([]);
        setError(data.message || "Failed to fetch items");
      }
    } catch (err) {
      console.error("Error fetching items by category:", err);
      setError("Error fetching menu items");
      setFilteredItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch subcategories for selected category
   */
  useEffect(() => {
    if (selectedCategory && selectedCategory !== "Hot Offers") {
      const fetchSubCategories = async () => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/${selectedCategory}/subcategories`,
          );
          const data = await response.json();

          if (data.status === "success") {
            setSubCategories(data.data.subCategories);
          }
        } catch (err) {
          console.error("Error fetching subcategories:", err);
          setSubCategories([]);
        }
      };
      fetchSubCategories();
    }
  }, [selectedCategory]);

  /**
   * Handle subcategory filter
   */
  const handleSubCategoryChange = useCallback(
    async (subCategory) => {
      setSelectedSubCategory(subCategory);
      setLoading(true);
      setError(null);

      try {
        if (subCategory === null) {
          // Get all items for category
          const response = await fetch(`${API_BASE_URL}/${selectedCategory}`);
          const data = await response.json();

          if (data.status === "success") {
            setFilteredItems(data.data.items);
          }
        } else {
          // Get items for category and subcategory
          const response = await fetch(
            `${API_BASE_URL}/${selectedCategory}/${subCategory}`,
          );
          const data = await response.json();

          if (data.status === "success") {
            setFilteredItems(data.data.items);
          } else {
            setError(data.message || "Failed to fetch filtered items");
          }
        }
      } catch (err) {
        console.error("Error filtering by subcategory:", err);
        setError("Error fetching menu items");
      } finally {
        setLoading(false);
      }
    },
    [selectedCategory],
  );

  /**
   * Search menu items
   */
  const searchItems = useCallback(async (query) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/search?q=${query}`);
      const data = await response.json();

      if (data.status === "success") {
        setFilteredItems(data.data.items);
        setSelectedCategory("Search Results");
      } else {
        setError(data.message || "No items found");
        setFilteredItems([]);
      }
    } catch (err) {
      console.error("Error searching items:", err);
      setError("Error searching menu items");
      setFilteredItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get subcategories for selected category
   */
  const getSubCategories = useCallback(() => {
    return subCategories;
  }, [subCategories]);

  const value = {
    selectedCategory,
    selectedSubCategory,
    filteredItems,
    loading,
    error,
    categories,
    subCategories,
    handleCategoryChange,
    handleSubCategoryChange,
    getSubCategories,
    searchItems,
    setError,
  };

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};

/**
 * Custom hook to use Menu Context
 */
export const useMenu = () => {
  const context = React.useContext(MenuContext);
  if (!context) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return context;
};
