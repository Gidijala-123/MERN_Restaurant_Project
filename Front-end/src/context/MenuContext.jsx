import React, { createContext, useState, useCallback, useEffect, useRef } from "react";
import MENU_DATA, {
  getItemsByCategory,
  getSubCategoriesByCategory,
} from "../data/menuData";

const API = (import.meta.env.VITE_API_URL || 
  (typeof window !== "undefined" && window.location.hostname !== "localhost" ? window.location.origin : "http://localhost:1111")
).replace(/\/$/, "");

// Merge static data with API data:
// - API items (by itemId/id) override static ones (picks up admin edits)
// - Static items not in API are kept (fallback for unseeded DB)
function mergeMenuData(staticItems, apiItems) {
  if (!apiItems.length) return staticItems;
  const apiById = new Map();
  apiItems.forEach((item) => {
    const key = item.itemId ?? item.id;
    if (key != null) apiById.set(String(key), item);
  });
  // Replace static items that exist in API, keep the rest
  const merged = staticItems.map((s) => {
    const key = String(s.id ?? s.itemId);
    return apiById.has(key) ? { ...s, ...apiById.get(key) } : s;
  });
  // Append API-only items (admin-created, not in static data)
  apiItems.forEach((item) => {
    const key = String(item.itemId ?? item.id);
    const inStatic = staticItems.some((s) => String(s.id ?? s.itemId) === key);
    if (!inStatic) merged.push(item);
  });
  return merged;
}

export const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
  const [allItems, setAllItems] = useState(MENU_DATA);
  const [selectedCategory, setSelectedCategory] = useState("Hot Offers");
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [filteredItems, setFilteredItems] = useState(MENU_DATA);
  const [menuVersion, setMenuVersion] = useState(0);
  const categoryRef = useRef("Hot Offers");
  const subCategoryRef = useRef(null);

  const applyFilter = useCallback((items, category, subCategory) => {
    if (category === "Hot Offers") {
      setFilteredItems(items);
    } else if (subCategory) {
      setFilteredItems(items.filter(
        (i) => i.category === category && i.subCategory === subCategory
      ));
    } else {
      setFilteredItems(items.filter((i) => i.category === category));
    }
  }, []);

  // Fetch from API and merge with static data on mount + after admin changes
  useEffect(() => {
    fetch(`${API}/api/menu?limit=500`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((json) => {
        const apiItems = json?.data?.items || [];
        const merged = mergeMenuData(MENU_DATA, apiItems);
        setAllItems(merged);
        applyFilter(merged, categoryRef.current, subCategoryRef.current);
      })
      .catch(() => {
        // API unavailable — static data already in place, nothing to do
      });
  }, [menuVersion, applyFilter]);

  const handleCategoryChange = useCallback((category) => {
    categoryRef.current = category;
    subCategoryRef.current = null;
    setSelectedCategory(category);
    setSelectedSubCategory(null);
    setAllItems((current) => { applyFilter(current, category, null); return current; });
  }, [applyFilter]);

  const handleSubCategoryChange = useCallback((subCategory) => {
    subCategoryRef.current = subCategory;
    setSelectedSubCategory(subCategory);
    setAllItems((current) => { applyFilter(current, categoryRef.current, subCategory); return current; });
  }, [applyFilter]);

  const getSubCategories = useCallback(() => {
    if (selectedCategory === "Hot Offers") return [];
    const subs = [...new Set(
      allItems
        .filter((i) => i.category === selectedCategory && i.subCategory)
        .map((i) => i.subCategory)
    )];
    return subs.length ? subs : getSubCategoriesByCategory(selectedCategory);
  }, [selectedCategory, allItems]);

  const refreshMenu = useCallback(() => setMenuVersion((v) => v + 1), []);

  const value = {
    selectedCategory,
    selectedSubCategory,
    filteredItems,
    setFilteredItems,
    allItems,
    menuVersion,
    handleCategoryChange,
    handleSubCategoryChange,
    getSubCategories,
    refreshMenu,
  };

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};

export const useMenu = () => {
  const context = React.useContext(MenuContext);
  if (!context) throw new Error("useMenu must be used within a MenuProvider");
  return context;
};
