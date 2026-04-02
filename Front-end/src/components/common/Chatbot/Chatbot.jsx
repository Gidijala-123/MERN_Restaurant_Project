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
    imageUrl: item.imageUrl || "/footer-images/food.png",
    category: item.category || "Signature",
    description: item.description || `A house favorite from our ${String(item.category || "signature").toLowerCase()} selection.`,
    veg: item.veg,
  }));
};

const panelVariants = {
  initial: { opacity: 0, y: 24, scale: 0.94 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 16, scale: 0.97 },
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
    dispatch(addToCart({ ...item, title: item.name, img: item.imageUrl, price: Number(item.price) || 0 }));
    toast.success(`${item.name} added to cart!`, { position: "bottom-left" });
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
          <motion.aside
            key="flavie-panel"
            variants={panelVariants}
            initial="initial" animate="animate" exit="exit"
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="flavie-panel fixed bottom-5 right-4 z-[1400] flex h-[min(44rem,calc(100vh-5rem))] w-[22rem] flex-col overflow-hidden rounded-2xl sm:right-6"
            role="dialog"
            aria-label="Flavie food assistant"
          >
            {/* ── Header — bold orange like the site's profile card ── */}
            <div className="relative shrink-0 overflow-hidden bg-orange-500 px-4 py-3">
              {/* Decorative circle — matches site's orange card style */}
              <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/10" />
              <div className="absolute -bottom-4 right-8 h-12 w-12 rounded-full bg-white/8" />

              <div className="relative flex items-center gap-3">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/25 text-sm font-black text-white shadow-lg">
                    Fl
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                    <span className="flavie-pulse absolute inline-flex h-full w-full rounded-full bg-green-300/60" />
                    <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-orange-500 bg-green-400" />
                  </span>
                </div>

                {/* Name */}
                <div className="min-w-0 flex-1">
                  <p className="text-base font-bold leading-tight text-white font-['Poppins']">{meta.label}</p>
                  <p className="text-[0.65rem] leading-tight text-orange-100">{meta.sub}</p>
                </div>

                {/* Close */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white transition hover:bg-white/30"
                  aria-label="Close"
                >
                  <MdClose className="text-base" />
                </button>
              </div>
            </div>

            {/* ── Tab navigation ── */}
            <div className="relative shrink-0 flex border-b border-gray-100 bg-white">
              {NAV_TABS.map(({ key, icon: Icon, label }) => {
                const active = state.screen === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => nav(key)}
                    className={`flavie-tab-active relative flex flex-1 flex-col items-center gap-0.5 pb-2 pt-2 text-[0.6rem] font-semibold uppercase tracking-wide transition-colors ${active ? "text-orange-600" : "text-gray-400 hover:text-gray-600"
                      }`}
                  >
                    <Icon className={`text-base ${active ? "text-orange-500" : "text-gray-400"}`} />
                    {label}
                  </button>
                );
              })}
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

            {/* ── Input bar — orange like header ── */}
            <div className="relative shrink-0 bg-orange-500 px-4 py-3">
              <div className="flavie-input flex items-center gap-2 overflow-hidden rounded-xl border border-white/30 bg-white/20 pl-3 pr-1.5 py-1.5 transition">
                <input
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSend(); } }}
                  placeholder="Ask for menu, booking, or tracking…"
                  className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-orange-100/70"
                  aria-label="Message Flavie"
                />
                <motion.button
                  type="button"
                  onClick={handleSend}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-orange-500 shadow-sm"
                  aria-label="Send"
                >
                  <MdSend className="text-sm" />
                </motion.button>
              </div>
              <p className="mt-1.5 text-center text-[0.55rem] text-orange-100/50">Flavie · GBR Kitchen</p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── FAB — only when panel is closed ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="flavie-fab"
            type="button"
            onClick={() => setIsOpen(true)}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            whileHover={{ scale: 1.12, y: -3 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 right-5 z-[1400] sm:bottom-7 sm:right-6"
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
            aria-label="Open Flavie food assistant"
          >
            {/* Pulsing ring behind icon */}
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="h-14 w-14 animate-ping rounded-full bg-orange-400 opacity-20" />
            </span>

            {/* Chef bot SVG icon — no background shape */}
            <svg
              width="60"
              height="60"
              viewBox="0 0 60 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ filter: "drop-shadow(0 4px 12px rgba(234,88,12,0.55))" }}
            >
              {/* Chef hat */}
              <ellipse cx="30" cy="18" rx="14" ry="5" fill="#ea580c" />
              <rect x="18" y="14" width="24" height="10" rx="3" fill="#ea580c" />
              <ellipse cx="30" cy="10" rx="8" ry="8" fill="#fb923c" />
              <ellipse cx="24" cy="8" rx="5" ry="5" fill="#fb923c" />
              <ellipse cx="36" cy="8" rx="5" ry="5" fill="#fb923c" />
              {/* Hat band */}
              <rect x="18" y="21" width="24" height="3" rx="1.5" fill="#c2410c" />

              {/* Bot face */}
              <rect x="16" y="24" width="28" height="22" rx="6" fill="#fff7ed" stroke="#ea580c" strokeWidth="1.5" />

              {/* Eyes */}
              <circle cx="24" cy="32" r="3" fill="#ea580c" />
              <circle cx="36" cy="32" r="3" fill="#ea580c" />
              <circle cx="25" cy="31" r="1" fill="white" />
              <circle cx="37" cy="31" r="1" fill="white" />

              {/* Smile */}
              <path d="M24 38 Q30 43 36 38" stroke="#ea580c" strokeWidth="1.8" strokeLinecap="round" fill="none" />

              {/* Antenna */}
              <line x1="30" y1="24" x2="30" y2="18" stroke="#ea580c" strokeWidth="1.5" />
              <circle cx="30" cy="17" r="2" fill="#fb923c" />

              {/* Notification dot */}
              <circle cx="50" cy="12" r="6" fill="#22c55e" stroke="white" strokeWidth="2" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
