import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MdCheckCircle, MdChevronLeft, MdChevronRight } from "react-icons/md";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const TIME_SLOTS = ["6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM"];

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const BookingFlow = ({ selectedDate, selectedTime, bookingConfirmed, onDateChange, onTimeChange, onConfirm }) => {
  const [displayMonth, setDisplayMonth] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  );

  const calendarDays = useMemo(() => {
    const first = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), 1);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [displayMonth]);

  const today = startOfDay(new Date());
  const monthLabel = displayMonth.toLocaleDateString("en-IN", { month: "short", year: "numeric" });

  return (
    <div className="flavie-scroll flex h-full flex-col gap-2.5 overflow-y-auto pb-0.5">

      {/* Calendar */}
      <div className="shrink-0 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-700">{monthLabel}</p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1, 1))}
              className="flex h-6 w-6 items-center justify-center rounded-lg border border-orange-200 bg-white text-gray-500 transition hover:bg-orange-50"
              aria-label="Previous month"
            >
              <MdChevronLeft className="text-sm" />
            </button>
            <button
              type="button"
              onClick={() => setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1))}
              className="flex h-6 w-6 items-center justify-center rounded-lg border border-orange-200 bg-white text-gray-500 transition hover:bg-orange-50"
              aria-label="Next month"
            >
              <MdChevronRight className="text-sm" />
            </button>
          </div>
        </div>

        <div className="mb-2 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[0.56rem] font-semibold text-emerald-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Dining room available
        </div>

        <div className="grid grid-cols-7 gap-0.5 text-center text-[0.52rem] font-bold uppercase tracking-widest text-gray-400">
          {DAYS.map((d) => <span key={d}>{d}</span>)}
        </div>

        <div className="mt-1.5 grid grid-cols-7 gap-0.5">
          {calendarDays.map((day) => {
            const disabled = startOfDay(day) < today;
            const selected = isSameDay(day, selectedDate);
            const inMonth = day.getMonth() === displayMonth.getMonth();
            return (
              <button
                key={day.toISOString()}
                type="button"
                disabled={disabled}
                onClick={() => onDateChange(day)}
                className={`rounded-lg py-1.5 text-[0.62rem] font-medium transition ${selected
                  ? "bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-sm shadow-orange-300/40"
                  : inMonth
                    ? "border border-orange-100 bg-white text-gray-600 hover:bg-orange-50"
                    : "text-gray-300"
                  } ${disabled ? "cursor-not-allowed opacity-30" : ""}`}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      <div className="shrink-0 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-700">Pick a time</p>
          <span className="text-[0.56rem] text-gray-400">2 guests default</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {TIME_SLOTS.map((slot) => (
            <motion.button
              key={slot}
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => onTimeChange(slot)}
              className={`rounded-lg border py-2 text-[0.62rem] font-semibold transition ${slot === selectedTime
                ? "border-orange-400 bg-orange-500 text-white shadow-sm shadow-orange-300/40"
                : "border-orange-100 bg-white text-gray-600 hover:bg-orange-50"
                }`}
            >
              {slot}
            </motion.button>
          ))}
        </div>

        <div className="mt-2.5 rounded-lg border border-orange-100 bg-white px-2.5 py-2 text-[0.62rem] text-gray-500">
          <span className="font-semibold text-gray-700">
            {selectedDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
            {" at "}{selectedTime}
          </span>
          {" · Window seating prioritized."}
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={onConfirm}
          disabled={bookingConfirmed}
          className="mt-2.5 w-full rounded-xl bg-orange-500 py-2.5 text-xs font-bold text-white shadow-md transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55"
        >
          {bookingConfirmed ? "Reservation confirmed ✓" : "Confirm booking"}
        </motion.button>

        <AnimatePresence>
          {bookingConfirmed && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 flex items-start gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-[0.62rem] text-emerald-700"
            >
              <MdCheckCircle className="mt-0.5 shrink-0 text-emerald-500 text-sm" />
              <span>Reservation queued. Flavie will hold your table and share updates here.</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BookingFlow;
