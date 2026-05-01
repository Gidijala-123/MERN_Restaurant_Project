import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import LoadingOverlay from "../common/LoadingOverlay";

export default function AdminRoute({ children }) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const check = async () => {
      try {
        const base = (
          import.meta.env.VITE_API_URL || 
          (window.location.hostname === "localhost" ? "http://localhost:1111" : window.location.origin)
        ).replace(/\/$/, "");
        const res = await fetch(base + "/api/auth/me", { credentials: "include" });
        if (!res.ok) return setStatus("fail");
        const me = await res.json();
        if (me?.role === "admin") setStatus("ok");
        else setStatus("fail");
      } catch {
        setStatus("fail");
      }
    };
    check();
  }, []);

  if (status === "loading") return <LoadingOverlay message="Checking permissions..." />;
  if (status !== "ok") return <Navigate to="/home" replace />;
  return children;
}
