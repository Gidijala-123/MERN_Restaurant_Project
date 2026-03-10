import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(
          (import.meta.env.VITE_API_URL || "http://localhost:1111") +
            "/api/auth/me",
          { credentials: "include" }
        );
        if (res.ok) setStatus("ok");
        else {
          await fetch(
            (import.meta.env.VITE_API_URL || "http://localhost:1111") +
              "/api/auth/refresh",
            { credentials: "include" }
          );
          const res2 = await fetch(
            (import.meta.env.VITE_API_URL || "http://localhost:1111") +
              "/api/auth/me",
            { credentials: "include" }
          );
          setStatus(res2.ok ? "ok" : "fail");
        }
      } catch {
        setStatus("fail");
      }
    };
    check();
  }, []);

  if (status === "loading")
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "60vh" }}>
        <div>Loading...</div>
      </div>
    );
  if (status !== "ok") return <Navigate to="/" replace />;
  return children;
}
