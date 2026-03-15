import { useState } from "react";

export default function LoadingOverlay({ message = "Loading…", showText = false }) {
  const [ready, setReady] = useState(false);

  return (
    <div className="app-loading">
      <video
        className="app-loading__media"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onCanPlay={() => setReady(true)}
      >
        <source src="/footer-images/loading.mp4" type="video/mp4" />
      </video>
      {showText && ready && (
        <div className="app-loading__text">{message}</div>
      )}
    </div>
  );
}
