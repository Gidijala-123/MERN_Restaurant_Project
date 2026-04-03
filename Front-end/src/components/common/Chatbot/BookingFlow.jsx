import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MdCheckCircle, MdChevronLeft, MdChevronRight,
  MdPeople, MdEventSeat, MdAccessTime,
} from "react-icons/md";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const TIME_SLOTS = ["6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM"];
const GUEST_OPTIONS = [1, 2, 3, 4, 5, 6];

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const BookingFlow = ({ selectedDate, selectedTime, bookingConfirmed, onDateChange, onTimeChange, onConfirm }) => {
  const [displayMonth, setDisplayMonth] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  );
  const [guests, setGuests] = useState(2);
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);

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
  const monthLabel = displayMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <div className="flavie-scroll flex h-full flex-col gap-3 overflow-y-auto pb-1">

      {/* ── Calendar card ── */}
      <div className="shrink-0 bg-white shadow-sm" style={{ borderRadius: "16px", border: "1px solid #fed7aa", padding: "14px" }}>

        {/* Month nav */}
        <div className="mb-2 flex items-center justify-between">
          <p className="mb-0 text-sm font-bold text-gray-800">{monthLabel}</p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1, 1))}
              className="flex h-7 w-7 items-center justify-center bg-orange-50 text-orange-500 transition hover:bg-orange-100"
              style={{ borderRadius: "8px", border: "1px solid #fed7aa" }}
              aria-label="Previous month"
            >
              <MdChevronLeft />
            </button>
            <button
              type="button"
              onClick={() => setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1))}
              className="flex h-7 w-7 items-center justify-center bg-orange-50 text-orange-500 transition hover:bg-orange-100"
              style={{ borderRadius: "8px", border: "1px solid #fed7aa" }}
              aria-label="Next month"
            >
              <MdChevronRight />
            </button>
          </div>
        </div>

        {/* Availability badge */}
        <div className="mb-3 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600"
          style={{ borderRadius: "20px", border: "1px solid #a7f3d0", padding: "3px 10px", fontSize: "0.6rem", fontWeight: 600 }}>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Dining room available
        </div>

        {/* Day headers */}
        <div className="mb-1 grid grid-cols-7 text-center" style={{ gap: "2px" }}>
          {DAYS.map((d) => (
            <span key={d} className="mb-0 font-bold text-gray-400" style={{ fontSize: "0.55rem", letterSpacing: "0.05em" }}>{d}</span>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7" style={{ gap: "3px" }}>
          {calendarDays.map((day) => {
            const disabled = startOfDay(day) < today;
            const selected = isSameDay(day, selectedDate);
            const inMonth = day.getMonth() === displayMonth.getMonth();
            const isToday = isSameDay(day, today);
            return (
              <button
                key={day.toISOString()}
                type="button"
                disabled={disabled}
                onClick={() => onDateChange(day)}
                className="transition"
                style={{
                  borderRadius: "8px",
                  padding: "6px 0",
                  fontSize: "0.65rem",
                  fontWeight: selected ? 700 : 500,
                  background: selected ? "#ea580c" : isToday && !selected ? "#fff7ed" : inMonth ? "#ffffff" : "transparent",
                  color: selected ? "#ffffff" : isToday && !selected ? "#ea580c" : inMonth ? "#374151" : "#d1d5db",
                  border: selected ? "none" : isToday && !selected ? "1.5px solid #ea580c" : inMonth ? "1px solid #f3f4f6" : "none",
                  cursor: disabled ? "not-allowed" : "pointer",
                  opacity: disabled ? 0.3 : 1,
                }}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Guest count ── */}
      <div className="shrink-0 bg-white shadow-sm" style={{ borderRadius: "16px", border: "1px solid #fed7aa", padding: "14px" }}>
        <div className="mb-2 flex items-center gap-2">
          <MdPeople className="text-orange-500" style={{ fontSize: "1rem" }} />
          <p className="mb-0 text-xs font-bold text-gray-800">Number of guests</p>
        </div>
        <div className="grid grid-cols-6" style={{ gap: "6px" }}>
          {GUEST_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setGuests(n)}
              className="transition"
              style={{
                borderRadius: "8px",
                padding: "7px 0",
                fontSize: "0.7rem",
                fontWeight: 600,
                background: guests === n ? "#ea580c" : "#fff7ed",
                color: guests === n ? "#ffffff" : "#ea580c",
                border: guests === n ? "none" : "1px solid #fed7aa",
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* ── Time slots ── */}
      <div className="shrink-0 bg-white shadow-sm" style={{ borderRadius: "16px", border: "1px solid #fed7aa", padding: "14px" }}>
        <div className="mb-2 flex items-center gap-2">
          <MdAccessTime className="text-orange-500" style={{ fontSize: "1rem" }} />
          <p className="mb-0 text-xs font-bold text-gray-800">Pick a time</p>
        </div>
        <div className="grid grid-cols-3" style={{ gap: "8px" }}>
          {TIME_SLOTS.map((slot) => (
            <motion.button
              key={slot}
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => onTimeChange(slot)}
              style={{
                borderRadius: "10px",
                padding: "9px 0",
                fontSize: "0.68rem",
                fontWeight: 600,
                background: slot === selectedTime ? "#ea580c" : "#ffffff",
                color: slot === selectedTime ? "#ffffff" : "#374151",
                border: slot === selectedTime ? "none" : "1px solid #e5e7eb",
                boxShadow: slot === selectedTime ? "0 2px 8px rgba(234,88,12,0.3)" : "none",
              }}
            >
              {slot}
            </motion.button>
          ))}
        </div>

        {/* Booking summary */}
        <div className="mt-3" style={{ borderRadius: "10px", background: "#fff7ed", border: "1px solid #fed7aa", padding: "10px 12px" }}>
          <div className="flex items-center gap-2">
            <MdEventSeat className="text-orange-400" style={{ fontSize: "0.9rem" }} />
            <p className="mb-0 text-gray-700" style={{ fontSize: "0.68rem", fontWeight: 600 }}>
              {selectedDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
              {" at "}{selectedTime} · {guests} guest{guests > 1 ? "s" : ""}
            </p>
          </div>
          <p className="mb-0 text-gray-400" style={{ fontSize: "0.6rem", marginTop: "3px" }}>Window seating prioritized when available.</p>
        </div>

        {/* Special request toggle */}
        <button
          type="button"
          onClick={() => setShowNote((v) => !v)}
          className="mt-2.5 w-full text-orange-500 transition hover:text-orange-600"
          style={{ fontSize: "0.65rem", fontWeight: 600, background: "none", border: "none", textAlign: "left", padding: 0 }}
        >
          {showNote ? "− Hide special request" : "+ Add special request"}
        </button>

        <AnimatePresence>
          {showNote && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="E.g. window seat, birthday celebration, allergies…"
                rows={2}
                className="mt-2 w-full resize-none text-gray-700 outline-none placeholder:text-gray-400"
                style={{ borderRadius: "10px", border: "1px solid #fed7aa", padding: "8px 10px", fontSize: "0.68rem", background: "#fffbf7" }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirm button */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={onConfirm}
          disabled={bookingConfirmed}
          className="mt-3 w-full font-bold text-white shadow-md transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55"
          style={{ borderRadius: "12px", padding: "11px 0", fontSize: "0.8rem", background: bookingConfirmed ? "#9ca3af" : "#ea580c" }}
        >
          {bookingConfirmed ? "✓ Reservation confirmed" : "Confirm booking"}
        </motion.button>

        <AnimatePresence>
          {bookingConfirmed && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2.5 flex items-start gap-2"
              style={{ borderRadius: "10px", border: "1px solid #a7f3d0", background: "#ecfdf5", padding: "10px 12px" }}
            >
              <MdCheckCircle className="shrink-0 text-emerald-500" style={{ fontSize: "1rem", marginTop: "1px" }} />
              <p className="mb-0 text-emerald-700" style={{ fontSize: "0.65rem", lineHeight: 1.4 }}>
                Your table for <strong>{guests}</strong> is reserved on{" "}
                <strong>{selectedDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} at {selectedTime}</strong>.
                {note && <> Special note: <em>{note}</em>.</>}
                {" "}Flavie will send a reminder before your visit.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BookingFlow;
