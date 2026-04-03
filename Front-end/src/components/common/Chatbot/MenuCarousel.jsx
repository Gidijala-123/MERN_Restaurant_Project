import React from "react";
import { motion } from "framer-motion";
import { MdOutlineShoppingCart, MdStar } from "react-icons/md";

const MenuCarousel = ({ items, onAddToCart, formatPrice, isLoading }) => (
  <div className="flex h-full flex-col gap-2 overflow-hidden">
    <p className="mb-0 shrink-0 text-[0.62rem] font-medium text-gray-400">
      {items.length} dishes · tap to add
    </p>

    {isLoading ? (
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((n) => <div key={n} className="flavie-shimmer h-20 w-full" />)}
      </div>
    ) : (
      <div className="flavie-scroll flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2.5 pb-1">
          {items.map((item, i) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.2 }}
              className="flex items-center gap-3 rounded-2xl border border-orange-100 bg-white shadow-sm"
              style={{ padding: "10px 10px 10px 10px" }}
            >
              {/* Thumbnail */}
              <div
                className="relative shrink-0 overflow-hidden"
                style={{ width: "56px", height: "56px", borderRadius: "10px" }}
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="chatbot-item-img h-full w-full object-cover"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/footer-images/food.png"; }}
                />
                {item.veg !== undefined && (
                  <div
                    className="absolute left-0.5 top-0.5 flex h-3.5 w-3.5 items-center justify-center bg-white"
                    style={{ borderRadius: "3px", border: `2px solid ${item.veg ? "#16a34a" : "#dc2626"}` }}
                  >
                    <span
                      className="h-1.5 w-1.5"
                      style={{ borderRadius: "50%", background: item.veg ? "#16a34a" : "#dc2626" }}
                    />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex min-w-0 flex-1 flex-col" style={{ gap: "3px" }}>
                {/* Name + rating */}
                <div className="flex items-start gap-1">
                  <p className="mb-0 min-w-0 flex-1 truncate text-xs font-bold text-gray-800">{item.name}</p>
                  <div
                    className="ml-1 inline-flex shrink-0 items-center gap-0.5 bg-amber-50 text-amber-600"
                    style={{ borderRadius: "20px", padding: "2px 6px", fontSize: "0.58rem", fontWeight: 700 }}
                  >
                    <MdStar style={{ fontSize: "0.55rem", color: "#d97706" }} />{item.rating}
                  </div>
                </div>

                {/* Category */}
                <p className="mb-0 text-gray-400" style={{ fontSize: "0.6rem" }}>{item.category}</p>

                {/* Price + Add */}
                <div className="flex items-center justify-between" style={{ marginTop: "2px" }}>
                  <p className="mb-0 font-bold text-orange-500" style={{ fontSize: "0.85rem" }}>
                    {formatPrice(item.price)}
                  </p>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.92 }}
                    onClick={() => onAddToCart(item)}
                    className="inline-flex shrink-0 items-center gap-1 bg-orange-500 font-bold text-white"
                    style={{ borderRadius: "8px", padding: "5px 10px", fontSize: "0.65rem" }}
                  >
                    <MdOutlineShoppingCart style={{ fontSize: "0.7rem" }} />
                    Add
                  </motion.button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    )}
  </div>
);

export default MenuCarousel;
