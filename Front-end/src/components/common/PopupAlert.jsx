import React from "react";
import { IoCheckmarkCircle, IoClose } from "react-icons/io5";
import "./PopupAlert.css";

export function PopupAlert({ visible, text, onClose }) {
  React.useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  return (
    <div
      className={`popup-alert-wrapper ${visible ? "show" : ""}`}
      onClick={onClose}
    >
      <div className="popup-alert-box" onClick={(e) => e.stopPropagation()}>
        <div className="popup-alert-icon">
          <IoCheckmarkCircle />
        </div>
        <div className="popup-alert-content">
          <p>{text}</p>
        </div>
        <button
          className="popup-alert-close"
          onClick={onClose}
          aria-label="Close popup"
        >
          <IoClose />
        </button>
      </div>
    </div>
  );
}
