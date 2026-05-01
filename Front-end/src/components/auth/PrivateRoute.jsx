import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import LoadingOverlay from "../common/LoadingOverlay";

export default function PrivateRoute({ children }) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const check = async () => {
      try {
        const base = (
          import.meta.env.VITE_API_URL || 
          (window.location.hostname === "localhost" ? "http://localhost:1111" : window.location.origin)
        ).replace(/\/$/, "");

        const res = await fetch(base + "/api/auth/me", {
          credentials: "include",
        });
        const data = await res.json().catch(() => null);

        // Server now returns authenticated=false instead of 401 when the token is missing/expired.
        if (res.ok && data?.authenticated !== false && data?.uname) {
          // If we have a username from the server, ensure it's in localStorage
          localStorage.setItem("userName", data.uname);
          if (data.avatar) localStorage.setItem("userAvatar", data.avatar);
          setStatus("ok");
          return;
        }

        // Quick client-side marker check as a fallback
        if (!localStorage.getItem("userName")) {
          setStatus("fail");
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
        if (res2.ok && data2?.authenticated !== false && data2?.uname) {
          localStorage.setItem("userName", data2.uname);
          if (data2.avatar) localStorage.setItem("userAvatar", data2.avatar);
          setStatus("ok");
        } else {
          setStatus("fail");
        }
      } catch {
        setStatus("fail");
      }
    };
    check();
  }, []);

  if (status === "loading") return <LoadingOverlay message="Checking authentication..." />;
  if (status !== "ok") return <Navigate to="/" replace />;
  return children;
}
