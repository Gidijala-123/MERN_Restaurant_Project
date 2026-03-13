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
        const data = await res.json().catch(() => null);

        // Server now returns authenticated=false instead of 401 when the token is missing/expired.
        if (res.ok && data?.authenticated !== false) {
          setStatus("ok");
          return;
        }

        // Attempt to refresh token if the session is stale
        const resRefresh = await fetch(base + "/api/auth/refresh", {
          credentials: "include",
        });
        if (!resRefresh.ok) {
          setStatus("fail");
          return;
        }

        const res2 = await fetch(base + "/api/auth/me", {
          credentials: "include",
        });
        const data2 = await res2.json().catch(() => null);
        setStatus(res2.ok && data2?.authenticated !== false ? "ok" : "fail");
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
