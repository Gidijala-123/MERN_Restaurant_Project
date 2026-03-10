import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const check = async () => {
      try {
        const base = import.meta.env.VITE_API_URL || "http://localhost:1111";
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

  if (status === "loading")
    return <div style={{ display: "grid", placeItems: "center", minHeight: "60vh" }}>Loading...</div>;
  if (status !== "ok") return <Navigate to="/home" replace />;
  return children;
}
