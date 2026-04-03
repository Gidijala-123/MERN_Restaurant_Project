import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";

export default function LoadingOverlay({ message = "Loading…", showText = false }) {
  const [ready, setReady] = useState(false);
  const { theme } = useTheme();
  const videoSrc = theme === "dark" ? "/footer-images/loading_dark.mp4" : "/footer-images/loading.mp4";

  return (
    <div className="app-loading" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'rgba(252, 245, 232, 0.9)',
      zIndex: 9990,
      backdropFilter: 'blur(5px)'
    }}>
      <video
        className="app-loading__media"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onCanPlay={() => setReady(true)}
        style={{ width: '160px', height: '160px' }}
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
      {showText && ready && (
        <div className="app-loading__text" style={{
          marginTop: '20px',
          fontWeight: 700,
          color: 'var(--primary)',
          fontSize: '1.2rem'
        }}>{message}</div>
      )}
    </div>
  );
}
