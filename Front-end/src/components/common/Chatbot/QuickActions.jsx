import React from "react";
import { motion } from "framer-motion";
import { MdDeliveryDining, MdOutlineRestaurantMenu, MdTableRestaurant, MdWhatshot } from "react-icons/md";

const ACTIONS = [
  { key: "menu", label: "Menu", icon: MdOutlineRestaurantMenu, bg: "bg-orange-500" },
  { key: "booking", label: "Book", icon: MdTableRestaurant, bg: "bg-rose-500" },
  { key: "tracker", label: "Track", icon: MdDeliveryDining, bg: "bg-amber-500" },
];

const QuickActions = ({ onNavigate, greeting, microCopy }) => (
  <div className="flex h-full flex-col gap-3 overflow-hidden">

    {/* Greeting — matches site's warm card style */}
    <div className="shrink-0 rounded-2xl border border-orange-100 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-100">
          <MdWhatshot className="text-orange-500 text-base" />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-800">I&apos;m Flavie, your food assistant.</p>
          <p className="text-[0.65rem] text-gray-500">{microCopy}</p>
        </div>
      </div>
    </div>

    {/* Action cards */}
    <div className="shrink-0 grid grid-cols-3 gap-2.5">
      {ACTIONS.map((a, i) => {
        const Icon = a.icon;
        return (
          <motion.button
            key={a.key}
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.22 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate(a.key)}
            className="flavie-action-card flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-3 text-center shadow-sm"
          >
            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${a.bg} text-lg text-white shadow-md`}>
              <Icon />
            </span>
            <span className="text-[0.7rem] font-semibold text-gray-700">{a.label}</span>
          </motion.button>
        );
      })}
    </div>

    {/* Feature list */}
    <div className="flavie-scroll flex-1 overflow-y-auto rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
      <p className="mb-2.5 text-[0.6rem] font-bold uppercase tracking-widest text-orange-500">What Flavie can do</p>
      <div className="flex flex-col gap-3">
        {[
          { icon: MdOutlineRestaurantMenu, title: "Browse & order", body: "Visual menu with ratings, one-tap add to cart.", color: "text-orange-500", bg: "bg-orange-50" },
          { icon: MdTableRestaurant, title: "Reserve a table", body: "Inline calendar and time slots, no page reload.", color: "text-rose-500", bg: "bg-rose-50" },
          { icon: MdDeliveryDining, title: "Track delivery", body: "Live prep, dispatch and arrival updates.", color: "text-amber-500", bg: "bg-amber-50" },
        ].map(({ icon: Icon, title, body, color, bg }) => (
          <div key={title} className="flex items-start gap-2.5">
            <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${bg}`}>
              <Icon className={`text-sm ${color}`} />
            </span>
            <div>
              <p className="text-xs font-semibold text-gray-800">{title}</p>
              <p className="mt-0.5 text-[0.62rem] leading-[1.4] text-gray-400">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default QuickActions;
