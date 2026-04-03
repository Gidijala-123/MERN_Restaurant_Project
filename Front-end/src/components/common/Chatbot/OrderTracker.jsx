import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdCall, MdDeliveryDining, MdDoneAll, MdRestaurant,
  MdLocationOn, MdPerson, MdStar, MdAccessTime, MdReceipt,
  MdLocalFireDepartment, MdCheckCircle,
} from "react-icons/md";
import { toast } from "react-toastify";

const STEP_ICONS = [MdRestaurant, MdDeliveryDining, MdDoneAll];

const ORDER_ITEMS = [
  { name: "Signature Dum Biryani", qty: 1, price: "₹349" },
  { name: "Smoked Tandoori Platter", qty: 2, price: "₹858" },
];

const RIDER = { name: "Arjun K.", rating: 4.8, trips: 312, vehicle: "Honda Activa · KA-05-XY-1234" };

const OrderTracker = ({ currentStep, steps, onAdvance }) => {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [givenRating, setGivenRating] = useState(0);
  const delivered = currentStep >= steps.length - 1;

  const handleRate = (star) => {
    setGivenRating(star);
    toast.success(`Thanks for the ${star}★ rating!`, { position: "bottom-left" });
  };

  return (
    <div className="flavie-scroll flex h-full flex-col gap-2.5 overflow-y-auto pb-1">

      {/* ── Order summary card ── */}
      <div className="shrink-0 bg-white shadow-sm" style={{ borderRadius: "16px", border: `1px solid ${delivered ? "#a7f3d0" : "#fed7aa"}`, padding: "14px", transition: "border-color 0.4s ease" }}>
        <p className="mb-1 font-bold uppercase" style={{ fontSize: "0.58rem", letterSpacing: "0.12em", color: delivered ? "#059669" : "#ea580c" }}>
          Order #FLV-2048
        </p>
        <div className="flex items-center justify-between gap-2">
          <p className="mb-0 text-sm font-bold text-gray-800">
            {currentStep === 0 ? "Being prepared" : currentStep === 1 ? "Rider is nearby" : "Delivered!"}
          </p>
          <span style={{
            borderRadius: "20px",
            border: `1px solid ${delivered ? "#a7f3d0" : "#a7f3d0"}`,
            background: delivered ? "#ecfdf5" : "#ecfdf5",
            padding: "3px 10px", fontSize: "0.62rem", fontWeight: 600,
            color: "#059669",
          }}>
            {delivered ? "✓ Delivered" : `ETA ${steps[currentStep]?.eta}`}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full" style={{ background: delivered ? "#d1fae5" : "#ffedd5" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: delivered ? "#10b981" : "#ea580c" }}
            initial={{ width: "0%" }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <div className="mt-1 flex justify-between text-gray-400" style={{ fontSize: "0.55rem" }}>
          <span>Placed</span><span>Delivered</span>
        </div>
      </div>

      {/* ── Delivered celebration banner ── */}
      <AnimatePresence>
        {delivered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="shrink-0"
            style={{ borderRadius: "16px", background: "linear-gradient(135deg,#ecfdf5,#d1fae5)", border: "1.5px solid #6ee7b7", padding: "14px" }}
          >
            <div className="flex items-center gap-3 mb-3">
              <motion.div
                animate={{ rotate: [0, -10, 10, -6, 6, 0] }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{ fontSize: "1.6rem", lineHeight: 1 }}
              >
                🎉
              </motion.div>
              <div>
                <p className="mb-0 font-bold text-emerald-700" style={{ fontSize: "0.78rem" }}>Your order arrived!</p>
                <p className="mb-0 text-emerald-600" style={{ fontSize: "0.62rem" }}>Hope you enjoy every bite.</p>
              </div>
            </div>

            {/* Star rating */}
            <p className="mb-1.5 font-semibold text-emerald-700" style={{ fontSize: "0.62rem" }}>
              {givenRating ? `You rated ${givenRating} star${givenRating > 1 ? "s" : ""} — thank you!` : "Rate your experience"}
            </p>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  type="button"
                  whileTap={{ scale: 0.85 }}
                  onMouseEnter={() => !givenRating && setHoveredStar(star)}
                  onMouseLeave={() => !givenRating && setHoveredStar(0)}
                  onClick={() => !givenRating && handleRate(star)}
                  style={{ background: "none", border: "none", padding: 0, cursor: givenRating ? "default" : "pointer", fontSize: "1.3rem", lineHeight: 1 }}
                >
                  <MdStar style={{ color: star <= (givenRating || hoveredStar) ? "#f59e0b" : "#d1d5db", transition: "color 0.15s ease" }} />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Live map placeholder ── */}
      <div className="shrink-0 overflow-hidden bg-white shadow-sm" style={{ borderRadius: "16px", border: "1px solid #fed7aa" }}>
        <div className="relative flex items-center justify-center" style={{ height: "90px", background: "linear-gradient(135deg,#fff7ed 0%,#ffedd5 100%)" }}>
          {[20, 40, 60, 80].map((p) => (
            <React.Fragment key={p}>
              <div style={{ position: "absolute", left: `${p}%`, top: 0, bottom: 0, width: "1px", background: "#fed7aa55" }} />
              <div style={{ position: "absolute", top: `${p}%`, left: 0, right: 0, height: "1px", background: "#fed7aa55" }} />
            </React.Fragment>
          ))}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 90" preserveAspectRatio="none">
            <path d="M20 70 Q60 20 100 45 Q140 70 180 25" stroke="#ea580c" strokeWidth="2" strokeDasharray="5 3" fill="none" opacity="0.6" />
          </svg>
          <div style={{ position: "absolute", right: "18%", top: "18%", color: "#ea580c", fontSize: "1.3rem" }}>
            <MdLocationOn />
          </div>
          <motion.div
            animate={delivered ? { scale: [1, 1.3, 1] } : { x: [0, 6, 0] }}
            transition={delivered ? { duration: 0.5 } : { repeat: Infinity, duration: 2, ease: "easeInOut" }}
            style={{ position: "absolute", left: delivered ? "76%" : "52%", top: delivered ? "14%" : "44%", width: "22px", height: "22px", borderRadius: "50%", background: delivered ? "#10b981" : "#ea580c", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 2px 8px ${delivered ? "rgba(16,185,129,0.45)" : "rgba(234,88,12,0.45)"}`, transition: "left 0.6s ease, top 0.6s ease, background 0.4s ease" }}
          >
            {delivered
              ? <MdCheckCircle style={{ color: "#fff", fontSize: "0.8rem" }} />
              : <MdDeliveryDining style={{ color: "#fff", fontSize: "0.8rem" }} />}
          </motion.div>
          <div style={{ position: "absolute", bottom: "8px", left: "14px", background: "rgba(255,255,255,0.85)", borderRadius: "8px", padding: "2px 8px", fontSize: "0.58rem", fontWeight: 600, color: delivered ? "#059669" : "#ea580c", backdropFilter: "blur(4px)" }}>
            {delivered ? "Arrived at destination" : "Live tracking"}
          </div>
        </div>
      </div>

      {/* ── Rider info ── */}
      <div className="shrink-0 bg-white shadow-sm" style={{ borderRadius: "16px", border: "1px solid #fed7aa", padding: "14px" }}>
        <div className="mb-2 flex items-center gap-1.5">
          <MdPerson className="text-orange-500" style={{ fontSize: "0.9rem" }} />
          <p className="mb-0 font-bold text-gray-700" style={{ fontSize: "0.68rem" }}>Your rider</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-orange-100" style={{ borderRadius: "12px" }}>
            <MdPerson className="text-orange-500" style={{ fontSize: "1.3rem" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="mb-0 font-bold text-gray-800" style={{ fontSize: "0.75rem" }}>{RIDER.name}</p>
            <p className="mb-0 text-gray-400 truncate" style={{ fontSize: "0.6rem" }}>{RIDER.vehicle}</p>
          </div>
          <div className="flex flex-col items-end gap-0.5 shrink-0">
            <span className="flex items-center gap-0.5 font-bold text-amber-500" style={{ fontSize: "0.68rem" }}>
              <MdStar style={{ fontSize: "0.75rem" }} />{RIDER.rating}
            </span>
            <span className="text-gray-400" style={{ fontSize: "0.58rem" }}>{RIDER.trips} trips</span>
          </div>
        </div>
      </div>

      {/* ── Step timeline ── */}
      <div className="shrink-0 bg-white shadow-sm" style={{ borderRadius: "16px", border: "1px solid #fed7aa", padding: "14px" }}>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <MdAccessTime className="text-orange-500" style={{ fontSize: "0.9rem" }} />
            <p className="mb-0 font-bold text-gray-700" style={{ fontSize: "0.68rem" }}>Status updates</p>
          </div>
          <span className="flex items-center gap-1" style={{ borderRadius: "20px", background: delivered ? "#ecfdf5" : "#fff7ed", border: `1px solid ${delivered ? "#a7f3d0" : "#fed7aa"}`, padding: "2px 8px", fontSize: "0.58rem", fontWeight: 600, color: delivered ? "#059669" : "#ea580c" }}>
            {delivered ? "✓ Complete" : (
              <><span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-500" style={{ animation: "pulse 1.5s infinite" }} /> Live</>
            )}
          </span>
        </div>

        <div className="flex flex-col">
          {steps.map((step, i) => {
            const Icon = STEP_ICONS[i] || MdDoneAll;
            const done = i < currentStep;
            const current = i === currentStep;
            const pending = i > currentStep;
            return (
              <div key={step.title} className="relative flex gap-3">
                {i < steps.length - 1 && (
                  <div style={{ position: "absolute", left: "15px", top: "32px", width: "2px", height: "calc(100% - 8px)", background: done ? "linear-gradient(to bottom,#ea580c,#fb923c)" : "#f3f4f6", borderRadius: "2px", transition: "background 0.4s ease" }} />
                )}
                <div className="relative z-10 shrink-0 flex flex-col items-center" style={{ paddingBottom: i < steps.length - 1 ? "16px" : "0" }}>
                  <motion.div
                    animate={current && !delivered ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                    transition={current && !delivered ? { repeat: Infinity, duration: 1.8, ease: "easeInOut" } : {}}
                    style={{ width: "30px", height: "30px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", flexShrink: 0, background: done || (current && delivered) ? "linear-gradient(135deg,#ea580c,#f97316)" : current ? "linear-gradient(135deg,#ea580c,#fb923c)" : "#f9fafb", border: pending ? "2px solid #e5e7eb" : "none", boxShadow: current && !delivered ? "0 0 0 4px rgba(234,88,12,0.15), 0 2px 8px rgba(234,88,12,0.3)" : done ? "0 2px 6px rgba(234,88,12,0.25)" : "none", color: pending ? "#d1d5db" : "#fff", transition: "all 0.3s ease" }}
                  >
                    {(done || (current && delivered)) ? <MdCheckCircle style={{ fontSize: "1rem" }} /> : <Icon />}
                  </motion.div>
                </div>

                <div className="flex-1 min-w-0" style={{ paddingBottom: i < steps.length - 1 ? "16px" : "0" }}>
                  <motion.div
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.22 }}
                    style={{ borderRadius: "12px", padding: "10px 12px", background: current ? "#fff7ed" : done ? "#fafafa" : "#f9fafb", border: current ? "1.5px solid #fed7aa" : done ? "1px solid #f3f4f6" : "1px dashed #e5e7eb", opacity: pending ? 0.5 : 1, transition: "all 0.3s ease" }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="mb-0 font-bold" style={{ fontSize: "0.72rem", color: pending ? "#9ca3af" : current ? "#1f2937" : "#374151", lineHeight: 1.2 }}>
                          {step.title}
                        </p>
                        {current && !delivered && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", marginTop: "3px", fontSize: "0.55rem", fontWeight: 700, color: "#ea580c", background: "#ffedd5", borderRadius: "20px", padding: "1px 6px" }}>
                            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#ea580c", display: "inline-block", animation: "pulse 1.2s infinite" }} />
                            In progress
                          </span>
                        )}
                        {(done || (current && delivered)) && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", marginTop: "3px", fontSize: "0.55rem", fontWeight: 700, color: "#059669", background: "#ecfdf5", borderRadius: "20px", padding: "1px 6px" }}>
                            ✓ Done
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: "0.6rem", fontWeight: 700, color: pending ? "#d1d5db" : current ? "#ea580c" : "#6b7280", whiteSpace: "nowrap", flexShrink: 0 }}>
                        {step.eta}
                      </span>
                    </div>
                    <p className="mb-0 leading-relaxed" style={{ fontSize: "0.62rem", color: pending ? "#d1d5db" : "#9ca3af", marginTop: "5px" }}>
                      {step.detail}
                    </p>
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Order items ── */}
      <div className="shrink-0 bg-white shadow-sm" style={{ borderRadius: "16px", border: "1px solid #fed7aa", padding: "14px" }}>
        <div className="mb-2 flex items-center gap-1.5">
          <MdReceipt className="text-orange-500" style={{ fontSize: "0.9rem" }} />
          <p className="mb-0 font-bold text-gray-700" style={{ fontSize: "0.68rem" }}>Your items</p>
        </div>
        <div className="flex flex-col" style={{ gap: "6px" }}>
          {ORDER_ITEMS.map((item) => (
            <div key={item.name} className="flex items-center justify-between" style={{ borderRadius: "10px", background: "#fff7ed", border: "1px solid #fed7aa", padding: "8px 10px" }}>
              <div className="flex items-center gap-2 min-w-0">
                <MdLocalFireDepartment className="shrink-0 text-orange-400" style={{ fontSize: "0.8rem" }} />
                <p className="mb-0 truncate text-gray-700" style={{ fontSize: "0.65rem", fontWeight: 600 }}>{item.name}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className="text-gray-400" style={{ fontSize: "0.6rem" }}>×{item.qty}</span>
                <span className="font-bold text-orange-500" style={{ fontSize: "0.65rem" }}>{item.price}</span>
              </div>
            </div>
          ))}
          <div className="flex justify-between pt-1" style={{ borderTop: "1px dashed #fed7aa", marginTop: "2px" }}>
            <span className="text-gray-500" style={{ fontSize: "0.62rem", fontWeight: 600 }}>Total</span>
            <span className="font-bold text-gray-800" style={{ fontSize: "0.68rem" }}>₹1,207</span>
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="shrink-0 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => toast.info("Call rider feature can be linked to your delivery provider.", { position: "bottom-left" })}
          className="inline-flex items-center justify-center gap-1.5 bg-white font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50"
          style={{ borderRadius: "12px", border: "1px solid #e5e7eb", padding: "10px 0", fontSize: "0.72rem" }}
        >
          <MdCall className="text-orange-500" style={{ fontSize: "0.9rem" }} /> Call rider
        </button>
        <AnimatePresence mode="wait">
          {delivered ? (
            <motion.div
              key="delivered-badge"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="inline-flex items-center justify-center gap-1.5 font-semibold"
              style={{ borderRadius: "12px", background: "#ecfdf5", border: "1.5px solid #6ee7b7", padding: "10px 0", fontSize: "0.72rem", color: "#059669" }}
            >
              <MdCheckCircle style={{ fontSize: "0.9rem" }} /> Delivered
            </motion.div>
          ) : (
            <motion.button
              key="advance-btn"
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={onAdvance}
              className="inline-flex items-center justify-center font-semibold text-white shadow-sm transition hover:-translate-y-0.5"
              style={{ borderRadius: "12px", background: "#ea580c", padding: "10px 0", fontSize: "0.72rem" }}
            >
              Advance status
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OrderTracker;
