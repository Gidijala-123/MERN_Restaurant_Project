import React from "react";
import { motion } from "framer-motion";
import { MdCall, MdDeliveryDining, MdDoneAll, MdRestaurant } from "react-icons/md";
import { toast } from "react-toastify";

const STEP_ICONS = [MdRestaurant, MdDeliveryDining, MdDoneAll];

const OrderTracker = ({ currentStep, steps, onAdvance }) => (
  <div className="flex h-full flex-col gap-2.5 overflow-hidden">

    {/* Summary */}
    <div className="shrink-0 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[0.58rem] font-bold uppercase tracking-widest text-orange-500">Order #FLV-2048</p>
          <p className="mt-0.5 text-sm font-bold text-gray-800">
            {currentStep === 0 ? "Being prepared" : currentStep === 1 ? "Rider is nearby" : "Delivered!"}
          </p>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[0.62rem] font-semibold text-emerald-600">
          ETA {steps[currentStep]?.eta}
        </span>
      </div>
      <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-orange-100">
        <motion.div
          className="h-full rounded-full bg-orange-500"
          initial={{ width: "0%" }}
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[0.55rem] text-gray-400">
        <span>Placed</span><span>Delivered</span>
      </div>
    </div>

    {/* Steps */}
    <div className="flavie-scroll flex-1 overflow-y-auto rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
      {steps.map((step, i) => {
        const Icon = STEP_ICONS[i] || MdDoneAll;
        const done = i <= currentStep;
        const current = i === currentStep;
        return (
          <div key={step.title} className="relative flex gap-2.5 pb-4 last:pb-0">
            {i < steps.length - 1 && (
              <div className={`absolute left-[0.84rem] top-7 h-[calc(100%-0.25rem)] w-px ${done ? "flavie-step-line" : "bg-orange-100"}`} />
            )}
            <motion.div
              animate={current ? { scale: [1, 1.15, 1] } : { scale: 1 }}
              transition={current ? { repeat: Infinity, duration: 2 } : {}}
              className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs ${done
                ? "border-orange-300 bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-sm shadow-orange-300/40"
                : "border-orange-100 bg-white text-gray-300"
                }`}
            >
              <Icon />
            </motion.div>
            <div className={`flex-1 rounded-lg border px-2.5 py-2 ${current ? "border-orange-200 bg-orange-50" : "border-orange-50 bg-white"}`}>
              <div className="flex items-center justify-between gap-2">
                <p className={`text-xs font-semibold ${done ? "text-gray-800" : "text-gray-300"}`}>{step.title}</p>
                <span className={`text-[0.56rem] font-semibold ${done ? "text-orange-500" : "text-gray-300"}`}>{step.eta}</span>
              </div>
              <p className="mt-0.5 text-[0.6rem] leading-4 text-gray-400">{step.detail}</p>
            </div>
          </div>
        );
      })}
    </div>

    {/* Actions */}
    <div className="shrink-0 grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() => toast.info("Call rider feature can be linked to your delivery provider.", { position: "bottom-left" })}
        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50"
      >
        <MdCall className="text-sm text-orange-500" /> Call rider
      </button>
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={onAdvance}
        disabled={currentStep >= steps.length - 1}
        className="inline-flex items-center justify-center rounded-xl bg-orange-500 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Advance status
      </motion.button>
    </div>
  </div>
);

export default OrderTracker;
