import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdDeliveryDining, MdOutlineRestaurantMenu, MdTableRestaurant, MdWhatshot } from "react-icons/md";

const ACTIONS = [
  { key: "menu", label: "Menu", icon: MdOutlineRestaurantMenu, bg: "bg-orange-500" },
  { key: "booking", label: "Book", icon: MdTableRestaurant, bg: "bg-rose-500" },
  { key: "tracker", label: "Track", icon: MdDeliveryDining, bg: "bg-amber-500" },
];

const CAPABILITIES = [
  { text: "browse the menu & add to cart", icon: "🍽️" },
  { text: "reserve a table with date & time", icon: "📅" },
  { text: "track your order in real-time", icon: "🛵" },
  { text: "get chef-picked recommendations", icon: "👨‍🍳" },
  { text: "check live delivery status", icon: "📍" },
];

const TYPING_SPEED = 45;
const ERASE_SPEED = 22;
const PAUSE_AFTER = 1600;

function useTypewriter(items) {
  const [display, setDisplay] = useState("");
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState("typing");
  const [icon, setIcon] = useState(items[0].icon);
  const timeout = useRef(null);

  useEffect(() => {
    const full = items[index].text;
    if (phase === "typing") {
      if (display.length < full.length) {
        timeout.current = setTimeout(() => setDisplay(full.slice(0, display.length + 1)), TYPING_SPEED);
      } else {
        timeout.current = setTimeout(() => setPhase("pausing"), PAUSE_AFTER);
      }
    } else if (phase === "pausing") {
      setPhase("erasing");
    } else if (phase === "erasing") {
      if (display.length > 0) {
        timeout.current = setTimeout(() => setDisplay(display.slice(0, -1)), ERASE_SPEED);
      } else {
        const next = (index + 1) % items.length;
        setIndex(next);
        setIcon(items[next].icon);
        setPhase("typing");
      }
    }
    return () => clearTimeout(timeout.current);
  }, [display, phase, index, items]);

  return { display, icon, phase };
}

const QuickActions = ({ onNavigate, greeting, microCopy }) => {
  const { display, icon, phase } = useTypewriter(CAPABILITIES);

  return (
    <div className="flavie-scroll flex h-full flex-col gap-2.5 overflow-y-auto pb-1">

      {/* ── Animated greeting card ── */}
      <div className="shrink-0 shadow-sm" style={{ borderRadius: "16px", border: "1px solid var(--cb-border-soft)", background: "var(--cb-bg-card)", padding: "14px" }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-orange-100" style={{ borderRadius: "10px" }}>
            <MdWhatshot className="text-orange-500 text-base" />
          </div>
          <div>
            <p className="mb-0 font-bold" style={{ fontSize: "0.75rem", lineHeight: 1.3, color: "var(--cb-text-main)" }}>
              Hi, I&apos;m <span style={{ color: "#ea580c" }}>Flavie</span> — your food assistant.
            </p>
            <p className="mb-0" style={{ fontSize: "0.6rem", lineHeight: 1.3, color: "var(--cb-text-faint)" }}>{microCopy}</p>
          </div>
        </div>

        {/* Typewriter row */}
        <div style={{ borderRadius: "10px", background: "var(--cb-bg-warm)", border: "1px solid var(--cb-border-soft)", padding: "10px 12px" }}>
          <p className="mb-1 font-bold uppercase text-orange-400" style={{ fontSize: "0.55rem", letterSpacing: "0.1em" }}>
            I can help you…
          </p>
          <div className="flex items-center gap-2" style={{ minHeight: "22px" }}>
            <AnimatePresence mode="wait">
              <motion.span
                key={icon}
                initial={{ opacity: 0, scale: 0.6, rotate: -15 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.2 }}
                style={{ fontSize: "1rem", lineHeight: 1, flexShrink: 0 }}
              >
                {icon}
              </motion.span>
            </AnimatePresence>
            <p className="mb-0 font-semibold" style={{ fontSize: "0.72rem", lineHeight: 1.4, color: "var(--cb-text-sub)" }}>
              {display}
              <span
                style={{
                  display: "inline-block",
                  width: "2px",
                  height: "0.75em",
                  background: "#ea580c",
                  borderRadius: "1px",
                  marginLeft: "2px",
                  verticalAlign: "middle",
                  animation: phase === "pausing" ? "flavie-blink 0.7s step-end infinite" : "none",
                  opacity: phase === "erasing" ? 0.4 : 1,
                }}
              />
            </p>
          </div>
        </div>
      </div>

      {/* ── Action cards ── */}
      <div className="shrink-0 grid grid-cols-3 gap-2">
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
              className={`flavie-action-card flex flex-col items-center gap-1.5 shadow-sm`}
              style={{ borderRadius: "14px", padding: "10px 8px", background: "var(--cb-bg-card)", border: "1px solid var(--cb-border-muted)" }}
            >
              <span
                className={`inline-flex items-center justify-center text-base text-white shadow-sm ${a.bg}`}
                style={{ width: "34px", height: "34px", borderRadius: "10px" }}
              >
                <Icon />
              </span>
              <span style={{ fontSize: "0.65rem", fontWeight: 600, color: "var(--cb-text-sub)" }}>{a.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* ── Today's specials ── */}
      <div className="shrink-0 shadow-sm" style={{ borderRadius: "16px", border: "1px solid var(--cb-border-soft)", background: "var(--cb-bg-card)", padding: "14px" }}>
        <div className="mb-2.5 flex items-center justify-between">
          <p className="mb-0 font-bold uppercase text-orange-500" style={{ fontSize: "0.62rem", letterSpacing: "0.1em" }}>
            🔥 Today&apos;s specials
          </p>
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={() => onNavigate("menu")}
            className="font-semibold text-orange-500 transition hover:text-orange-600"
            style={{ background: "none", border: "none", padding: 0, fontSize: "0.6rem", cursor: "pointer" }}
          >
            See all →
          </motion.button>
        </div>
        <div className="flex flex-col" style={{ gap: "8px" }}>
          {[
            { emoji: "🍛", name: "Signature Dum Biryani", tag: "Chef's pick", price: "₹349", badge: "var(--cb-bg-warm)", badgeText: "#ea580c" },
            { emoji: "🍗", name: "Smoked Tandoori Platter", tag: "Bestseller", price: "₹429", badge: "#fef9c3", badgeText: "#ca8a04" },
            { emoji: "🥗", name: "Citrus Garden Salad", tag: "Light & fresh", price: "₹229", badge: "#ecfdf5", badgeText: "#059669" },
          ].map(({ emoji, name, tag, price, badge, badgeText }, i) => (
            <motion.button
              key={name}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.07, duration: 0.22 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate("menu")}
              className="flex items-center gap-2.5 w-full text-left transition hover:shadow-md"
              style={{ borderRadius: "12px", background: "var(--cb-bg-item)", border: "1px solid var(--cb-border-muted)", padding: "9px 10px", cursor: "pointer" }}
            >
              <span style={{ fontSize: "1.4rem", lineHeight: 1, flexShrink: 0 }}>{emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="mb-0 font-semibold truncate" style={{ fontSize: "0.7rem", lineHeight: 1.2, color: "var(--cb-text-main)" }}>{name}</p>
                <span style={{ display: "inline-block", marginTop: "3px", borderRadius: "20px", background: badge, color: badgeText, fontSize: "0.55rem", fontWeight: 700, padding: "1px 7px" }}>
                  {tag}
                </span>
              </div>
              <span className="font-bold text-orange-500 shrink-0" style={{ fontSize: "0.7rem" }}>{price}</span>
            </motion.button>
          ))}
        </div>
      </div>

    </div>
  );
};

export default QuickActions;
