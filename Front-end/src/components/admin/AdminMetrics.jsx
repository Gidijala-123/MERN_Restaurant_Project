import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, Legend,
} from "recharts";
import { toast } from "react-toastify";
import axios from "axios";
import "./AdminMetrics.css";

const API = (import.meta.env.VITE_API_URL || 
  (window.location.hostname === "localhost" ? "http://localhost:1111" : window.location.origin)
).replace(/\/$/, "");
const PRIMARY = "#4f46e5";

const PIE_COLORS = [
  "#4f46e5", "#7c3aed", "#6d28d9", "#8b5cf6", "#a78bfa",
  "#3730a3", "#4338ca", "#059669", "#0891b2", "#c084fc",
  "#fbbf24", "#f97316", "#dc2626",
];

const MENU_CATEGORIES = [
  "Hot Offers", "Veg Starters", "Non-Veg Starters", "Tandooris",
  "Soups", "Salads", "Sandwiches", "Signature Dishes", "Biryanis",
  "Main Course", "Rice & Breads", "South Indian", "Chinese/Indo-Chinese",
  "Beverages", "Cocktails/Mocktails", "Desserts",
];

const TABS = ["Overview", "Analytics", "Orders", "Menu", "Users", "Subscribers", "Activity", "Theme", "Settings"];

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_COLORS = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  preparing: "#8b5cf6",
  ready: "#06b6d4",
  delivered: "#059669",
  cancelled: "#dc2626",
};

const THEME_PRESETS = [
  "#4f46e5", "#7c3aed", "#059669", "#dc2626",
  "#f97316", "#0891b2", "#db2777", "#1d4ed8",
];

const EMPTY_MENU_FORM = {
  name: "", category: "", subCategory: "", price: "",
  calories: "", serves: 1, rating: 4.5, description: "",
  imageUrl: "", veg: true, availability: true, isHotOffer: false,
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const getCsrf = () =>
  fetch(`${API}/api/csrf`, { credentials: "include" })
    .then((r) => r.json())
    .catch(() => ({}));

// ── Sub-components ────────────────────────────────────────────────────────────

const StatCard = ({ label, value, icon, sub, color = PRIMARY }) => (
  <div className="adm-stat-card">
    <div className="adm-stat-icon" style={{ background: `${color}18`, color }}>{icon}</div>
    <div style={{ flex: 1 }}>
      <div className="adm-stat-value">{value}</div>
      <div className="adm-stat-label">{label}</div>
      {sub && <div className="adm-stat-sub">{sub}</div>}
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminMetrics() {
  const navigate = useNavigate();

  // ── State ──
  const [tab, setTab] = useState("Overview");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [analytics, setAnalytics] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [activityLog, setActivityLog] = useState([]);

  // Orders
  const [orders, setOrders] = useState([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersPage, setOrdersPage] = useState(1);
  const [orderFilter, setOrderFilter] = useState({ email: "", status: "" });

  // Menu
  const [menuForm, setMenuForm] = useState(null);
  const [menuSearch, setMenuSearch] = useState("");
  const [menuCatFilter, setMenuCatFilter] = useState("All");
  const [menuSortBy, setMenuSortBy] = useState("name");
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [previewImg, setPreviewImg] = useState("");
  const [bulkJson, setBulkJson] = useState("");
  const [bulkError, setBulkError] = useState("");
  const [bulkUploading, setBulkUploading] = useState(false);

  // Users
  const [userSearch, setUserSearch] = useState("");

  // Subscribers / Newsletter
  const [newsletter, setNewsletter] = useState({ subject: "", body: "" });
  const [sendingNewsletter, setSendingNewsletter] = useState(false);

  // Theme
  const [themeColor, setThemeColor] = useState(
    () => localStorage.getItem("adminThemeColor") || PRIMARY
  );

  // Settings
  const [announcement, setAnnouncement] = useState(
    () => localStorage.getItem("siteAnnouncement") || ""
  );
  const [revenueGoal, setRevenueGoal] = useState(
    () => Number(localStorage.getItem("revenueGoal")) || 50000
  );

  // ── Data loading ──

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const [aRes, mRes, uRes, subRes, actRes] = await Promise.all([
        fetch(`${API}/api/admin/analytics`, { credentials: "include" }),
        fetch(`${API}/api/menu?limit=200`, { credentials: "include" }),
        fetch(`${API}/api/admin/users`, { credentials: "include" }),
        fetch(`${API}/api/admin/subscribers`, { credentials: "include" }),
        fetch(`${API}/api/admin/activity`, { credentials: "include" }),
      ]);
      if (!aRes.ok) throw new Error("Unauthorized — admin access required");
      const [a, m, u, sub, act] = await Promise.all([
        aRes.json(), mRes.json(), uRes.json(), subRes.json(), actRes.json(),
      ]);
      setAnalytics(a.data);
      setMenuItems(m.data?.items || []);
      setUsers(u.data || []);
      setSubscribers(sub.data || []);
      setActivityLog(act.data || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async (page = 1) => {
    const params = new URLSearchParams({ page, limit: 20, ...orderFilter });
    try {
      const res = await fetch(`${API}/api/admin/orders?${params}`, { credentials: "include" });
      const data = await res.json();
      setOrders(data.data?.orders || []);
      setOrdersTotal(data.data?.total || 0);
      setOrdersPage(page);
    } catch {
      toast.error("Failed to load orders");
    }
  }, [orderFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (tab === "Orders") loadOrders(1); }, [tab, loadOrders]);

  // ── Mutations ──

  const applyTheme = (color) => {
    document.documentElement.style.setProperty("--primary", color);
    document.documentElement.style.setProperty(
      "--primary-gradient",
      `linear-gradient(135deg,${color} 0%,${color}cc 100%)`
    );
    localStorage.setItem("adminThemeColor", color);
    setThemeColor(color);
    toast.success("Theme applied!");
  };

  const saveMenuItem = async () => {
    if (!menuForm?.name || !menuForm?.price) {
      toast.error("Name and price required");
      return;
    }
    const csrfData = await getCsrf();
    const headers = {
      "Content-Type": "application/json",
      "x-csrf-token": csrfData?.csrfToken || "",
    };
    try {
      if (menuForm._id) {
        await axios.put(`${API}/api/admin/menu/${menuForm._id}`, menuForm, { withCredentials: true, headers });
        toast.success("Item updated!");
      } else {
        await axios.post(`${API}/api/admin/menu`, menuForm, { withCredentials: true, headers });
        toast.success("Item created!");
      }
      setMenuForm(null);
      setPreviewImg("");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Save failed");
    }
  };

  const deleteItem = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    const csrfData = await getCsrf();
    try {
      await axios.delete(`${API}/api/admin/menu/${id}`, {
        withCredentials: true,
        headers: { "x-csrf-token": csrfData?.csrfToken || "" },
      });
      toast.success("Deleted!");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  const toggleAvail = async (id) => {
    const csrfData = await getCsrf();
    try {
      await axios.patch(`${API}/api/admin/menu/${id}/toggle`, {}, {
        withCredentials: true,
        headers: { "x-csrf-token": csrfData?.csrfToken || "" },
      });
      load();
    } catch {
      toast.error("Toggle failed");
    }
  };

  const updateRole = async (id, role) => {
    const csrfData = await getCsrf();
    try {
      await axios.patch(`${API}/api/admin/users/${id}/role`, { role }, {
        withCredentials: true,
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfData?.csrfToken || "" },
      });
      toast.success(`Role updated to ${role}`);
      load();
    } catch {
      toast.error("Role update failed");
    }
  };

  const updateOrderStatus = async (id, status) => {
    const csrfData = await getCsrf();
    try {
      await axios.patch(`${API}/api/admin/orders/${id}/status`, { status }, {
        withCredentials: true,
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfData?.csrfToken || "" },
      });
      toast.success(`Order → ${STATUS_LABELS[status]}`);
      loadOrders(ordersPage);
    } catch {
      toast.error("Update failed");
    }
  };

  const deleteSubscriber = async (id) => {
    const csrfData = await getCsrf();
    try {
      await axios.delete(`${API}/api/admin/subscribers/${id}`, {
        withCredentials: true,
        headers: { "x-csrf-token": csrfData?.csrfToken || "" },
      });
      toast.success("Subscriber removed");
      load();
    } catch {
      toast.error("Failed");
    }
  };

  const bulkToggle = async () => {
    if (!selectedItems.size) { toast.info("Select items first"); return; }
    const csrfData = await getCsrf();
    await Promise.all([...selectedItems].map((id) =>
      axios.patch(`${API}/api/admin/menu/${id}/toggle`, {}, {
        withCredentials: true,
        headers: { "x-csrf-token": csrfData?.csrfToken || "" },
      })
    ));
    toast.success(`${selectedItems.size} items toggled`);
    setSelectedItems(new Set());
    load();
  };

  const bulkDelete = async () => {
    if (!selectedItems.size || !window.confirm(`Delete ${selectedItems.size} items?`)) return;
    const csrfData = await getCsrf();
    await Promise.all([...selectedItems].map((id) =>
      axios.delete(`${API}/api/admin/menu/${id}`, {
        withCredentials: true,
        headers: { "x-csrf-token": csrfData?.csrfToken || "" },
      })
    ));
    toast.success(`${selectedItems.size} deleted`);
    setSelectedItems(new Set());
    load();
  };

  const sendNewsletter = async () => {
    if (!newsletter.subject || !newsletter.body) {
      toast.error("Subject and body required");
      return;
    }
    setSendingNewsletter(true);
    const csrfData = await getCsrf();
    try {
      await axios.post(`${API}/api/admin/broadcast-newsletter`, newsletter, {
        withCredentials: true,
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfData?.csrfToken || "" },
      });
      toast.success("Newsletter sent!");
      setNewsletter({ subject: "", body: "" });
    } catch {
      toast.error("Failed to send");
    } finally {
      setSendingNewsletter(false);
    }
  };

  const handleBulkUpload = async () => {
    setBulkError("");
    let items;
    try {
      items = JSON.parse(bulkJson);
      if (!Array.isArray(items)) throw new Error("Must be a JSON array [ ]");
      if (!items.length) throw new Error("Array is empty");
      if (items.length > 100) throw new Error("Max 100 items per upload");
      const bad = items.filter((i) => !i.name || !i.price || !i.category);
      if (bad.length) throw new Error(`${bad.length} item(s) missing name/price/category`);
    } catch (e) {
      setBulkError(e.message);
      return;
    }
    setBulkUploading(true);
    const csrfData = await getCsrf();
    const headers = { "Content-Type": "application/json", "x-csrf-token": csrfData?.csrfToken || "" };
    let ok = 0, fail = 0;
    for (const item of items) {
      try {
        await axios.post(`${API}/api/admin/menu`, item, { withCredentials: true, headers });
        ok++;
      } catch {
        fail++;
      }
    }
    setBulkUploading(false);
    setBulkJson("");
    toast.success(`Bulk upload: ${ok} created${fail ? `, ${fail} failed` : ""}`);
    load();
  };

  const downloadTemplate = () => {
    const t = JSON.stringify([{
      name: "Paneer Tikka", category: "Veg Starters", subCategory: "Grilled",
      price: 240, calories: 320, serves: 2, rating: 4.5,
      description: "Marinated cottage cheese grilled in clay oven",
      imageUrl: "https://example.com/image.jpg", veg: true, availability: true, isHotOffer: false,
    }], null, 2);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([t], { type: "application/json" }));
    a.download = "flavora-bulk-template.json";
    a.click();
  };

  // ── Derived data ──

  const sortedMenu = [...menuItems.filter((i) => {
    const mc = menuCatFilter === "All" || i.category === menuCatFilter;
    const ms = !menuSearch || i.name.toLowerCase().includes(menuSearch.toLowerCase());
    return mc && ms;
  })].sort((a, b) => {
    if (menuSortBy === "price_asc") return a.price - b.price;
    if (menuSortBy === "price_desc") return b.price - a.price;
    if (menuSortBy === "rating") return (b.rating || 0) - (a.rating || 0);
    return a.name.localeCompare(b.name);
  });

  const filteredUsers = users.filter((u) =>
    !userSearch ||
    u.uname?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.uemail?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const goalPct = Math.min(
    100,
    Math.round(((analytics?.summary?.monthlyRevenue || 0) / revenueGoal) * 100)
  );

  // ── Early returns ──

  if (err) return (
    <div className="adm-error">
      <div className="adm-error-icon">🔒</div>
      <h2>Access Denied</h2>
      <p>{err}</p>
      <button onClick={() => navigate("/home")}>Back to Home</button>
    </div>
  );

  if (loading) return (
    <div className="adm-loading">
      <div className="adm-spinner" />
      <p>Loading admin panel…</p>
    </div>
  );

  // ── Render ──

  return (
    <div className="adm-root">

      {/* ── Sidebar ── */}
      <aside className="adm-sidebar">
        <div className="adm-sidebar-brand">
          <span className="adm-brand-icon">🍽️</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>Flavora</div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-sub)" }}>Admin Panel</div>
          </div>
        </div>
        <nav className="adm-nav">
          {TABS.map((t) => (
            <button
              key={t}
              className={`adm-nav-btn${tab === t ? " active" : ""}`}
              onClick={() => setTab(t)}
            >
              <span className="adm-nav-icon">
                {t === "Overview" && "📊"}
                {t === "Analytics" && "📈"}
                {t === "Orders" && "🛒"}
                {t === "Menu" && "🍴"}
                {t === "Users" && "👥"}
                {t === "Subscribers" && "📧"}
                {t === "Activity" && "🕐"}
                {t === "Theme" && "🎨"}
                {t === "Settings" && "⚙️"}
              </span>
              <span>{t}</span>
            </button>
          ))}
        </nav>
        <div className="adm-sidebar-footer">
          <div className="adm-sidebar-stats">
            <div className="adm-mini-stat"><span>{users.length}</span><span>Users</span></div>
            <div className="adm-mini-stat"><span>{menuItems.length}</span><span>Items</span></div>
            <div className="adm-mini-stat"><span>{subscribers.length}</span><span>Subs</span></div>
          </div>
          <button className="adm-back-btn" onClick={() => navigate("/home")}>← Back to Site</button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="adm-main">
        <div className="adm-topbar">
          <div>
            <div className="adm-page-title">{tab}</div>
            <div className="adm-page-sub">
              {tab === "Overview" && "Dashboard summary"}
              {tab === "Analytics" && "Charts & insights"}
              {tab === "Orders" && `${ordersTotal} total orders`}
              {tab === "Menu" && `${menuItems.length} menu items`}
              {tab === "Users" && `${users.length} registered users`}
              {tab === "Subscribers" && `${subscribers.length} newsletter subscribers`}
              {tab === "Activity" && "Recent admin activity"}
              {tab === "Theme" && "Customize appearance"}
              {tab === "Settings" && "App configuration"}
            </div>
          </div>
          <button className="adm-refresh-btn" onClick={load}>🔄 Refresh</button>
        </div>

        <div className="adm-content">

          {/* ══ OVERVIEW ══ */}
          {tab === "Overview" && (
            <>
              <div className="adm-stats-grid">
                <StatCard label="Total Revenue" value={`₹${(analytics?.summary?.totalRevenue || 0).toLocaleString()}`} icon="💰" sub="All time" color="#059669" />
                <StatCard label="Monthly Revenue" value={`₹${(analytics?.summary?.monthlyRevenue || 0).toLocaleString()}`} icon="📅" sub="This month" color={PRIMARY} />
                <StatCard label="Total Orders" value={analytics?.summary?.totalOrders || 0} icon="🛒" sub="All time" color="#3b82f6" />
                <StatCard label="Pending Orders" value={analytics?.summary?.pendingOrders || 0} icon="⏳" sub="Needs action" color="#f59e0b" />
                <StatCard label="Menu Items" value={menuItems.length} icon="🍴" sub={`${menuItems.filter((i) => i.availability).length} available`} color="#8b5cf6" />
                <StatCard label="Registered Users" value={users.length} icon="👥" sub={`${users.filter((u) => u.role === "admin").length} admins`} color="#ec4899" />
                <StatCard label="Subscribers" value={subscribers.length} icon="📧" sub="Newsletter list" color="#06b6d4" />
                <StatCard
                  label="Avg Order Value"
                  value={`₹${analytics?.summary?.totalOrders ? Math.round((analytics?.summary?.totalRevenue || 0) / analytics.summary.totalOrders) : 0}`}
                  icon="📊" sub="Per order" color="#f97316"
                />
              </div>

              {/* Revenue Goal */}
              <div className="adm-card">
                <div className="adm-card-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Monthly Revenue Goal</span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: "var(--text-sub)" }}>Goal: ₹{revenueGoal.toLocaleString()}</span>
                    <input
                      type="number"
                      value={revenueGoal}
                      onChange={(e) => { setRevenueGoal(Number(e.target.value)); localStorage.setItem("revenueGoal", e.target.value); }}
                      style={{ width: 100, padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border-light)", fontSize: 13 }}
                    />
                  </div>
                </div>
                <div className="adm-goal-bar-bg">
                  <div className="adm-goal-bar-fill" style={{ width: `${goalPct}%`, background: goalPct >= 100 ? "#059669" : PRIMARY }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 13, color: "var(--text-sub)" }}>
                  <span>₹{(analytics?.summary?.monthlyRevenue || 0).toLocaleString()} earned</span>
                  <span style={{ fontWeight: 600, color: goalPct >= 100 ? "#059669" : PRIMARY }}>{goalPct}% of goal</span>
                </div>
              </div>

              <div className="adm-two-col">
                <div className="adm-card">
                  <div className="adm-card-title">🏆 Top Sellers</div>
                  {(analytics?.topSellers || []).slice(0, 8).map((s, i) => (
                    <div key={i} className="adm-rank-row">
                      <div className="adm-rank-num">{i + 1}</div>
                      <div className="adm-rank-name">{s.name || s._id}</div>
                      <div className="adm-rank-val">{s.count} orders</div>
                    </div>
                  ))}
                  {!analytics?.topSellers?.length && <div className="adm-empty">No data yet</div>}
                </div>

                <div className="adm-card">
                  <div className="adm-card-title">⚠️ Unavailable Items</div>
                  {menuItems.filter((i) => !i.availability).slice(0, 6).map((i) => (
                    <div key={i._id} className="adm-rank-row">
                      <span>🔴</span>
                      <div className="adm-rank-name">{i.name}</div>
                      <button className="adm-btn-secondary" style={{ padding: "2px 10px", fontSize: 12 }} onClick={() => toggleAvail(i._id)}>Enable</button>
                    </div>
                  ))}
                  {menuItems.filter((i) => !i.availability).length === 0 && <div className="adm-empty">All items available ✅</div>}
                </div>
              </div>

              <div className="adm-card">
                <div className="adm-card-title">🕐 Recent Orders</div>
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead>
                      <tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr>
                    </thead>
                    <tbody>
                      {(analytics?.recentOrders || []).slice(0, 10).map((o) => (
                        <tr key={o._id}>
                          <td className="adm-txn">#{o._id?.slice(-6)}</td>
                          <td>{o.userEmail || o.userId}</td>
                          <td className="adm-price">₹{o.totalAmount}</td>
                          <td>
                            <span className="adm-status-pill" style={{ background: `${STATUS_COLORS[o.status] || "#6b7280"}22`, color: STATUS_COLORS[o.status] || "#6b7280" }}>
                              {STATUS_LABELS[o.status] || o.status}
                            </span>
                          </td>
                          <td>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!analytics?.recentOrders?.length && <div className="adm-empty">No recent orders</div>}
                </div>
              </div>
            </>
          )}

          {/* ══ ANALYTICS ══ */}
          {tab === "Analytics" && (
            <>
              <div className="adm-card">
                <div className="adm-card-title">📈 Revenue Over Time</div>
                {analytics?.revenueByDay?.length ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={analytics.revenueByDay}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => [`₹${v}`, "Revenue"]} />
                      <Area type="monotone" dataKey="revenue" stroke={PRIMARY} fill="url(#revGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <div className="adm-empty-chart"><p>📊</p><p>No revenue data available</p></div>}
              </div>

              <div className="adm-two-col">
                <div className="adm-card">
                  <div className="adm-card-title">🍽️ Orders by Category</div>
                  {analytics?.ordersByCategory?.length ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={analytics.ordersByCategory}
                          dataKey="count" nameKey="_id"
                          cx="50%" cy="50%" outerRadius={80}
                          label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                        >
                          {analytics.ordersByCategory.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <div className="adm-empty-chart"><p>🍽️</p><p>No category data</p></div>}
                </div>

                <div className="adm-card">
                  <div className="adm-card-title">📦 Orders by Status</div>
                  {analytics?.ordersByStatus?.length ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={analytics.ordersByStatus}
                          dataKey="count" nameKey="_id"
                          cx="50%" cy="50%" outerRadius={80}
                          label={({ _id, percent }) => `${STATUS_LABELS[_id] || _id} ${(percent * 100).toFixed(0)}%`}
                        >
                          {analytics.ordersByStatus.map((e, i) => (
                            <Cell key={i} fill={STATUS_COLORS[e._id] || PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v, n) => [v, STATUS_LABELS[n] || n]} />
                        <Legend formatter={(v) => STATUS_LABELS[v] || v} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <div className="adm-empty-chart"><p>📦</p><p>No status data</p></div>}
                </div>
              </div>

              <div className="adm-card">
                <div className="adm-card-title">🏆 Top Selling Items</div>
                {analytics?.topSellers?.length ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={analytics.topSellers.slice(0, 10)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill={PRIMARY} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="adm-empty-chart"><p>🏆</p><p>No seller data</p></div>}
              </div>

              <div className="adm-card">
                <div className="adm-card-title">💡 Menu Insights</div>
                <div className="adm-insights-grid">
                  {[
                    { icon: "📧", label: "Newsletter Reach", val: `${subscribers.length} subscribers`, cls: "adm-insight-blue" },
                    { icon: "🔥", label: "Hot Offers Active", val: `${menuItems.filter((i) => i.isHotOffer).length} items`, cls: "adm-insight-yellow" },
                    { icon: "🌿", label: "Veg Items", val: `${menuItems.filter((i) => i.veg).length} items`, cls: "adm-insight-green" },
                    { icon: "🍗", label: "Non-Veg Items", val: `${menuItems.filter((i) => !i.veg).length} items`, cls: "adm-insight-red" },
                    { icon: "⭐", label: "Avg Menu Rating", val: menuItems.length ? (menuItems.reduce((s, i) => s + (i.rating || 0), 0) / menuItems.length).toFixed(1) : "—", cls: "adm-insight-yellow" },
                    { icon: "🚫", label: "Unavailable Items", val: `${menuItems.filter((i) => !i.availability).length} items`, cls: "adm-insight-red" },
                  ].map((ins, idx) => (
                    <div key={idx} className={`adm-insight ${ins.cls}`}>
                      <div className="adm-insight-icon">{ins.icon}</div>
                      <div>
                        <strong>{ins.label}</strong>
                        <p>{ins.val}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ══ ORDERS ══ */}
          {tab === "Orders" && (
            <>
              <div className="adm-menu-toolbar">
                <input
                  className="adm-search"
                  placeholder="Filter by email…"
                  value={orderFilter.email}
                  onChange={(e) => setOrderFilter((f) => ({ ...f, email: e.target.value }))}
                />
                <select
                  className="adm-select"
                  value={orderFilter.status}
                  onChange={(e) => setOrderFilter((f) => ({ ...f, status: e.target.value }))}
                >
                  <option value="">All Statuses</option>
                  {Object.entries(STATUS_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
                <button className="adm-btn-primary" onClick={() => loadOrders(1)}>Search</button>
                <button className="adm-btn-secondary" onClick={() => { setOrderFilter({ email: "", status: "" }); setTimeout(() => loadOrders(1), 50); }}>Clear</button>
              </div>

              <div className="adm-card">
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>Order ID</th><th>Customer</th><th>Items</th>
                        <th>Amount</th><th>Status</th><th>Date</th><th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o._id}>
                          <td className="adm-txn">#{o._id?.slice(-6)}</td>
                          <td>{o.userEmail || o.userId}</td>
                          <td>{o.items?.length || 0} items</td>
                          <td className="adm-price">₹{o.totalAmount}</td>
                          <td>
                            <span className="adm-status-pill" style={{ background: `${STATUS_COLORS[o.status] || "#6b7280"}22`, color: STATUS_COLORS[o.status] || "#6b7280" }}>
                              {STATUS_LABELS[o.status] || o.status}
                            </span>
                          </td>
                          <td>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}</td>
                          <td>
                            <select
                              className="adm-select-sm"
                              value={o.status}
                              onChange={(e) => updateOrderStatus(o._id, e.target.value)}
                            >
                              {Object.entries(STATUS_LABELS).map(([v, l]) => (
                                <option key={v} value={v}>{l}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!orders.length && <div className="adm-empty">No orders found</div>}
                </div>

                {ordersTotal > 20 && (
                  <div className="adm-pagination">
                    <button className="adm-btn-secondary" disabled={ordersPage <= 1} onClick={() => loadOrders(ordersPage - 1)}>← Prev</button>
                    <span>Page {ordersPage} of {Math.ceil(ordersTotal / 20)}</span>
                    <button className="adm-btn-secondary" disabled={ordersPage >= Math.ceil(ordersTotal / 20)} onClick={() => loadOrders(ordersPage + 1)}>Next →</button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ══ MENU ══ */}
          {tab === "Menu" && (
            <>
              <div className="adm-menu-toolbar">
                <input
                  className="adm-search"
                  placeholder="Search menu items…"
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                />
                <select className="adm-select" value={menuCatFilter} onChange={(e) => setMenuCatFilter(e.target.value)}>
                  <option value="All">All Categories</option>
                  {MENU_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select className="adm-select" value={menuSortBy} onChange={(e) => setMenuSortBy(e.target.value)}>
                  <option value="name">Sort: Name</option>
                  <option value="price_asc">Price ↑</option>
                  <option value="price_desc">Price ↓</option>
                  <option value="rating">Rating</option>
                </select>
                <button className="adm-btn-primary" onClick={() => { setMenuForm({ ...EMPTY_MENU_FORM }); setPreviewImg(""); }}>+ Add Item</button>
                <span className="adm-menu-count">{sortedMenu.length} items</span>
              </div>

              {selectedItems.size > 0 && (
                <div className="adm-bulk-bar">
                  <span>{selectedItems.size} selected</span>
                  <button className="adm-btn-secondary" style={{ padding: "4px 12px", fontSize: 12 }} onClick={bulkToggle}>Toggle Availability</button>
                  <button className="adm-btn-del" onClick={bulkDelete}>Delete Selected</button>
                  <button className="adm-btn-secondary" style={{ padding: "4px 12px", fontSize: 12 }} onClick={() => setSelectedItems(new Set())}>Clear</button>
                </div>
              )}

              <div className="adm-card">
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>
                          <input
                            type="checkbox"
                            checked={sortedMenu.length > 0 && sortedMenu.every((i) => selectedItems.has(i._id))}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedItems(new Set(sortedMenu.map((i) => i._id)));
                              else setSelectedItems(new Set());
                            }}
                          />
                        </th>
                        <th>Image</th><th>Name</th><th>Category</th>
                        <th>Price</th><th>Rating</th><th>Type</th><th>Status</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedMenu.map((item) => (
                        <tr key={item._id} className={selectedItems.has(item._id) ? "adm-row-selected" : ""}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedItems.has(item._id)}
                              onChange={(e) => {
                                const s = new Set(selectedItems);
                                e.target.checked ? s.add(item._id) : s.delete(item._id);
                                setSelectedItems(s);
                              }}
                            />
                          </td>
                          <td>
                            {item.imageUrl
                              ? <img src={item.imageUrl} alt={item.name} className="adm-thumb" onError={(e) => { e.target.style.display = "none"; }} />
                              : <div style={{ width: 44, height: 44, borderRadius: 8, background: "var(--bg-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🍽️</div>
                            }
                          </td>
                          <td className="adm-item-name">{item.name}</td>
                          <td>{item.category}</td>
                          <td className="adm-price">₹{item.price}</td>
                          <td>⭐ {item.rating || "—"}</td>
                          <td>
                            <span className={`adm-badge ${item.veg ? "adm-badge-veg" : "adm-badge-nonveg"}`}>
                              {item.veg ? "🌿 Veg" : "🍗 Non-Veg"}
                            </span>
                          </td>
                          <td>
                            <button
                              className={`adm-toggle ${item.availability ? "on" : "off"}`}
                              onClick={() => toggleAvail(item._id)}
                            >
                              {item.availability ? "Available" : "Unavailable"}
                            </button>
                          </td>
                          <td className="adm-actions">
                            <button className="adm-btn-edit" onClick={() => { setMenuForm({ ...item }); setPreviewImg(item.imageUrl || ""); }}>Edit</button>
                            <button className="adm-btn-del" onClick={() => deleteItem(item._id, item.name)}>Del</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!sortedMenu.length && <div className="adm-empty">No items found</div>}
                </div>
              </div>

              {/* Bulk Upload */}
              <div className="adm-card">
                <div className="adm-card-title">📤 Bulk Upload</div>
                <div className="adm-bulk-info">
                  Paste a JSON array of menu items. Each item needs <code>name</code>, <code>price</code>, and <code>category</code>.
                  <button style={{ marginLeft: 8, background: "none", border: "none", color: "var(--primary)", fontWeight: 700, cursor: "pointer", fontSize: "0.82rem" }} onClick={downloadTemplate}>Download template</button>
                </div>
                <textarea
                  className="adm-search"
                  style={{ width: "100%", minHeight: 100, marginTop: 10, fontFamily: "monospace", fontSize: 12 }}
                  placeholder='[{"name":"Item","category":"Veg Starters","price":150}]'
                  value={bulkJson}
                  onChange={(e) => setBulkJson(e.target.value)}
                />
                {bulkError && <div className="adm-bulk-error">⚠️ {bulkError}</div>}
                <div style={{ marginTop: 10 }}>
                  <button className="adm-btn-primary" onClick={handleBulkUpload} disabled={bulkUploading}>
                    {bulkUploading ? "Uploading…" : "Upload Items"}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ══ USERS ══ */}
          {tab === "Users" && (
            <>
              <div className="adm-menu-toolbar">
                <input
                  className="adm-search"
                  placeholder="Search by name or email…"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
                <span className="adm-menu-count">{filteredUsers.length} users</span>
              </div>

              <div className="adm-card">
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead>
                      <tr><th>Avatar</th><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u._id}>
                          <td>
                            <div className="adm-user-avatar">
                              {(u.uname || u.uemail || "?")[0].toUpperCase()}
                            </div>
                          </td>
                          <td className="adm-item-name">{u.uname || "—"}</td>
                          <td>{u.uemail}</td>
                          <td>
                            <span className={`adm-badge ${u.role === "admin" ? "adm-badge-admin" : ""}`}>
                              {u.role || "user"}
                            </span>
                          </td>
                          <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                          <td>
                            <select
                              className="adm-select-sm"
                              value={u.role || "user"}
                              onChange={(e) => updateRole(u._id, e.target.value)}
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!filteredUsers.length && <div className="adm-empty">No users found</div>}
                </div>
              </div>
            </>
          )}

          {/* ══ SUBSCRIBERS ══ */}
          {tab === "Subscribers" && (
            <>
              <div className="adm-two-col">
                <div className="adm-card">
                  <div className="adm-card-title">📧 Subscriber List</div>
                  <div className="adm-table-wrap">
                    <table className="adm-table">
                      <thead>
                        <tr><th>#</th><th>Email</th><th>Subscribed</th><th>Action</th></tr>
                      </thead>
                      <tbody>
                        {subscribers.map((s, i) => (
                          <tr key={s._id}>
                            <td>{i + 1}</td>
                            <td>{s.email}</td>
                            <td>{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "—"}</td>
                            <td>
                              <button className="adm-btn-del" onClick={() => deleteSubscriber(s._id)}>Remove</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!subscribers.length && <div className="adm-empty">No subscribers yet</div>}
                  </div>
                </div>

                <div className="adm-card">
                  <div className="adm-card-title">📨 Send Newsletter</div>
                  <div className="adm-form-field" style={{ marginBottom: 12 }}>
                    <label>Subject</label>
                    <input
                      type="text"
                      placeholder="Newsletter subject…"
                      value={newsletter.subject}
                      onChange={(e) => setNewsletter((n) => ({ ...n, subject: e.target.value }))}
                    />
                  </div>
                  <div className="adm-form-field" style={{ marginBottom: 16 }}>
                    <label>Body</label>
                    <textarea
                      rows={6}
                      placeholder="Write your newsletter content…"
                      value={newsletter.body}
                      onChange={(e) => setNewsletter((n) => ({ ...n, body: e.target.value }))}
                    />
                  </div>
                  <button className="adm-btn-primary" onClick={sendNewsletter} disabled={sendingNewsletter}>
                    {sendingNewsletter ? "Sending…" : `Send to ${subscribers.length} subscribers`}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ══ ACTIVITY ══ */}
          {tab === "Activity" && (
            <div className="adm-card">
              <div className="adm-card-title">🕐 Activity Log</div>
              <div className="adm-activity-list">
                {activityLog.map((a, i) => (
                  <div key={i} className="adm-activity-item">
                    <div className="adm-activity-dot" />
                    <div className="adm-activity-body">
                      <div className="adm-activity-action">{a.action || a.type || "Action"}</div>
                      {a.detail && <div className="adm-activity-detail">{a.detail}</div>}
                      <div className="adm-activity-meta">
                        {a.user && <span>{a.user} · </span>}
                        {a.createdAt ? new Date(a.createdAt).toLocaleString() : ""}
                      </div>
                    </div>
                  </div>
                ))}
                {!activityLog.length && <div className="adm-empty">No activity recorded yet</div>}
              </div>
            </div>
          )}

          {/* ══ THEME ══ */}
          {tab === "Theme" && (
            <div className="adm-card adm-theme-card">
              <div className="adm-card-title">🎨 Theme Color</div>
              <p className="adm-theme-desc">Pick a primary color for the admin panel and site UI.</p>

              <div className="adm-color-row">
                <input
                  type="color"
                  className="adm-color-input"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                />
                <span className="adm-color-hex">{themeColor}</span>
                <button className="adm-btn-primary" onClick={() => applyTheme(themeColor)}>Apply</button>
              </div>

              <div className="adm-preset-label">Presets</div>
              <div className="adm-preset-row">
                {THEME_PRESETS.map((c) => (
                  <button
                    key={c}
                    className="adm-preset-swatch"
                    style={{ background: c, borderColor: themeColor === c ? "#000" : "transparent" }}
                    onClick={() => { setThemeColor(c); applyTheme(c); }}
                    title={c}
                  />
                ))}
              </div>

              <div className="adm-theme-preview">
                <button className="adm-btn-primary" style={{ background: themeColor }}>Primary Button</button>
                <span style={{ marginLeft: 12, color: themeColor, fontWeight: 700 }}>Accent Text</span>
                <div style={{ marginLeft: 12, width: 24, height: 24, borderRadius: "50%", background: themeColor }} />
              </div>
            </div>
          )}

          {/* ══ SETTINGS ══ */}
          {tab === "Settings" && (
            <>
              <div className="adm-card">
                <div className="adm-card-title">📢 Site Announcement</div>
                <p className="adm-section-sub">Shown as a banner on the site (stored locally).</p>
                <div className="adm-form-field" style={{ marginBottom: 12 }}>
                  <label>Announcement Text</label>
                  <input
                    type="text"
                    placeholder="e.g. Free delivery on orders above ₹499!"
                    value={announcement}
                    onChange={(e) => setAnnouncement(e.target.value)}
                  />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    className="adm-btn-primary"
                    onClick={() => { localStorage.setItem("siteAnnouncement", announcement); toast.success("Announcement saved!"); }}
                  >
                    Save
                  </button>
                  <button
                    className="adm-btn-secondary"
                    onClick={() => { setAnnouncement(""); localStorage.removeItem("siteAnnouncement"); toast.info("Announcement cleared"); }}
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="adm-card">
                <div className="adm-card-title">🎯 Revenue Goal</div>
                <p className="adm-section-sub">Monthly revenue target shown on the Overview dashboard.</p>
                <div className="adm-form-field" style={{ marginBottom: 12 }}>
                  <label>Goal Amount (₹)</label>
                  <input
                    type="number"
                    value={revenueGoal}
                    onChange={(e) => { setRevenueGoal(Number(e.target.value)); localStorage.setItem("revenueGoal", e.target.value); }}
                  />
                </div>
                <button className="adm-btn-primary" onClick={() => toast.success("Goal saved!")}>Save Goal</button>
              </div>

              <div className="adm-card">
                <div className="adm-card-title">📊 Quick Stats</div>
                <div className="adm-inventory-grid">
                  <div className="adm-inv-item adm-inv-green">
                    <div className="adm-inv-num">{menuItems.filter((i) => i.availability).length}</div>
                    <div>Available Items</div>
                  </div>
                  <div className="adm-inv-item adm-inv-red">
                    <div className="adm-inv-num">{menuItems.filter((i) => !i.availability).length}</div>
                    <div>Unavailable</div>
                  </div>
                  <div className="adm-inv-item adm-inv-orange">
                    <div className="adm-inv-num">{menuItems.filter((i) => i.isHotOffer).length}</div>
                    <div>Hot Offers</div>
                  </div>
                  <div className="adm-inv-item adm-inv-blue">
                    <div className="adm-inv-num">{users.filter((u) => u.role === "admin").length}</div>
                    <div>Admins</div>
                  </div>
                  <div className="adm-inv-item adm-inv-purple">
                    <div className="adm-inv-num">{subscribers.length}</div>
                    <div>Subscribers</div>
                  </div>
                  <div className="adm-inv-item adm-inv-gray">
                    <div className="adm-inv-num">{MENU_CATEGORIES.length}</div>
                    <div>Categories</div>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </main>

      {/* ══ MENU ITEM MODAL ══ */}
      {menuForm && (
        <div className="adm-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setMenuForm(null); setPreviewImg(""); } }}>
          <div className="adm-modal">
            <div className="adm-modal-header">
              <h3>{menuForm._id ? "Edit Menu Item" : "Add Menu Item"}</h3>
              <button className="adm-modal-close" onClick={() => { setMenuForm(null); setPreviewImg(""); }}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-form-grid">
                <div className="adm-form-field adm-form-full">
                  <label>Name *</label>
                  <input
                    type="text"
                    placeholder="Item name"
                    value={menuForm.name || ""}
                    onChange={(e) => setMenuForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>

                <div className="adm-form-field">
                  <label>Category *</label>
                  <select
                    value={menuForm.category || ""}
                    onChange={(e) => setMenuForm((f) => ({ ...f, category: e.target.value }))}
                  >
                    <option value="">Select category</option>
                    {MENU_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="adm-form-field">
                  <label>Sub-Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Grilled"
                    value={menuForm.subCategory || ""}
                    onChange={(e) => setMenuForm((f) => ({ ...f, subCategory: e.target.value }))}
                  />
                </div>

                <div className="adm-form-field">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={menuForm.price || ""}
                    onChange={(e) => setMenuForm((f) => ({ ...f, price: Number(e.target.value) }))}
                  />
                </div>

                <div className="adm-form-field">
                  <label>Calories</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={menuForm.calories || ""}
                    onChange={(e) => setMenuForm((f) => ({ ...f, calories: Number(e.target.value) }))}
                  />
                </div>

                <div className="adm-form-field">
                  <label>Serves</label>
                  <input
                    type="number"
                    placeholder="1"
                    value={menuForm.serves || 1}
                    onChange={(e) => setMenuForm((f) => ({ ...f, serves: Number(e.target.value) }))}
                  />
                </div>

                <div className="adm-form-field">
                  <label>Rating</label>
                  <input
                    type="number"
                    step="0.1" min="0" max="5"
                    placeholder="4.5"
                    value={menuForm.rating || ""}
                    onChange={(e) => setMenuForm((f) => ({ ...f, rating: Number(e.target.value) }))}
                  />
                </div>

                <div className="adm-form-field adm-form-full">
                  <label>Description</label>
                  <textarea
                    rows={3}
                    placeholder="Item description…"
                    value={menuForm.description || ""}
                    onChange={(e) => setMenuForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>

                <div className="adm-form-field adm-form-full">
                  <label>Image URL</label>
                  <div className="adm-img-row">
                    {previewImg && (
                      <img
                        src={previewImg}
                        alt="preview"
                        className="adm-img-preview"
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    )}
                    <div className="adm-img-inputs">
                      <input
                        type="text"
                        placeholder="https://example.com/image.jpg"
                        value={menuForm.imageUrl || ""}
                        onChange={(e) => { setMenuForm((f) => ({ ...f, imageUrl: e.target.value })); setPreviewImg(e.target.value); }}
                      />
                    </div>
                  </div>
                </div>

                <div className="adm-form-checks">
                  <label className="adm-check-label">
                    <input
                      type="checkbox"
                      checked={!!menuForm.veg}
                      onChange={(e) => setMenuForm((f) => ({ ...f, veg: e.target.checked }))}
                    />
                    🌿 Vegetarian
                  </label>
                  <label className="adm-check-label">
                    <input
                      type="checkbox"
                      checked={!!menuForm.availability}
                      onChange={(e) => setMenuForm((f) => ({ ...f, availability: e.target.checked }))}
                    />
                    ✅ Available
                  </label>
                  <label className="adm-check-label">
                    <input
                      type="checkbox"
                      checked={!!menuForm.isHotOffer}
                      onChange={(e) => setMenuForm((f) => ({ ...f, isHotOffer: e.target.checked }))}
                    />
                    🔥 Hot Offer
                  </label>
                </div>
              </div>
            </div>
            <div className="adm-modal-footer">
              <button className="adm-btn-secondary" onClick={() => { setMenuForm(null); setPreviewImg(""); }}>Cancel</button>
              <button className="adm-btn-primary" onClick={saveMenuItem}>
                {menuForm._id ? "Update Item" : "Create Item"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
