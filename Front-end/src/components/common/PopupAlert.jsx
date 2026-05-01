import React from "react";
import { IoCheckmarkCircle, IoClose, IoInformationCircle, IoWarning, IoSync, IoRestaurant } from "react-icons/io5";
import "./PopupAlert.css";
import useSound from "../../hooks/useSound";

export function PopupAlert({ visible, text, onClose, type = "success" }) {
  const { playSound } = useSound();

  React.useEffect(() => {
    if (visible) {
      if (type === "success") playSound("success");
      else if (type === "error") playSound("error");
      else if (type === "info") playSound("pop");

      if (type !== "loading") {
        const timer = setTimeout(() => {
          onClose();
        }, 4000);
        return () => clearTimeout(timer);
      }
    }
  }, [visible, onClose, type, playSound]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <IoCheckmarkCircle className="popup-icon-svg success" />;
      case "error":
        return <IoWarning className="popup-icon-svg error" />;
      case "loading":
        return (
          <div className="popup-loading-container">
            <IoRestaurant className="popup-icon-svg loading-themed" />
            <div className="loading-ring"></div>
          </div>
        );
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
