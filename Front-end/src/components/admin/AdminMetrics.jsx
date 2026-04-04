import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend, AreaChart, Area } from "recharts";
import { toast } from "react-toastify";
import axios from "axios";
import "./AdminMetrics.css";

const API = (import.meta.env.VITE_API_URL || "http://localhost:1111").replace(/\/$/, "");
const PIE_COLORS = ["#4f46e5", "#7c3aed", "#6d28d9", "#8b5cf6", "#a78bfa", "#3730a3", "#312e81", "#4338ca", "#5b21b6", "#7e22ce", "#9333ea", "#a855f7", "#c084fc", "#d8b4fe", "#ede9fe"];
const MENU_CATEGORIES = ["Hot Offers", "Veg Starters", "Non-Veg Starters", "Tandooris", "Soups", "Salads", "Sandwiches", "Signature Dishes", "Biryanis", "Main Course", "Rice & Breads", "South Indian", "Chinese/Indo-Chinese", "Beverages", "Cocktails/Mocktails", "Desserts"];
const TABS = ["Overview", "Analytics", "Menu", "Users", "Theme", "Settings"];
const PRIMARY = "#4f46e5";

const StatCard = ({ label, value, icon, sub, color = PRIMARY, trend }) => (
  <div className="adm-stat-card">
    <div className="adm-stat-icon" style={{ background: `${color}18`, color }}>{icon}</div>
    <div style={{ flex: 1 }}>
      <div className="adm-stat-value">{value}</div>
      <div className="adm-stat-label">{label}</div>
      {sub && <div className="adm-stat-sub">{sub}</div>}
    </div>
    {trend && <div className="adm-stat-trend" style={{ color: trend > 0 ? "#059669" : "#dc2626" }}>{trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%</div>}
  </div>
);

const csrf = () => fetch(`${API}/api/csrf`, { credentials: "include" }).then(r => r.json()).catch(() => ({}));

export default function AdminMetrics() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("Overview");
  const [analytics, setAnalytics] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [menuForm, setMenuForm] = useState(null);
  const [menuSearch, setMenuSearch] = useState("");
  const [menuCatFilter, setMenuCatFilter] = useState("All");
  const [menuSortBy, setMenuSortBy] = useState("name");
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [userSearch, setUserSearch] = useState("");
  const [newsletter, setNewsletter] = useState({ subject: "", body: "" });
  const [announcement, setAnnouncement] = useState(localStorage.getItem("siteAnnouncement") || "");
  const [maintenanceMode, setMaintenanceMode] = useState(localStorage.getItem("maintenanceMode") === "true");
  const [sendingNewsletter, setSendingNewsletter] = useState(false);
  const [themeColor, setThemeColor] = useState("#4f46e5");
  const [previewImg, setPreviewImg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [aRes, mRes, uRes] = await Promise.all([
        fetch(`${API}/api/admin/analytics`, { credentials: "include" }),
        fetch(`${API}/api/menu?limit=200`, { credentials: "include" }),
        fetch(`${API}/api/admin/users`, { credentials: "include" }),
      ]);
      if (!aRes.ok) throw new Error("Unauthorized — admin access required");
      const [a, m, u] = await Promise.all([aRes.json(), mRes.json(), uRes.json()]);
      setAnalytics(a.data);
      setMenuItems(m.data?.items || []);
      setUsers(u.data || []);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const applyTheme = (color) => {
    document.documentElement.style.setProperty("--primary", color);
    document.documentElement.style.setProperty("--primary-gradient", `linear-gradient(135deg,${color} 0%,${color}cc 100%)`);
    localStorage.setItem("adminThemeColor", color);
    toast.success("Theme applied!");
  };

  const saveMenuItem = async () => {
    if (!menuForm?.name || !menuForm?.price) { toast.error("Name and price required"); return; }
    const csrfData = await csrf();
    const headers = { "Content-Type": "application/json", "x-csrf-token": csrfData?.csrfToken || "" };
    try {
      if (menuForm._id) {
        await axios.put(`${API}/api/admin/menu/${menuForm._id}`, menuForm, { withCredentials: true, headers });
        toast.success("Item updated!");
      } else {
        await axios.post(`${API}/api/admin/menu`, menuForm, { withCredentials: true, headers });
        toast.success("Item created!");
      }
      setMenuForm(null); setPreviewImg(""); load();
    } catch (e) { toast.error(e.response?.data?.message || "Save failed"); }
  };

  const deleteItem = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    const csrfData = await csrf();
    try {
      await axios.delete(`${API}/api/admin/menu/${id}`, { withCredentials: true, headers: { "x-csrf-token": csrfData?.csrfToken || "" } });
      toast.success("Deleted!"); load();
    } catch { toast.error("Delete failed"); }
  };

  const toggleAvail = async (id) => {
    const csrfData = await csrf();
    try {
      await axios.patch(`${API}/api/admin/menu/${id}/toggle`, {}, { withCredentials: true, headers: { "x-csrf-token": csrfData?.csrfToken || "" } });
      load();
    } catch { toast.error("Toggle failed"); }
  };

  const updateRole = async (id, role) => {
    const csrfData = await csrf();
    try {
      await axios.patch(`${API}/api/admin/users/${id}/role`, { role }, { withCredentials: true, headers: { "Content-Type": "application/json", "x-csrf-token": csrfData?.csrfToken || "" } });
      toast.success(`Role → ${role}`); load();
    } catch { toast.error("Role update failed"); }
  };

  const bulkToggle = async () => {
    if (!selectedItems.size) { toast.info("Select items first"); return; }
    const csrfData = await csrf();
    await Promise.all([...selectedItems].map(id =>
      axios.patch(`${API}/api/admin/menu/${id}/toggle`, {}, { withCredentials: true, headers: { "x-csrf-token": csrfData?.csrfToken || "" } })
    ));
    toast.success(`${selectedItems.size} items toggled`);
    setSelectedItems(new Set()); load();
  };

  const bulkDelete = async () => {
    if (!selectedItems.size) return;
    if (!confirm(`Delete ${selectedItems.size} items?`)) return;
    const csrfData = await csrf();
    await Promise.all([...selectedItems].map(id =>
      axios.delete(`${API}/api/admin/menu/${id}`, { withCredentials: true, headers: { "x-csrf-token": csrfData?.csrfToken || "" } })
    ));
    toast.success(`${selectedItems.size} items deleted`);
    setSelectedItems(new Set()); load();
  };

  const sendNewsletter = async () => {
    if (!newsletter.subject || !newsletter.body) { toast.error("Subject and body required"); return; }
    setSendingNewsletter(true);
    const csrfData = await csrf();
    try {
      await axios.post(`${API}/api/admin/broadcast-newsletter`, newsletter, { withCredentials: true, headers: { "Content-Type": "application/json", "x-csrf-token": csrfData?.csrfToken || "" } });
      toast.success("Newsletter sent!"); setNewsletter({ subject: "", body: "" });
    } catch { toast.error("Failed to send"); }
    finally { setSendingNewsletter(false); }
  };

  if (err) return (
    <div className="adm-error">
      <div className="adm-error-icon">🔒</div>
      <h2>Access Denied</h2><p>{err}</p>
      <button onClick={() => navigate("/home")}>Back to Home</button>
    </div>
  );

  if (loading) return (
    <div className="adm-loading"><div className="adm-spinner" /><p>Loading admin panel…</p></div>
  );

  const sortedMenu = [...menuItems.filter(i => {
    const mc = menuCatFilter === "All" || i.category === menuCatFilter;
    const ms = !menuSearch || i.name.toLowerCase().includes(menuSearch.toLowerCase()) || i.category.toLowerCase().includes(menuSearch.toLowerCase());
    return mc && ms;
  })].sort((a, b) => {
    if (menuSortBy === "price_asc") return a.price - b.price;
    if (menuSortBy === "price_desc") return b.price - a.price;
    if (menuSortBy === "rating") return b.rating - a.rating;
    if (menuSortBy === "newest") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    return a.name.localeCompare(b.name);
  });

  const filteredUsers = users.filter(u => !userSearch || u.uname?.toLowerCase().includes(userSearch.toLowerCase()) || u.uemail?.toLowerCase().includes(userSearch.toLowerCase()));

  return (
    <div className="adm-root">
      <aside className="adm-sidebar">
        <div className="adm-sidebar-brand"><span className="adm-brand-icon">🍽️</span><span>Flavora Admin</span></div>
        <nav className="adm-nav">
          {TABS.map(t => (
            <button key={t} className={`adm-nav-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
              <span className="adm-nav-icon">{t === "Overview" ? "📊" : t === "Analytics" ? "📈" : t === "Menu" ? "🍛" : t === "Users" ? "👥" : t === "Theme" ? "🎨" : "⚙️"}</span>{t}
            </button>
          ))}
        </nav>
        <div className="adm-sidebar-footer">
          <div className="adm-sidebar-stats">
            <div className="adm-mini-stat"><span>{menuItems.length}</span><span>Items</span></div>
            <div className="adm-mini-stat"><span>{users.length}</span><span>Users</span></div>
            <div className="adm-mini-stat"><span>{analytics?.summary?.totalOrders || 0}</span><span>Orders</span></div>
          </div>
          <button className="adm-back-btn" onClick={() => navigate("/home")}>← Back to App</button>
        </div>
      </aside>

      <main className="adm-main">
        <div className="adm-topbar">
          <div>
            <h1 className="adm-page-title">{tab}</h1>
            <p className="adm-page-sub">{tab === "Overview" ? "Dashboard summary" : tab === "Analytics" ? "Sales & performance charts" : tab === "Menu" ? "Manage menu items" : tab === "Users" ? "Manage user accounts" : tab === "Theme" ? "Customize app appearance" : "Site settings & tools"}</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="adm-refresh-btn" onClick={load}>↻ Refresh</button>
          </div>
        </div>

        {/* ── OVERVIEW ── */}
        {tab === "Overview" && analytics && (
          <div className="adm-content">
            <div className="adm-stats-grid">
              <StatCard label="Total Revenue" value={`₹${analytics.summary.totalRevenue.toLocaleString()}`} icon="💰" color="#059669" />
              <StatCard label="Total Orders" value={analytics.summary.totalOrders} icon="📦" color={PRIMARY} />
              <StatCard label="Menu Items" value={analytics.summary.totalMenuItems} icon="🍛" color="#7c3aed" sub={`${menuItems.filter(i => i.availability).length} available`} />
              <StatCard label="Registered Users" value={analytics.summary.totalUsers} icon="👥" color="#0891b2" />
              <StatCard label="Avg Order Value" value={`₹${analytics.summary.avgOrderValue}`} icon="📊" color="#d97706" />
              <StatCard label="Hot Offers" value={menuItems.filter(i => i.isHotOffer).length} icon="🔥" color="#dc2626" />
              <StatCard label="Veg / Non-Veg" value={`${menuItems.filter(i => i.veg).length} / ${menuItems.filter(i => !i.veg).length}`} icon="🥗" color="#16a34a" />
              <StatCard label="Low Rated" value={analytics.lowRated.length} icon="⚠️" color="#b45309" sub="below 3.5★" />
            </div>

            <div className="adm-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 className="adm-card-title" style={{ margin: 0 }}>Recent Orders</h3>
                <span className="adm-badge">{analytics.recentOrders.length} shown</span>
              </div>
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead><tr><th>#</th><th>Email</th><th>Items</th><th>Total</th><th>Date</th><th>Txn ID</th></tr></thead>
                  <tbody>
                    {analytics.recentOrders.length === 0 ? (
                      <tr><td colSpan={6} className="adm-empty">No orders yet — place a real Razorpay payment to see data</td></tr>
                    ) : analytics.recentOrders.map((o, i) => (
                      <tr key={o.id}>
                        <td>{i + 1}</td><td>{o.userEmail || "—"}</td><td>{o.items}</td>
                        <td className="adm-price">₹{o.grandTotal}</td>
                        <td>{o.date ? new Date(o.date).toLocaleDateString("en-IN") : "—"}</td>
                        <td className="adm-txn">{o.paymentId ? o.paymentId.slice(-12) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="adm-two-col">
              <div className="adm-card">
                <h3 className="adm-card-title">🏆 Top Sellers</h3>
                {analytics.topSellers.length === 0 ? <p className="adm-empty">No sales data yet</p> : analytics.topSellers.map((s, i) => (
                  <div key={s.title} className="adm-rank-row">
                    <span className="adm-rank-num">{i + 1}</span>
                    <span className="adm-rank-name">{s.title}</span>
                    <span className="adm-rank-val">{s.qty} sold</span>
                    <span className="adm-price">₹{s.revenue}</span>
                  </div>
                ))}
              </div>
              <div className="adm-card">
                <h3 className="adm-card-title">⚠️ Needs Attention</h3>
                <p className="adm-section-sub">Low sellers & poor ratings</p>
                {analytics.lowSellers.length === 0 ? <p className="adm-empty">No data yet</p> : analytics.lowSellers.map((s, i) => (
                  <div key={s.title} className="adm-rank-row">
                    <span className="adm-rank-num adm-rank-warn">{i + 1}</span>
                    <span className="adm-rank-name">{s.title}</span>
                    <span className="adm-rank-val adm-warn">{s.qty} sold</span>
                  </div>
                ))}
                {analytics.lowRated.slice(0, 3).map(i => (
                  <div key={i.id} className="adm-rank-row">
                    <span className="adm-rank-num adm-rank-warn">★</span>
                    <span className="adm-rank-name">{i.name}</span>
                    <span className="adm-badge adm-badge-warn">⭐{i.rating}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="adm-card">
              <h3 className="adm-card-title">📦 Inventory Status</h3>
              <div className="adm-inventory-grid">
                <div className="adm-inv-item adm-inv-green"><span className="adm-inv-num">{menuItems.filter(i => i.availability).length}</span><span>Available</span></div>
                <div className="adm-inv-item adm-inv-red"><span className="adm-inv-num">{menuItems.filter(i => !i.availability).length}</span><span>Unavailable</span></div>
                <div className="adm-inv-item adm-inv-orange"><span className="adm-inv-num">{menuItems.filter(i => i.isHotOffer).length}</span><span>Hot Offers</span></div>
                <div className="adm-inv-item adm-inv-blue"><span className="adm-inv-num">{menuItems.filter(i => i.veg).length}</span><span>Veg</span></div>
                <div className="adm-inv-item adm-inv-purple"><span className="adm-inv-num">{menuItems.filter(i => !i.veg).length}</span><span>Non-Veg</span></div>
                <div className="adm-inv-item adm-inv-gray"><span className="adm-inv-num">{[...new Set(menuItems.map(i => i.category))].length}</span><span>Categories</span></div>
              </div>
            </div>
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {tab === "Analytics" && analytics && (
          <div className="adm-content">
            <div className="adm-stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
              <StatCard label="Total Revenue" value={`₹${analytics.summary.totalRevenue.toLocaleString()}`} icon="💰" color="#059669" />
              <StatCard label="Total Orders" value={analytics.summary.totalOrders} icon="📦" color={PRIMARY} />
              <StatCard label="Avg Order Value" value={`₹${analytics.summary.avgOrderValue}`} icon="📊" color="#d97706" />
            </div>

            <div className="adm-card">
              <h3 className="adm-card-title">Revenue — Last 14 Days</h3>
              {analytics.revenueChart.length === 0 ? (
                <div className="adm-empty-chart"><p>📊 No revenue data yet</p><p style={{ fontSize: "0.78rem", color: "var(--text-sub)" }}>Revenue appears after real Razorpay payments are processed</p></div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={analytics.revenueChart}>
                    <defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={PRIMARY} stopOpacity={0.3} /><stop offset="95%" stopColor={PRIMARY} stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={v => `₹${v}`} />
                    <Area type="monotone" dataKey="revenue" stroke={PRIMARY} fill="url(#rg)" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="adm-two-col">
              <div className="adm-card">
                <h3 className="adm-card-title">Menu by Category</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={analytics.categoryChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {analytics.categoryChart.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="adm-card">
                <h3 className="adm-card-title">Orders by Category</h3>
                {analytics.categoryOrders.length === 0 ? <p className="adm-empty">No order data yet</p> : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={analytics.categoryOrders.slice(0, 8)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={110} />
                      <Tooltip />
                      <Bar dataKey="orders" fill={PRIMARY} radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="adm-card">
              <h3 className="adm-card-title">Top 5 Items — Qty Sold vs Revenue</h3>
              {analytics.topSellers.length === 0 ? <p className="adm-empty">No sales data yet</p> : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analytics.topSellers}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="title" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="qty" fill={PRIMARY} radius={[6, 6, 0, 0]} name="Qty Sold" />
                    <Bar yAxisId="right" dataKey="revenue" fill="#7c3aed" radius={[6, 6, 0, 0]} name="Revenue ₹" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="adm-card">
              <h3 className="adm-card-title">📋 Marketing Insights</h3>
              <div className="adm-insights-grid">
                <div className="adm-insight adm-insight-green">
                  <div className="adm-insight-icon">🏆</div>
                  <div><strong>Best Seller</strong><p>{analytics.topSellers[0]?.title || "No data"}</p><span>{analytics.topSellers[0]?.qty || 0} units sold</span></div>
                </div>
                <div className="adm-insight adm-insight-red">
                  <div className="adm-insight-icon">📉</div>
                  <div><strong>Needs Promotion</strong><p>{analytics.lowSellers[0]?.title || "No data"}</p><span>Only {analytics.lowSellers[0]?.qty || 0} units sold</span></div>
                </div>
                <div className="adm-insight adm-insight-yellow">
                  <div className="adm-insight-icon">⭐</div>
                  <div><strong>Low Rated</strong><p>{analytics.lowRated[0]?.name || "All good!"}</p><span>{analytics.lowRated[0] ? `${analytics.lowRated[0].rating}★ — needs improvement` : "No items below 3.5★"}</span></div>
                </div>
                <div className="adm-insight adm-insight-blue">
                  <div className="adm-insight-icon">💡</div>
                  <div><strong>Recommendation</strong><p>Consider discounting low sellers</p><span>Add to Hot Offers to boost visibility</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── MENU ── */}
        {tab === "Menu" && (
          <div className="adm-content">
            <div className="adm-menu-toolbar">
              <input className="adm-search" placeholder="🔍 Search by name or category…" value={menuSearch} onChange={e => setMenuSearch(e.target.value)} />
              <select className="adm-select" value={menuCatFilter} onChange={e => setMenuCatFilter(e.target.value)}>
                <option value="All">All Categories</option>
                {MENU_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <select className="adm-select" value={menuSortBy} onChange={e => setMenuSortBy(e.target.value)}>
                <option value="name">Sort: Name A-Z</option>
                <option value="price_asc">Sort: Price ↑</option>
                <option value="price_desc">Sort: Price ↓</option>
                <option value="rating">Sort: Rating ↓</option>
                <option value="newest">Sort: Newest</option>
              </select>
              <button className="adm-btn-primary" onClick={() => setMenuForm({ name: "", category: "Veg Starters", subCategory: "", price: 0, calories: 0, serves: 1, rating: 4.0, description: "", imageUrl: "", veg: true, availability: true, isHotOffer: false })}>
                + Add Item
              </button>
            </div>

            {selectedItems.size > 0 && (
              <div className="adm-bulk-bar">
                <span>{selectedItems.size} selected</span>
                <button className="adm-btn-secondary" onClick={bulkToggle}>Toggle Availability</button>
                <button className="adm-btn-del" onClick={bulkDelete}>Delete Selected</button>
                <button className="adm-btn-secondary" onClick={() => setSelectedItems(new Set())}>✕ Clear</button>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="adm-menu-count">{sortedMenu.length} items</div>
              <div style={{ display: "flex", gap: 8, fontSize: "0.78rem", color: "var(--text-sub)" }}>
                <span>✅ {menuItems.filter(i => i.availability).length} available</span>
                <span>🔥 {menuItems.filter(i => i.isHotOffer).length} hot offers</span>
              </div>
            </div>

            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th><input type="checkbox" onChange={e => setSelectedItems(e.target.checked ? new Set(sortedMenu.map(i => i._id)) : new Set())} /></th>
                    <th>Image</th><th>Name</th><th>Category / Sub</th><th>Price</th><th>Rating</th><th>Type</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedMenu.map(item => (
                    <tr key={item._id} className={selectedItems.has(item._id) ? "adm-row-selected" : ""}>
                      <td><input type="checkbox" checked={selectedItems.has(item._id)} onChange={e => { const n = new Set(selectedItems); e.target.checked ? n.add(item._id) : n.delete(item._id); setSelectedItems(n); }} /></td>
                      <td><img src={item.imageUrl} alt={item.name} className="adm-thumb" onError={e => { e.target.src = "/footer-images/food.png"; }} /></td>
                      <td className="adm-item-name">{item.name}</td>
                      <td><span className="adm-badge">{item.category}</span><br /><span style={{ fontSize: "0.7rem", color: "var(--text-sub)" }}>{item.subCategory}</span></td>
                      <td className="adm-price">₹{item.price}</td>
                      <td><span className={item.rating < 3.5 ? "adm-badge adm-badge-warn" : "adm-badge adm-badge-veg"}>⭐{item.rating}</span></td>
                      <td>{item.veg ? <span className="adm-badge adm-badge-veg">Veg</span> : <span className="adm-badge adm-badge-nonveg">Non-Veg</span>}</td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <button className={`adm-toggle ${item.availability ? "on" : "off"}`} onClick={() => toggleAvail(item._id)}>{item.availability ? "✓ On" : "✗ Off"}</button>
                          {item.isHotOffer && <span className="adm-badge adm-badge-warn" style={{ fontSize: "0.6rem" }}>🔥 Hot</span>}
                        </div>
                      </td>
                      <td className="adm-actions">
                        <button className="adm-btn-edit" onClick={() => { setMenuForm({ ...item }); setPreviewImg(item.imageUrl || ""); }}>✏️ Edit</button>
                        <button className="adm-btn-del" onClick={() => deleteItem(item._id, item.name)}>🗑</button>
                      </td>
                    </tr>
                  ))}
                  {sortedMenu.length === 0 && <tr><td colSpan={9} className="adm-empty">No items match your filters</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {tab === "Users" && (
          <div className="adm-content">
            <div className="adm-menu-toolbar">
              <input className="adm-search" placeholder="🔍 Search users…" value={userSearch} onChange={e => setUserSearch(e.target.value)} />
              <span className="adm-menu-count">{filteredUsers.length} users</span>
            </div>
            <div className="adm-stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
              <StatCard label="Total Users" value={users.length} icon="👥" color={PRIMARY} />
              <StatCard label="Admins" value={users.filter(u => u.role === "admin").length} icon="🛡️" color="#dc2626" />
              <StatCard label="Regular Users" value={users.filter(u => u.role === "user").length} icon="👤" color="#059669" />
            </div>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead><tr><th>Avatar</th><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Change Role</th></tr></thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u._id}>
                      <td><div className="adm-user-avatar">{u.uname?.charAt(0).toUpperCase() || "U"}</div></td>
                      <td className="adm-item-name">{u.uname}</td>
                      <td style={{ fontSize: "0.8rem" }}>{u.uemail}</td>
                      <td><span className={`adm-badge ${u.role === "admin" ? "adm-badge-admin" : ""}`}>{u.role}</span></td>
                      <td style={{ fontSize: "0.78rem", color: "var(--text-sub)" }}>{u.createdDate || "—"}</td>
                      <td>
                        <select className="adm-select-sm" value={u.role} onChange={e => updateRole(u._id, e.target.value)}>
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── THEME ── */}
        {tab === "Theme" && (
          <div className="adm-content">
            <div className="adm-card">
              <h3 className="adm-card-title">🎨 App Theme Color</h3>
              <p className="adm-theme-desc">Changes all buttons, badges, highlights and accents across the entire app instantly.</p>
              <div className="adm-color-row">
                <input type="color" className="adm-color-input" value={themeColor} onChange={e => setThemeColor(e.target.value)} />
                <span className="adm-color-hex">{themeColor}</span>
                <button className="adm-btn-primary" onClick={() => applyTheme(themeColor)}>Apply Color</button>
                <button className="adm-btn-secondary" onClick={() => { setThemeColor("#e65100"); applyTheme("#e65100"); }}>Reset Orange</button>
                <button className="adm-btn-secondary" onClick={() => { setThemeColor("#4f46e5"); applyTheme("#4f46e5"); }}>Reset Admin Purple</button>
              </div>
              <div className="adm-color-presets">
                <p className="adm-preset-label">Quick Presets:</p>
                <div className="adm-preset-row">
                  {[["#e65100", "Orange (Default)"], ["#4f46e5", "Indigo"], ["#d32f2f", "Red"], ["#1565c0", "Blue"], ["#2e7d32", "Green"], ["#6a1b9a", "Purple"], ["#00838f", "Teal"], ["#f57f17", "Amber"], ["#4e342e", "Brown"], ["#37474f", "Slate"]].map(([c, label]) => (
                    <button key={c} className="adm-preset-swatch" style={{ background: c }} onClick={() => { setThemeColor(c); applyTheme(c); }} title={label} />
                  ))}
                </div>
              </div>
              <div className="adm-theme-preview">
                <p className="adm-preset-label">Live Preview:</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", padding: 16, background: "var(--bg-light)", borderRadius: 12, border: "1px solid var(--border-light)" }}>
                  <button style={{ background: themeColor, color: "#fff", border: "none", padding: "10px 24px", borderRadius: 12, fontWeight: 700, cursor: "pointer" }}>Button</button>
                  <span style={{ background: themeColor, color: "#fff", padding: "4px 14px", borderRadius: 20, fontWeight: 700, fontSize: "0.8rem" }}>Badge</span>
                  <span style={{ color: themeColor, fontWeight: 800, fontSize: "1.1rem" }}>₹299</span>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: themeColor, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>A</div>
                  <div style={{ height: 4, width: 120, borderRadius: 4, background: themeColor }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {tab === "Settings" && (
          <div className="adm-content">
            <div className="adm-card">
              <h3 className="adm-card-title">📧 Broadcast Newsletter</h3>
              <p style={{ fontSize: "0.82rem", color: "var(--text-sub)", marginBottom: 14 }}>Send an email to all newsletter subscribers.</p>
              <div className="adm-form-field" style={{ marginBottom: 12 }}>
                <label>Subject</label>
                <input type="text" value={newsletter.subject} onChange={e => setNewsletter({ ...newsletter, subject: e.target.value })} placeholder="e.g. New dishes this week!" />
              </div>
              <div className="adm-form-field" style={{ marginBottom: 14 }}>
                <label>Message Body</label>
                <textarea rows={4} value={newsletter.body} onChange={e => setNewsletter({ ...newsletter, body: e.target.value })} placeholder="Write your newsletter content here…" />
              </div>
              <button className="adm-btn-primary" onClick={sendNewsletter} disabled={sendingNewsletter}>
                {sendingNewsletter ? "Sending…" : "📤 Send to All Subscribers"}
              </button>
            </div>

            <div className="adm-card">
              <h3 className="adm-card-title">📢 Site Announcement Banner</h3>
              <p style={{ fontSize: "0.82rem", color: "var(--text-sub)", marginBottom: 14 }}>Show a banner to all users. Leave empty to hide.</p>
              <div className="adm-form-field" style={{ marginBottom: 14 }}>
                <label>Announcement Text</label>
                <input type="text" value={announcement} onChange={e => setAnnouncement(e.target.value)} placeholder="e.g. 🎉 Free delivery this weekend!" />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="adm-btn-primary" onClick={() => { localStorage.setItem("siteAnnouncement", announcement); window.dispatchEvent(new CustomEvent("announcementUpdate", { detail: announcement })); toast.success("Saved!"); }}>Save</button>
                <button className="adm-btn-secondary" onClick={() => { setAnnouncement(""); localStorage.removeItem("siteAnnouncement"); toast.info("Cleared"); }}>Clear</button>
              </div>
            </div>

            <div className="adm-card">
              <h3 className="adm-card-title">⚡ Quick Actions</h3>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button className="adm-btn-secondary" onClick={() => { load(); toast.info("Refreshed"); }}>↻ Refresh Data</button>
                <button className="adm-btn-secondary" onClick={() => navigate("/home")}>🏠 View Live Site</button>
                <button className="adm-btn-secondary" onClick={() => { const d = JSON.stringify({ analytics, menuCount: menuItems.length, userCount: users.length }, null, 2); const b = new Blob([d], { type: "application/json" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = "flavora-admin-export.json"; a.click(); }}>📥 Export Data (JSON)</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Menu Form Modal ── */}
      {menuForm && (
        <div className="adm-modal-overlay" onClick={() => { setMenuForm(null); setPreviewImg(""); }}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3>{menuForm._id ? "✏️ Edit: " + menuForm.name : "➕ Add New Item"}</h3>
              <button className="adm-modal-close" onClick={() => { setMenuForm(null); setPreviewImg(""); }}>✕</button>
            </div>
            <div className="adm-modal-body">
              {(previewImg || menuForm.imageUrl) && (
                <div style={{ textAlign: "center", marginBottom: 12 }}>
                  <img src={previewImg || menuForm.imageUrl} alt="preview" style={{ height: 90, borderRadius: 10, objectFit: "cover", border: "2px solid var(--border-light)" }} onError={e => { e.target.style.display = "none"; }} />
                </div>
              )}
              <div className="adm-form-grid">
                {[{ key: "name", label: "Item Name", type: "text" }, { key: "price", label: "Price (₹)", type: "number" }, { key: "calories", label: "Calories", type: "number" }, { key: "serves", label: "Serves", type: "number" }, { key: "rating", label: "Rating (0-5)", type: "number" }].map(({ key, label, type }) => (
                  <div key={key} className="adm-form-field">
                    <label>{label}</label>
                    <input type={type} value={menuForm[key] || ""} onChange={e => setMenuForm({ ...menuForm, [key]: type === "number" ? Number(e.target.value) : e.target.value })} />
                  </div>
                ))}
                <div className="adm-form-field">
                  <label>Image URL</label>
                  <input type="text" value={menuForm.imageUrl || ""} onChange={e => { setMenuForm({ ...menuForm, imageUrl: e.target.value }); setPreviewImg(e.target.value); }} placeholder="https://…" />
                </div>
                <div className="adm-form-field">
                  <label>Category</label>
                  <select value={menuForm.category || ""} onChange={e => setMenuForm({ ...menuForm, category: e.target.value })}>
                    {MENU_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="adm-form-field">
                  <label>Sub Category</label>
                  <input type="text" value={menuForm.subCategory || ""} onChange={e => setMenuForm({ ...menuForm, subCategory: e.target.value })} />
                </div>
                <div className="adm-form-field adm-form-full">
                  <label>Description</label>
                  <textarea rows={2} value={menuForm.description || ""} onChange={e => setMenuForm({ ...menuForm, description: e.target.value })} />
                </div>
                <div className="adm-form-checks">
                  {[["veg", "🥗 Vegetarian"], ["availability", "✅ Available"], ["isHotOffer", "🔥 Hot Offer"]].map(([k, l]) => (
                    <label key={k} className="adm-check-label">
                      <input type="checkbox" checked={!!menuForm[k]} onChange={e => setMenuForm({ ...menuForm, [k]: e.target.checked })} />{l}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="adm-modal-footer">
              <button className="adm-btn-secondary" onClick={() => { setMenuForm(null); setPreviewImg(""); }}>Cancel</button>
              <button className="adm-btn-primary" onClick={saveMenuItem}>{menuForm._id ? "Update Item" : "Create Item"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
