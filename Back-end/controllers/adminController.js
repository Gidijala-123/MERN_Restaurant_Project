import MenuItem from "../models/MenuModel.js";
import Order from "../models/OrderModel.js";
import EmployeeModel from "../models/EmployeeModel.js";
import SubscriberModel from "../models/SubscriberModel.js";
import logger from "../logging/logger.js";

// ── In-memory activity log (resets on server restart; good enough for demo) ──
const activityLog = [];
const logActivity = (admin, action, detail = "") => {
  activityLog.unshift({ admin, action, detail, time: new Date().toISOString() });
  if (activityLog.length > 200) activityLog.pop();
};

// ── Menu CRUD ──────────────────────────────────────────────

export const createMenuItem = async (req, res) => {
  try {
    const lastItem = await MenuItem.findOne().sort({ itemId: -1 }).lean();
    const nextId = lastItem ? lastItem.itemId + 1 : 1;
    const item = await MenuItem.create({ ...req.body, itemId: nextId });
    logActivity(req.tokenKey?.uemail, "CREATE_ITEM", item.name);
    res.status(201).json({ status: "success", data: item });
  } catch (err) {
    logger.error("createMenuItem", err);
    res.status(400).json({ status: "error", message: err.message });
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ status: "error", message: "Item not found" });
    logActivity(req.tokenKey?.uemail, "UPDATE_ITEM", item.name);
    res.json({ status: "success", data: item });
  } catch (err) {
    logger.error("updateMenuItem", err);
    res.status(400).json({ status: "error", message: err.message });
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ status: "error", message: "Item not found" });
    logActivity(req.tokenKey?.uemail, "DELETE_ITEM", item.name);
    res.json({ status: "success", message: "Item deleted" });
  } catch (err) {
    logger.error("deleteMenuItem", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const toggleAvailability = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ status: "error", message: "Item not found" });
    item.availability = !item.availability;
    await item.save();
    logActivity(req.tokenKey?.uemail, item.availability ? "ENABLE_ITEM" : "DISABLE_ITEM", item.name);
    res.json({ status: "success", data: item });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// ── Orders management ─────────────────────────────────────

export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, email } = req.query;
    let query = {};
    if (email) query.userEmail = { $regex: email, $options: "i" };
    if (status) query.status = status;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    res.json({ status: "success", data: { orders, total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "preparing", "out_for_delivery", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) return res.status(400).json({ message: "Invalid status" });
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });
    logActivity(req.tokenKey?.uemail, "UPDATE_ORDER_STATUS", `${order._id} → ${status}`);
    res.json({ status: "success", data: order });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// ── Subscribers ───────────────────────────────────────────

export const getSubscribers = async (req, res) => {
  try {
    const subscribers = await SubscriberModel.find().sort({ createdAt: -1 }).lean();
    res.json({ status: "success", data: subscribers });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const deleteSubscriber = async (req, res) => {
  try {
    await SubscriberModel.findByIdAndDelete(req.params.id);
    logActivity(req.tokenKey?.uemail, "DELETE_SUBSCRIBER", req.params.id);
    res.json({ status: "success", message: "Subscriber removed" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// ── Activity log ──────────────────────────────────────────

export const getActivityLog = async (req, res) => {
  res.json({ status: "success", data: activityLog.slice(0, 50) });
};

// ── Analytics ─────────────────────────────────────────────

export const getAdminAnalytics = async (req, res) => {
  try {
    const [orders, menuItems, users] = await Promise.all([
      Order.find().lean(),
      MenuItem.find().lean(),
      EmployeeModel.find().select("uname uemail createdDate role").lean(),
    ]);

    const totalRevenue = orders.reduce((s, o) => s + (o.grandTotal || 0), 0);
    const totalOrders = orders.length;

    // Sales per item
    const itemSalesMap = {};
    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const key = item.title || item.id;
        if (!itemSalesMap[key]) itemSalesMap[key] = { title: key, qty: 0, revenue: 0 };
        itemSalesMap[key].qty += item.cartQuantity || 1;
        itemSalesMap[key].revenue += (item.price || 0) * (item.cartQuantity || 1);
      });
    });
    const itemSales = Object.values(itemSalesMap).sort((a, b) => b.qty - a.qty);

    // Revenue by day (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const revenueByDay = {};
    orders.filter(o => new Date(o.createdAt) >= thirtyDaysAgo).forEach((o) => {
      const day = new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      revenueByDay[day] = (revenueByDay[day] || 0) + (o.grandTotal || 0);
    });

    // Category breakdown
    const categoryMap = {};
    menuItems.forEach((item) => { categoryMap[item.category] = (categoryMap[item.category] || 0) + 1; });

    // Orders per category
    const categoryOrderMap = {};
    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const menuItem = menuItems.find((m) => m.name === item.title);
        const cat = menuItem?.category || "Unknown";
        categoryOrderMap[cat] = (categoryOrderMap[cat] || 0) + (item.cartQuantity || 1);
      });
    });

    // Revenue goal progress (monthly)
    const thisMonth = new Date(); thisMonth.setDate(1); thisMonth.setHours(0, 0, 0, 0);
    const monthlyRevenue = orders.filter(o => new Date(o.createdAt) >= thisMonth).reduce((s, o) => s + (o.grandTotal || 0), 0);

    // Order status breakdown
    const statusMap = { pending: 0, preparing: 0, out_for_delivery: 0, delivered: 0, cancelled: 0 };
    orders.forEach(o => { if (statusMap[o.status] !== undefined) statusMap[o.status]++; else statusMap.pending++; });

    res.json({
      status: "success",
      data: {
        summary: {
          totalRevenue: Math.round(totalRevenue),
          totalOrders,
          totalMenuItems: menuItems.length,
          totalUsers: users.length,
          avgOrderValue: totalOrders ? Math.round(totalRevenue / totalOrders) : 0,
          monthlyRevenue: Math.round(monthlyRevenue),
        },
        topSellers: itemSales.slice(0, 5),
        lowSellers: itemSales.slice(-5).reverse(),
        lowRated: menuItems.filter(i => i.rating < 3.5).sort((a, b) => a.rating - b.rating).slice(0, 10).map(i => ({ id: i._id, name: i.name, rating: i.rating, category: i.category })),
        revenueChart: Object.entries(revenueByDay).map(([date, revenue]) => ({ date, revenue })).slice(-14),
        categoryChart: Object.entries(categoryMap).map(([name, value]) => ({ name, value })),
        categoryOrders: Object.entries(categoryOrderMap).map(([name, orders]) => ({ name, orders })).sort((a, b) => b.orders - a.orders),
        orderStatusChart: Object.entries(statusMap).map(([name, value]) => ({ name, value })),
        recentOrders: orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10).map(o => ({
          id: o._id, paymentId: o.paymentId, userEmail: o.userEmail,
          grandTotal: o.grandTotal, items: o.items?.length || 0,
          date: o.createdAt, status: o.status || "pending",
        })),
      },
    });
  } catch (err) {
    logger.error("getAdminAnalytics", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    const users = await EmployeeModel.find().select("-upassword").lean();
    res.json({ status: "success", data: users });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) return res.status(400).json({ message: "Invalid role" });
    const user = await EmployeeModel.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-upassword");
    logActivity(req.tokenKey?.uemail, "UPDATE_USER_ROLE", `${user.uemail} → ${role}`);
    res.json({ status: "success", data: user });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
