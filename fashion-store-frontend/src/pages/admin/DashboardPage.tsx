import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores";
import {
  getDashboardReport,
  getOrderStatusReport,
  getInventoryReport,
  getSalesReport,
} from "@/api/reports";
import { ordersApi } from "@/api/orders";
import type {
  DashboardReport,
  OrderStatusReport,
  InventoryReport,
  SalesReport,
} from "@/api/reports";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type BackendOrderDTO = {
  orderId?: number;
  orderNumber?: string;
  customerId?: number;
  customerName?: string;
  orderDate?: string;
  status?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  subtotal?: number;
  shippingFee?: number;
  discountAmount?: number;
  totalAmount?: number;
  createdAt?: string;
};

type FrontendOrderRaw = {
  order_id?: number;
  order_number?: string;
  customer_id?: number;
  customer?: { full_name?: string };
  order_date?: string;
  status?: string;
  payment_status?: string;
  total_amount?: number;
  created_at?: string;
};

type RecentOrder = {
  order_id: number;
  order_number: string;
  customer_id: number;
  customerName?: string;
  order_date?: string;
  total_amount?: number;
  status?: string;
  payment_status?: string;
  created_at?: string;
};

export function DashboardPage() {
  const { user } = useAuthStore();
  const [report, setReport] = useState<DashboardReport | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatusReport | null>(
    null
  );
  const [inventory, setInventory] = useState<InventoryReport | null>(null);
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [datePreset, setDatePreset] = useState<
    "today" | "7d" | "30d" | "custom"
  >("30d");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");

  const currentRange = useMemo(() => {
    const now = new Date();
    const toStartOfDay = (d: Date) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
    const pick = () => {
      if (datePreset === "today") {
        const s = toStartOfDay(now);
        return { start: s, end: now };
      }
      if (datePreset === "7d") {
        const s = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return { start: s, end: now };
      }
      if (datePreset === "30d") {
        const s = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return { start: s, end: now };
      }
      if (customStart && customEnd) {
        return { start: new Date(customStart), end: new Date(customEnd) };
      }
      const s = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { start: s, end: now };
    };
    const { start, end } = pick();
    const startISO = start.toISOString();
    const endISO = end.toISOString();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const fmt = (d: Date) =>
      `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(
        d.getHours()
      )}:${pad(d.getMinutes())}`;
    const label = `${fmt(start)} - ${fmt(end)}`;
    return { startISO, endISO, label };
  }, [datePreset, customStart, customEnd]);

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatDateTime = (value?: string) => {
    if (!value) return "";
    try {
      return new Date(value).toLocaleString("vi-VN");
    } catch {
      return value;
    }
  };

  const translateOrderStatus = (status?: string) => {
    const statusMap: Record<string, string> = {
      PENDING: "Chờ xử lý",
      CONFIRMED: "Đã xác nhận",
      PROCESSING: "Đang xử lý",
      SHIPPING: "Đang giao",
      DELIVERED: "Đã giao",
      CANCELLED: "Đã hủy",
      RETURNED: "Đã trả",
    };
    return statusMap[status || ""] || status || "Không rõ";
  };

  const statusBadgeClass = (status?: string) => {
    switch (status) {
      case "PENDING":
      case "CONFIRMED":
      case "PROCESSING":
        return "bg-yellow-100 text-yellow-800";
      case "SHIPPING":
        return "bg-blue-100 text-blue-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
      case "RETURNED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Chuẩn hoá dữ liệu đơn hàng từ backend (camelCase) và frontend (snake_case) về dạng dùng trong UI
  const normalizeOrders = (
    items: Array<BackendOrderDTO | FrontendOrderRaw>
  ): RecentOrder[] => {
    return (items || []).map((o) => {
      const order_id =
        (o as FrontendOrderRaw).order_id ?? (o as BackendOrderDTO).orderId ?? 0;
      const order_number =
        (o as FrontendOrderRaw).order_number ??
        (o as BackendOrderDTO).orderNumber ??
        `#${order_id}`;
      const customer_id =
        (o as FrontendOrderRaw).customer_id ??
        (o as BackendOrderDTO).customerId ??
        0;
      const customerName =
        "customerName" in o
          ? (o as BackendOrderDTO).customerName
          : (o as FrontendOrderRaw).customer?.full_name;
      const rawDate =
        (o as FrontendOrderRaw).order_date ??
        (o as BackendOrderDTO).orderDate ??
        (o as FrontendOrderRaw).created_at ??
        (o as BackendOrderDTO).createdAt;
      const order_date = rawDate ? new Date(rawDate).toISOString() : undefined;
      const total_amount =
        (o as FrontendOrderRaw).total_amount ??
        (o as BackendOrderDTO).totalAmount;
      const status =
        (o as FrontendOrderRaw).status ?? (o as BackendOrderDTO).status;
      const payment_status =
        (o as FrontendOrderRaw).payment_status ??
        (o as BackendOrderDTO).paymentStatus;
      const created_at =
        (o as FrontendOrderRaw).created_at ?? (o as BackendOrderDTO).createdAt;
      return {
        order_id,
        order_number,
        customer_id,
        customerName,
        order_date,
        total_amount,
        status,
        payment_status,
        created_at,
      };
    });
  };

  useEffect(() => {
    let active = true;
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          dashboardData,
          orderStatusData,
          inventoryData,
          salesData,
          ordersList,
        ] = await Promise.all([
          getDashboardReport(),
          getOrderStatusReport(),
          getInventoryReport(),
          getSalesReport(currentRange.startISO, currentRange.endISO),
          ordersApi.list(),
        ]);

        if (!active) return;
        setReport(dashboardData);
        setOrderStatus(orderStatusData);
        setInventory(inventoryData);
        setSalesReport(salesData);
        const normalized = normalizeOrders(ordersList);
        const topRecent = normalized
          .sort((a, b) => {
            const ad = a.order_date || a.created_at;
            const bd = b.order_date || b.created_at;
            return (
              new Date(bd as string).getTime() -
              new Date(ad as string).getTime()
            );
          })
          .slice(0, 5);
        setRecentOrders(topRecent);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError(
          err instanceof Error ? err.message : "Không thể tải dữ liệu dashboard"
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDashboardData();
    return () => {
      active = false;
    };
  }, [currentRange.startISO, currentRange.endISO]);

  const menuItems = [
    {
      title: "Quản lý sản phẩm",
      icon: "📦",
      path: "/admin/products",
      permission: "VIEW_PRODUCTS",
      description: "Quản lý danh sách sản phẩm, thêm mới, chỉnh sửa",
    },
    {
      title: "Quản lý đơn hàng",
      icon: "🛒",
      path: "/admin/orders",
      permission: "VIEW_ORDERS",
      description: "Xem và xử lý đơn hàng",
    },
    {
      title: "Quản lý khách hàng",
      icon: "👥",
      path: "/admin/customers",
      permission: "VIEW_CUSTOMERS",
      description: "Quản lý thông tin khách hàng",
    },
    {
      title: "Quản lý kho",
      icon: "📊",
      path: "/admin/inventory",
      permission: "VIEW_INVENTORY",
      description: "Quản lý tồn kho và nhập xuất",
    },
    {
      title: "Báo cáo",
      icon: "📈",
      path: "/admin/reports",
      permission: "VIEW_REPORTS",
      description: "Xem báo cáo bán hàng và thống kê",
    },
    {
      title: "Quản lý người dùng",
      icon: "⚙️",
      path: "/admin/users",
      permission: "MANAGE_USERS",
      description: "Quản lý tài khoản và phân quyền",
    },
  ];

  const hasPermission = (permission: string) => {
    return user?.permissions?.includes(permission);
  };

  const allowedMenuItems = menuItems.filter((item) =>
    hasPermission(item.permission)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Bảng điều khiển Admin
          </h1>
          <p className="mt-2 text-gray-600">
            Xin chào, {user?.fullName} ({user?.roleName})
          </p>
        </div>

        {/* Bộ lọc thời gian */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDatePreset("today")}
                className={`px-3 py-1 rounded-md border ${
                  datePreset === "today"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Hôm nay
              </button>
              <button
                type="button"
                onClick={() => setDatePreset("7d")}
                className={`px-3 py-1 rounded-md border ${
                  datePreset === "7d"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                7 ngày
              </button>
              <button
                type="button"
                onClick={() => setDatePreset("30d")}
                className={`px-3 py-1 rounded-md border ${
                  datePreset === "30d"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                30 ngày
              </button>
              <button
                type="button"
                onClick={() => setDatePreset("custom")}
                className={`px-3 py-1 rounded-md border ${
                  datePreset === "custom"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Tùy chọn
              </button>
            </div>
            <div className="flex items-center gap-2">
              {datePreset === "custom" && (
                <>
                  <input
                    type="datetime-local"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="px-3 py-2 border rounded-md text-sm"
                  />
                  <span className="text-gray-500">đến</span>
                  <input
                    type="datetime-local"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="px-3 py-2 border rounded-md text-sm"
                  />
                </>
              )}
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Phạm vi: {currentRange.label}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Products */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Sản phẩm</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? "..." : report?.totalProducts || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Total Orders (period) */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Đơn hàng (theo kỳ)
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loading
                    ? "..."
                    : salesReport?.totalOrders ?? report?.totalOrders ?? 0}
                </p>
              </div>
            </div>
          </div>

          {/* Total Customers */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Khách hàng</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? "..." : report?.totalCustomers || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Total Revenue (period) */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Doanh thu (theo kỳ)
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loading
                    ? "..."
                    : formatCurrency(
                        salesReport?.totalRevenue ?? report?.totalRevenue
                      )}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {currentRange.label}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Order Status Pie Chart */}
          {orderStatus && Object.keys(orderStatus).length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Trạng thái đơn hàng
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(orderStatus).map(
                      ([status, count]) => ({
                        name: translateOrderStatus(status),
                        value: count,
                      })
                    )}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    label={(props: any) =>
                      `${props.name}: ${(props.percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.entries(orderStatus).map((_, index) => {
                      const COLORS = [
                        "#0088FE",
                        "#00C49F",
                        "#FFBB28",
                        "#FF8042",
                        "#8884D8",
                        "#82CA9D",
                        "#FFC658",
                      ];
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      );
                    })}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Revenue Bar Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Doanh thu theo thời gian
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={salesReport?.dailySales?.map(item => ({
                  name: new Date(item.date).toLocaleDateString('vi-VN'),
                  revenue: item.revenue,
                }))}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="revenue" fill="#8b5cf6" name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Status Section */}
        {inventory && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Tình trạng kho hàng
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600">
                  Tổng số biến thể
                </p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {inventory.totalVariants}
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600">
                  Hàng sắp hết
                </p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {inventory.lowStockCount}
                </p>
              </div>
            </div>

            {inventory.lowStockItems && inventory.lowStockItems.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Sản phẩm hàng sắp hết
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-gray-600">
                          SKU
                        </th>
                        <th className="px-4 py-2 text-left text-gray-600">
                          Tồn kho hiện tại
                        </th>
                        <th className="px-4 py-2 text-left text-gray-600">
                          Tối thiểu
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.lowStockItems.map((item) => (
                        <tr
                          key={item.variantId}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="px-4 py-2">{item.sku}</td>
                          <td className="px-4 py-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              {item.currentStock}
                            </span>
                          </td>
                          <td className="px-4 py-2">{item.minThreshold}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Orders */}
        {hasPermission("VIEW_ORDERS") && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Đơn hàng gần đây
              </h2>
              <Link
                to="/admin/orders"
                className="text-sm text-indigo-600 hover:underline"
              >
                Xem tất cả
              </Link>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-sm text-gray-500">Đang tải...</div>
              ) : recentOrders.length === 0 ? (
                <div className="text-sm text-gray-500">
                  Chưa có đơn hàng nào.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-600">
                        Mã đơn
                      </th>
                      <th className="px-4 py-2 text-left text-gray-600">
                        Khách hàng
                      </th>
                      <th className="px-4 py-2 text-left text-gray-600">
                        Ngày
                      </th>
                      <th className="px-4 py-2 text-left text-gray-600">
                        Trạng thái
                      </th>
                      <th className="px-4 py-2 text-right text-gray-600">
                        Tổng
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((o) => {
                      const code = o.order_number || `#${o.order_id}`;
                      const customerName =
                        o.customerName || `KH#${o.customer_id}`;
                      const dateStr = o.order_date || o.created_at;
                      return (
                        <tr
                          key={o.order_id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="px-4 py-2">
                            <Link
                              to={`/admin/orders?highlight=${o.order_id}`}
                              className="text-indigo-600 hover:underline"
                            >
                              {code}
                            </Link>
                          </td>
                          <td className="px-4 py-2">{customerName}</td>
                          <td className="px-4 py-2">
                            {formatDateTime(dateStr)}
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass(
                                String(o.status)
                              )}`}
                            >
                              {translateOrderStatus(String(o.status))}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-right">
                            {formatCurrency(o.total_amount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Chức năng quản lý
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allowedMenuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-start">
                  <div className="text-4xl mr-4">{item.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
