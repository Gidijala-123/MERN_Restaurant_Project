import MenuItem from "../models/MenuModel.js";
import Order from "../models/OrderModel.js";
import EmployeeModel from "../models/EmployeeModel.js";
import logger from "../logging/logger.js";

// ── Menu CRUD ──────────────────────────────────────────────

export const createMenuItem = async (req, res) => {
  try {
    const lastItem = await MenuItem.findOne().sort({ itemId: -1 }).lean();
    const nextId = lastItem ? lastItem.itemId + 1 : 1;
    const item = await MenuItem.create({ ...req.body, itemId: nextId });
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
    res.json({ status: "success", data: item });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// ── Analytics ─────────────────────────────────────────────

export const getAdminAnalytics = async (req, res) => {
  try {
    const [orders, menuItems, users] = await Promise.all([
      Order.find().lean(),
      MenuItem.find().lean(),
      EmployeeModel.find().select("uname uemail createdDate role").lean(),
    ]);

    // Total revenue & orders
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
    const topSellers = itemSales.slice(0, 5);
    const lowSellers = itemSales.slice(-5).reverse();

    // Revenue by day (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentOrders = orders.filter((o) => new Date(o.createdAt) >= thirtyDaysAgo);
    const revenueByDay = {};
    recentOrders.forEach((o) => {
      const day = new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      revenueByDay[day] = (revenueByDay[day] || 0) + (o.grandTotal || 0);
    });
    const revenueChart = Object.entries(revenueByDay)
      .map(([date, revenue]) => ({ date, revenue }))
      .slice(-14);

    // Category breakdown
    const categoryMap = {};
    menuItems.forEach((item) => {
      categoryMap[item.category] = (categoryMap[item.category] || 0) + 1;
    });
    const categoryChart = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    // Low rated items (rating < 3.5)
    const lowRated = menuItems
      .filter((i) => i.rating < 3.5)
      .sort((a, b) => a.rating - b.rating)
      .slice(0, 10)
      .map((i) => ({ id: i._id, name: i.name, rating: i.rating, category: i.category }));

    // Orders per category
    const categoryOrderMap = {};
    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const menuItem = menuItems.find((m) => m.name === item.title);
        const cat = menuItem?.category || "Unknown";
        categoryOrderMap[cat] = (categoryOrderMap[cat] || 0) + (item.cartQuantity || 1);
      });
    });
    const categoryOrders = Object.entries(categoryOrderMap)
      .map(([name, orders]) => ({ name, orders }))
      .sort((a, b) => b.orders - a.orders);

    res.json({
      status: "success",
      data: {
        summary: {
          totalRevenue: Math.round(totalRevenue),
          totalOrders,
          totalMenuItems: menuItems.length,
          totalUsers: users.length,
          avgOrderValue: totalOrders ? Math.round(totalRevenue / totalOrders) : 0,
        },
        topSellers,
        lowSellers,
        lowRated,
        revenueChart,
        categoryChart,
        categoryOrders,
        recentOrders: orders
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 10)
          .map((o) => ({
            id: o._id,
            paymentId: o.paymentId,
            userEmail: o.userEmail,
            grandTotal: o.grandTotal,
            items: o.items?.length || 0,
            date: o.createdAt,
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
    if (!["user", "admin"].includes(role))
      return res.status(400).json({ message: "Invalid role" });
    const user = await EmployeeModel.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-upassword");
    res.json({ status: "success", data: user });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
