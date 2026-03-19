import React from "react";
import { IoCheckmarkCircle, IoClose, IoInformationCircle, IoWarning, IoSync } from "react-icons/io5";
import "./PopupAlert.css";

export function PopupAlert({ visible, text, onClose, type = "success" }) {
  React.useEffect(() => {
    if (visible && type !== "loading") {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose, type]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <IoCheckmarkCircle className="popup-icon-svg success" />;
      case "error":
        return <IoWarning className="popup-icon-svg error" />;
      case "loading":
        return <IoSync className="popup-icon-svg loading-spin" />;
      case "info":
      default:
        return <IoInformationCircle className="popup-icon-svg info" />;
    }
  };

  return (
    <div
      className={`popup-alert-wrapper ${visible ? "show" : ""} ${type}`}
      onClick={type !== "loading" ? onClose : undefined}
    >
      <div className={`popup-alert-box ${type}`} onClick={(e) => e.stopPropagation()}>
        <div className="popup-alert-icon-container">
          {getIcon()}
        </div>
        <div className="popup-alert-content">
          <p className="popup-text">{text}</p>
        </div>
        {type !== "loading" && (
          <button
            className="popup-alert-close"
            onClick={onClose}
            aria-label="Close popup"
          >
            <IoClose />
          </button>
        )}
        <div className="popup-progress-bar"></div>
      </div>
    </div>
  );
}
