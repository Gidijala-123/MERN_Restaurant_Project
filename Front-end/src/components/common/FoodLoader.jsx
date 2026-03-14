import React from "react";

/**
 * Simple animated SVG loader (plate + steam) for use across the UI.
 * This is lightweight and doesn't require external assets.
 */
export default function FoodLoader({ size = 160 }) {
  return (
    <div className="food-loader" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="plateGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF8C00" />
            <stop offset="100%" stopColor="#FFB74D" />
          </linearGradient>
        </defs>

        {/* Plate */}
        <circle className="plate" cx="60" cy="70" r="38" fill="url(#plateGrad)" />
        <ellipse className="plate-shadow" cx="60" cy="78" rx="40" ry="8" fill="rgba(0,0,0,0.12)" />

        {/* Food */}
        <circle className="food" cx="60" cy="60" r="18" fill="#FFEB3B" />

        {/* Steam */}
        <path
          className="steam"
          d="M44 38c4-6 10-6 10 0s-6 10-10 12s-10 0-10-6s6-10 10-6"
          stroke="#fff"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        <path
          className="steam"
          d="M70 34c4-6 10-6 10 0s-6 10-10 12s-10 0-10-6s6-10 10-6"
          stroke="#fff"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
