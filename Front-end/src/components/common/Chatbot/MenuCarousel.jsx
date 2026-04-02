import React from "react";
import { motion } from "framer-motion";
import { MdOutlineShoppingCart, MdStar } from "react-icons/md";

const MenuCarousel = ({ items, onAddToCart, formatPrice, isLoading }) => (
  <div className="flex h-full flex-col gap-2 overflow-hidden">
    <p className="shrink-0 text-[0.62rem] font-medium text-gray-400">{items.length} dishes · tap to add</p>

    {isLoading ? (
      <div className="flex flex-col gap-2.5">
        {[1, 2, 3].map((n) => <div key={n} className="flavie-shimmer h-[4.5rem] w-full" />)}
      </div>
    ) : (
      <div className="flavie-scroll flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2 pb-1">
          {items.map((item, i) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.2 }}
              className="flavie-item flex items-center gap-2.5 overflow-hidden rounded-2xl border border-gray-100 bg-white p-2.5 shadow-sm"
            >
              {/* Thumbnail */}
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/footer-images/food.png"; }}
                />
                {item.veg !== undefined && (
                  <div
                    className="absolute left-0.5 top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded border-2 bg-white"
                    style={{ borderColor: item.veg ? "#16a34a" : "#dc2626" }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: item.veg ? "#16a34a" : "#dc2626" }} />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="flex items-start justify-between gap-1">
                  <p className="min-w-0 flex-1 truncate text-xs font-bold text-gray-800">{item.name}</p>
                  <div className="ml-1 inline-flex shrink-0 items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[0.58rem] font-bold text-amber-600">
                    <MdStar className="text-amber-500 text-[0.55rem]" />{item.rating}
                  </div>
                </div>
                <p className="mt-0.5 text-[0.62rem] text-gray-400">{item.category}</p>
                <div className="mt-1.5 flex items-center justify-between gap-2">
                  <p className="shrink-0 text-sm font-bold text-orange-500">{formatPrice(item.price)}</p>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.92 }}
                    onClick={() => onAddToCart(item)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-orange-500 px-2.5 py-1 text-[0.62rem] font-bold text-white"
                  >
                    <MdOutlineShoppingCart className="text-xs" />
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
