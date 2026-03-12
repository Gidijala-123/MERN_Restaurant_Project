import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    // quick client-side marker: if there's no stored user name (set on login),
    // don't even bother hitting the server – treat as unauthenticated.
    if (!localStorage.getItem("userName")) {
      setStatus("fail");
      return;
    }

    const check = async () => {
      try {
        const base = (
          import.meta.env.VITE_API_URL || "http://localhost:1111"
        ).replace(/\/$/, "");
        const res = await fetch(base + "/api/auth/me", {
          credentials: "include",
        });
        if (res.ok) {
          setStatus("ok");
        } else {
          const resRefresh = await fetch(base + "/api/auth/refresh", {
            credentials: "include",
          });
          if (resRefresh.ok) {
            const res2 = await fetch(base + "/api/auth/me", {
              credentials: "include",
            });
            setStatus(res2.ok ? "ok" : "fail");
          } else {
            setStatus("fail");
          }
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
