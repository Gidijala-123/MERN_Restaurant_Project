import { useEffect, useState } from "react";

export default function AdminMetrics() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    const base = import.meta.env.VITE_API_URL || "http://localhost:1111";
    fetch(base + "/api/admin/metrics", { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) throw new Error("Forbidden or unauthorized");
        setData(await r.json());
      })
      .catch((e) => setErr(e.message));
  }, []);

  if (err) return <div style={{ padding: 24 }}>Error: {err}</div>;
  if (!data) return <div style={{ padding: 24 }}>Loading metrics...</div>;
  return (
    <div style={{ padding: 24 }}>
      <h2>Server Metrics</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
