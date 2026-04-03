import React, { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addToCart } from "../../../features/cartSlice";
import { useGetAllProductsQuery } from "../../../features/productsApi";
import "./Shop.css";

const Shop = ({ searchQuery = "" }) => {
  const dispatch = useDispatch();
  const { data: apiProducts = [] } = useGetAllProductsQuery();
  const { items: reduxProducts = [] } = useSelector((state) => state.products);

  const allProducts = apiProducts.length ? apiProducts : reduxProducts;

  const results = useMemo(() => {
    if (!searchQuery) return allProducts;
    const q = searchQuery.toLowerCase();
    return allProducts.filter(
      (p) =>
        (p.title || p.name || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q) ||
        (p.decrp || p.description || "").toLowerCase().includes(q)
    );
  }, [allProducts, searchQuery]);

  const handleAdd = (item) => {
    dispatch(addToCart({
      id: item.id || item._id,
      title: item.title || item.name,
      img: item.img || item.imageUrl,
      price: Number(item.price) || 0,
      cartQuantity: 1,
    }));
  };

  if (!searchQuery) return null;

  return (
    <div className="shop-results">
      <p className="shop-results-label">
        {results.length} result{results.length !== 1 ? "s" : ""} for{" "}
        <span className="shop-results-term">&ldquo;{searchQuery}&rdquo;</span>
      </p>

      {results.length === 0 ? (
        <div className="shop-empty">
          <div className="shop-empty-icon">🔍</div>
          <p className="shop-empty-title">No items found</p>
          <p className="shop-empty-sub">Try a different keyword</p>
        </div>
      ) : (
        <div className="shop-grid">
          {results.map((item) => (
            <div className="shop-card" key={item.id || item._id}>
              <div className="shop-card-img-wrap">
                <img
                  src={item.img || item.imageUrl || "/footer-images/food.png"}
                  alt={item.title || item.name}
                  className="shop-card-img"
                  onError={(e) => { e.target.onerror = null; e.target.src = "/footer-images/food.png"; }}
                />
                {item.category && (
                  <span className="shop-card-badge">{item.category}</span>
                )}
              </div>
              <div className="shop-card-body">
                <p className="shop-card-title">{item.title || item.name}</p>
                {item.decrp && (
                  <p className="shop-card-desc">{item.decrp}</p>
                )}
                <div className="shop-card-footer">
                  <span className="shop-card-price">Rs. {item.price}</span>
                  <button className="shop-card-btn" onClick={() => handleAdd(item)}>
                    + Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;
