import React, { useMemo, useReducer, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MdClose, MdSend,
  MdOutlineRestaurantMenu, MdTableRestaurant, MdDeliveryDining, MdHomeFilled,
} from "react-icons/md";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { addToCart } from "../../features/cartSlice";
import { useGetAllProductsQuery } from "../../features/productsApi";
import BookingFlow from "./BookingFlow";
import MenuCarousel from "./MenuCarousel";
import OrderTracker from "./OrderTracker";
import QuickActions from "./QuickActions";
import "./Chatbot.css";

const SCREEN = {
  HOME: "quick-actions",
  MENU: "menu",
  BOOKING: "booking",
  TRACKER: "tracker",
};

const TRACKING_STEPS = [
  { title: "Preparing", detail: "Chef is plating your order with fresh ingredients.", eta: "4 mins" },
  { title: "Out for delivery", detail: "Rider Arjun picked up your order and is on the way.", eta: "12 mins" },
  { title: "Arrived", detail: "Your order has reached the destination. Enjoy your meal.", eta: "Now" },
];

const FALLBACK_MENU_ITEMS = [
  { id: "f1", name: "Signature Dum Biryani", price: 349, rating: 4.9, imageUrl: "/footer-images/peppers.png", category: "Biryanis", description: "Fragrant basmati rice, saffron notes, and slow-cooked spices." },
  { id: "f2", name: "Smoked Tandoori Platter", price: 429, rating: 4.8, imageUrl: "/footer-images/chicken.png", category: "Tandooris", description: "Charred edges, house marinade, and mint yogurt on the side." },
  { id: "f3", name: "Citrus Garden Salad", price: 229, rating: 4.7, imageUrl: "/footer-images/salads.jpg", category: "Salads", description: "Crisp greens, roasted seeds, citrus dressing, shaved parmesan." },
  { id: "f4", name: "Wok Tossed Noodle Bowl", price: 279, rating: 4.6, imageUrl: "/footer-images/chinese.png", category: "Chinese", description: "Saucy noodles finished with peppers, scallions, and sesame." },
];

const NAV_TABS = [
  { key: SCREEN.HOME, icon: MdHomeFilled, label: "Home" },
  { key: SCREEN.MENU, icon: MdOutlineRestaurantMenu, label: "Menu" },
  { key: SCREEN.BOOKING, icon: MdTableRestaurant, label: "Book" },
  { key: SCREEN.TRACKER, icon: MdDeliveryDining, label: "Track" },
];

const initialState = {
  screen: SCREEN.HOME,
  selectedDate: new Date(),
  selectedTime: "7:30 PM",
  bookingConfirmed: false,
  trackerStep: 1,
};

function chatbotReducer(state, action) {
  switch (action.type) {
    case "NAVIGATE": return { ...state, screen: action.payload };
    case "SET_DATE": return { ...state, selectedDate: action.payload, bookingConfirmed: false };
    case "SET_TIME": return { ...state, selectedTime: action.payload, bookingConfirmed: false };
    case "CONFIRM_BOOKING": return { ...state, bookingConfirmed: true };
    case "ADVANCE_TRACKER": return { ...state, trackerStep: Math.min(state.trackerStep + 1, TRACKING_STEPS.length - 1) };
    case "RESET": return initialState;
    default: return state;
  }
}

const formatPrice = (price) => {
  const n = Number(price);
  if (Number.isNaN(n)) return price;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const getMicroCopy = () => {
  const h = new Date().getHours();
  if (h < 11) return "Breakfast is hot and the kitchen is in full swing.";
  if (h < 16) return "Lunch rush looks good. Want something chef-picked?";
  if (h < 20) return "Perfect weather for a hot soup and something smoky.";
  return "Late cravings deserve a comfort bowl and a fast checkout.";
};

const normalizeMenuItems = (products) => {
  if (!Array.isArray(products) || products.length === 0) return FALLBACK_MENU_ITEMS;
  return products.slice(0, 8).map((item, i) => ({
    id: item.id || item._id || `fi-${i}`,
    name: item.name || item.title || "Chef Special",
    price: Number(item.price) || 299,
    rating: item.rating || (4.6 + ((i % 4) * 0.1)).toFixed(1),
    imageUrl: item.imageUrl || item.img || "/footer-images/food.png",
    category: item.category || item.decrp || "Signature",
    description: item.description || item.decrp || `A house favorite.`,
    veg: item.veg,
  }));
};

const panelVariants = {
  initial: { opacity: 0, y: 60, scale: 0.82, rotateX: 8, transformOrigin: "bottom right" },
  animate: { opacity: 1, y: 0, scale: 1, rotateX: 0, transformOrigin: "bottom right" },
  exit: { opacity: 0, y: 40, scale: 0.88, rotateX: 4, transformOrigin: "bottom right" },
};

const screenVariants = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
};

const Chatbot = () => {
  const dispatch = useDispatch();
  const { data: products = [], isLoading } = useGetAllProductsQuery();
  const [state, stateDispatch] = useReducer(chatbotReducer, initialState);
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef(null);
  const menuItems = useMemo(() => normalizeMenuItems(products), [products]);

  const nav = (screen) => stateDispatch({ type: "NAVIGATE", payload: screen });

  const handleAddToCart = (item) => {
    dispatch(addToCart({
      id: item.id,
      title: item.name,
      img: item.imageUrl,
      price: Number(item.price) || 0,
      cartQuantity: 1,
    }));
  };

  const handleSend = () => {
    const msg = draft.trim().toLowerCase();
    if (!msg) return;
    if (msg.includes("menu") || msg.includes("dish") || msg.includes("food") || msg.includes("eat"))
      nav(SCREEN.MENU);
    else if (msg.includes("book") || msg.includes("table") || msg.includes("reservation") || msg.includes("seat"))
      nav(SCREEN.BOOKING);
    else if (msg.includes("track") || msg.includes("order") || msg.includes("delivery") || msg.includes("status"))
      nav(SCREEN.TRACKER);
    else
      toast.info("Try: 'show menu', 'book a table', or 'track my order'", { position: "bottom-left" });
    setDraft("");
  };

  const handleBookingConfirm = () => {
    stateDispatch({ type: "CONFIRM_BOOKING" });
    toast.success("Table reserved! Flavie has noted your slot.", { position: "bottom-left" });
  };

  const screenMeta = {
    [SCREEN.HOME]: { label: "Flavie", sub: `${getGreeting()} · Food assistant` },
    [SCREEN.MENU]: { label: "Chef's picks", sub: `${menuItems.length} dishes ready to add` },
    [SCREEN.BOOKING]: { label: "Reserve a table", sub: "Pick date & time" },
    [SCREEN.TRACKER]: { label: "Your order", sub: TRACKING_STEPS[state.trackerStep].title },
  };

  const meta = screenMeta[state.screen];

  const renderScreen = () => {
    switch (state.screen) {
      case SCREEN.MENU:
        return <MenuCarousel isLoading={isLoading} items={menuItems} onAddToCart={handleAddToCart} formatPrice={formatPrice} />;
      case SCREEN.BOOKING:
        return <BookingFlow selectedDate={state.selectedDate} selectedTime={state.selectedTime} bookingConfirmed={state.bookingConfirmed} onDateChange={(d) => stateDispatch({ type: "SET_DATE", payload: d })} onTimeChange={(t) => stateDispatch({ type: "SET_TIME", payload: t })} onConfirm={handleBookingConfirm} />;
      case SCREEN.TRACKER:
        return <OrderTracker currentStep={state.trackerStep} steps={TRACKING_STEPS} onAdvance={() => stateDispatch({ type: "ADVANCE_TRACKER" })} />;
      default:
        return <QuickActions onNavigate={nav} greeting={getGreeting()} microCopy={getMicroCopy()} />;
    }
  };

  return (
    <>
      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <div style={{ perspective: "1000px", position: "fixed", bottom: "1.25rem", right: "1rem", zIndex: 1400 }} className="sm:right-6">
            <motion.aside
              key="flavie-panel"
              variants={panelVariants}
              initial="initial" animate="animate" exit="exit"
              transition={{
                default: { type: "spring", stiffness: 340, damping: 28, mass: 0.9 },
                opacity: { duration: 0.18, ease: "easeOut" },
                rotateX: { type: "spring", stiffness: 300, damping: 30 },
              }}
              className="flavie-panel flex h-[min(44rem,calc(100vh-5rem))] w-[22rem] flex-col overflow-hidden rounded-2xl"
              role="dialog"
              aria-label="Flavie food assistant"
            >
              {/* ── Header — bold orange like the site's profile card ── */}
              <div className="relative shrink-0 overflow-hidden bg-orange-500 px-4 py-3">
                {/* Decorative circle — matches site's orange card style */}
                <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/10" />
                <div className="absolute -bottom-4 right-8 h-12 w-12 rounded-full bg-white/8" />

                <div className="relative flex h-11 items-center gap-3">
                  {/* Avatar — mini animated bot icon */}
                  <div className="relative shrink-0">
                    <div
                      className="flex h-9 w-9 items-center justify-center bg-white shadow-lg shadow-orange-700/30"
                      style={{ borderRadius: "12px" }}
                    >
                      <svg width="30" height="32" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Hat puffs */}
                        <ellipse cx="28" cy="12" rx="7" ry="7" fill="#fb923c" />
                        <ellipse cx="36" cy="9" rx="8" ry="8" fill="#fb923c" />
                        <ellipse cx="44" cy="12" rx="7" ry="7" fill="#fb923c" />
                        {/* Hat band */}
                        <rect x="21" y="16" width="30" height="8" rx="3" fill="#ea580c" />
                        <rect x="21" y="21" width="30" height="3" rx="1.5" fill="#c2410c" />
                        {/* Face */}
                        <rect x="19" y="24" width="34" height="28" rx="8" fill="#fff7ed" stroke="#ea580c" strokeWidth="1.8" />
                        {/* Eyes — blinking */}
                        <circle cx="29" cy="34" r="3.5" fill="#ea580c" className="flavie-eye-l" />
                        <circle cx="43" cy="34" r="3.5" fill="#ea580c" className="flavie-eye-r" />
                        <circle cx="30" cy="33" r="1.2" fill="white" className="flavie-eye-l" />
                        <circle cx="44" cy="33" r="1.2" fill="white" className="flavie-eye-r" />
                        {/* Smile */}
                        <path d="M28 43 Q36 49 44 43" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" fill="none" />
                      </svg>
                    </div>
                    {/* Online dot */}
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                      <span className="flavie-pulse absolute inline-flex h-full w-full rounded-full bg-green-300/60" />
                      <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-orange-500 bg-green-400" />
                    </span>
                  </div>

                  {/* Name — self-centered, natural height */}
                  <div className="min-w-0 flex-1 self-center overflow-hidden">
                    <p className="mb-0 truncate text-sm font-bold leading-tight text-white font-['Poppins']">{meta.label}</p>
                    <p className="mb-0 truncate text-[0.62rem] leading-tight text-orange-100/90">{meta.sub}</p>
                  </div>

                  {/* Close — same size and radius as avatar */}
                  <motion.button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.88, rotate: 180 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="flex h-9 w-9 shrink-0 items-center justify-center bg-white text-orange-500 shadow-sm"
                    style={{ borderRadius: "12px" }}
                    aria-label="Close"
                  >
                    <MdClose className="text-base" />
                  </motion.button>
                </div>
              </div>

              {/* ── Tab navigation ── */}
              <div className="relative shrink-0 border-b border-gray-100 bg-white" style={{ padding: "6px 8px 0" }}>
                <div className="flex gap-1">
                  {NAV_TABS.map(({ key, icon: Icon, label }) => {
                    const active = state.screen === key;
                    return (
                      <motion.button
                        key={key}
                        type="button"
                        onClick={() => nav(key)}
                        whileTap={{ scale: 0.93 }}
                        className="relative flex flex-1 flex-col items-center gap-1 transition-colors"
                        style={{ padding: "7px 4px 9px", borderRadius: "10px 10px 0 0", background: active ? "#fff7ed" : "transparent", border: active ? "1px solid #fed7aa" : "1px solid transparent", borderBottom: active ? "1px solid #fff7ed" : "1px solid transparent", marginBottom: active ? "-1px" : "0" }}
                      >
                        {/* Icon wrapper */}
                        <span
                          className="flex items-center justify-center transition-all"
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "8px",
                            background: active ? "#ea580c" : "#f3f4f6",
                            boxShadow: active ? "0 2px 8px rgba(234,88,12,0.35)" : "none",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <Icon style={{ fontSize: "0.95rem", color: active ? "#fff" : "#9ca3af", transition: "color 0.2s ease" }} />
                        </span>
                        <span
                          style={{
                            fontSize: "0.58rem",
                            fontWeight: 700,
                            letterSpacing: "0.04em",
                            color: active ? "#ea580c" : "#9ca3af",
                            transition: "color 0.2s ease",
                          }}
                        >
                          {label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* ── Screen body ── */}
              <div className="relative min-h-0 flex-1 overflow-hidden bg-[#fafafa] px-4 py-3">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={state.screen}
                    variants={screenVariants}
                    initial="initial" animate="animate" exit="exit"
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="h-full"
                  >
                    {renderScreen()}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* ── Input bar ── */}
              <div className="relative shrink-0 bg-orange-500" style={{ padding: "12px 16px" }}>
                <div
                  className="flavie-input flex items-center gap-2 bg-white/20 transition"
                  style={{ borderRadius: "12px", border: "1.5px solid rgba(255,255,255,0.4)", padding: "0 8px 0 14px", height: "42px" }}
                >
                  <input
                    ref={inputRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSend(); } }}
                    placeholder="Ask for menu, booking, or tracking…"
                    style={{ fontSize: "0.75rem", lineHeight: "1" }}
                    className="mb-0 min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-orange-100/65"
                    aria-label="Message Flavie"
                  />
                  <motion.button
                    type="button"
                    onClick={handleSend}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.94 }}
                    className="flex shrink-0 items-center justify-center bg-white text-orange-500 shadow-sm"
                    style={{ width: "30px", height: "30px", borderRadius: "8px" }}
                    aria-label="Send"
                  >
                    <MdSend className="text-sm" />
                  </motion.button>
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* ── FAB — only when panel is closed ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="flavie-fab"
            type="button"
            onClick={() => setIsOpen(true)}
            initial={{ opacity: 0, scale: 0.4, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 16 }}
            whileHover={{ scale: 1.12, y: -3 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 380, damping: 22, mass: 0.8 }}
            className="fixed bottom-6 right-5 z-[1400] sm:bottom-7 sm:right-6"
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
            aria-label="Open Flavie food assistant"
          >
            {/* Bot-shaped ripple */}
            <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg
                className="flavie-bot-ripple absolute"
                width="88"
                height="88"
                viewBox="0 0 72 72"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <ellipse cx="28" cy="12" rx="7" ry="7" fill="#fb923c" />
                <ellipse cx="36" cy="9" rx="8" ry="8" fill="#fb923c" />
                <ellipse cx="44" cy="12" rx="7" ry="7" fill="#fb923c" />
                <rect x="21" y="16" width="30" height="8" rx="3" fill="#ea580c" />
                <rect x="19" y="24" width="34" height="28" rx="8" fill="#ea580c" />
                <rect x="25" y="51" width="8" height="10" rx="4" fill="#ea580c" />
                <rect x="39" y="51" width="8" height="10" rx="4" fill="#ea580c" />
                <rect x="51" y="34" width="5" height="14" rx="2.5" fill="#ea580c" />
                <rect x="10" y="33" width="9" height="4.5" rx="2.2" fill="#ea580c" />
                <rect x="7" y="25" width="4.5" height="10" rx="2.2" fill="#ea580c" />
              </svg>
            </span>

            {/* Chef bot SVG icon — no background shape */}
            <svg
              width="72"
              height="72"
              viewBox="0 0 72 72"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ filter: "drop-shadow(0 4px 14px rgba(234,88,12,0.55))" }}
            >
              {/* Chef hat puffs */}
              <ellipse cx="28" cy="12" rx="7" ry="7" fill="#fb923c" />
              <ellipse cx="36" cy="9" rx="8" ry="8" fill="#fb923c" />
              <ellipse cx="44" cy="12" rx="7" ry="7" fill="#fb923c" />

              {/* Hat band */}
              <rect x="21" y="16" width="30" height="8" rx="3" fill="#ea580c" />
              <rect x="21" y="21" width="30" height="3" rx="1.5" fill="#c2410c" />

              {/* Bot face/body */}
              <rect x="19" y="24" width="34" height="28" rx="8" fill="#fff7ed" stroke="#ea580c" strokeWidth="1.8" />

              {/* Eyes */}
              <circle cx="29" cy="34" r="3.5" fill="#ea580c" className="flavie-eye-l" />
              <circle cx="43" cy="34" r="3.5" fill="#ea580c" className="flavie-eye-r" />
              <circle cx="30" cy="33" r="1.2" fill="white" className="flavie-eye-l" />
              <circle cx="44" cy="33" r="1.2" fill="white" className="flavie-eye-r" />

              {/* Smile */}
              <path d="M28 43 Q36 49 44 43" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" fill="none" />

              {/* ── Right arm — natural resting with elbow ── */}
              {/* Upper arm: short, down from shoulder */}
              <rect x="51" y="34" width="5" height="7" rx="2.5" fill="#ea580c" />
              {/* Elbow joint */}
              <circle cx="53.5" cy="41" r="2.8" fill="#ea580c" />
              {/* Forearm: continues down */}
              <rect x="51" y="41" width="5" height="7" rx="2.5" fill="#ea580c" />
              {/* Small closed fist */}
              <ellipse cx="53.5" cy="50" rx="3.5" ry="3" fill="#fb923c" />

              {/* ── Left arm — waving with elbow, scaled smaller ── */}
              <g className="flavie-wave" style={{ transformOrigin: "19px 36px" }}>
                {/* Upper arm: goes left from shoulder */}
                <rect x="10" y="33" width="9" height="4.5" rx="2.2" fill="#ea580c" />
                {/* Elbow joint */}
                <circle cx="11" cy="35" r="2.5" fill="#ea580c" />
                {/* Forearm: bends upward */}
                <rect x="7" y="25" width="4.5" height="10" rx="2.2" fill="#ea580c" />
                {/* Wrist */}
                <circle cx="9.2" cy="25" r="2.5" fill="#ea580c" />
                {/* Palm — smaller */}
                <ellipse cx="9.2" cy="21" rx="4.5" ry="3.5" fill="#fb923c" />
                {/* 3 fingers */}
                <ellipse cx="6" cy="18" rx="1.5" ry="2.5" fill="#fb923c" />
                <ellipse cx="9" cy="17" rx="1.5" ry="2.8" fill="#fb923c" />
                <ellipse cx="12" cy="18" rx="1.5" ry="2.5" fill="#fb923c" />
              </g>

              {/* Legs */}
              <rect x="25" y="51" width="8" height="10" rx="4" fill="#ea580c" />
              <rect x="39" y="51" width="8" height="10" rx="4" fill="#ea580c" />
            </svg>

            {/* Bot name label */}
            <div className="mt-0.5 text-center">
              <span
                className="block text-[0.65rem] font-bold tracking-wide"
                style={{ color: "#ea580c", textShadow: "0 1px 4px rgba(234,88,12,0.25)", fontFamily: "Poppins, sans-serif" }}
              >
                Flavie
              </span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
