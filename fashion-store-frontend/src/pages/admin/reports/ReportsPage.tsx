import { useEffect, useState, useMemo } from "react";
import {
  getDashboardReport,
  getSalesReport,
  getInventoryReport,
  getOrderStatusReport,
} from "@/api/reports";
import type {
  DashboardReport,
  SalesReport,
  InventoryReport,
  OrderStatusReport,
} from "@/api/reports";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type ReportType = "overview" | "sales" | "inventory" | "orders";

export function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>("overview");
  const [dashboardData, setDashboardData] = useState<DashboardReport | null>(
    null
  );
  const [salesData, setSalesData] = useState<SalesReport | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryReport | null>(
    null
  );
  const [orderStatusData, setOrderStatusData] =
    useState<OrderStatusReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "custom">(
    "30d"
  );
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");

  const currentRange = useMemo(() => {
    const now = new Date();
    const pick = () => {
      if (dateRange === "7d") {
        const s = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return { start: s, end: now };
      }
      if (dateRange === "30d") {
        const s = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return { start: s, end: now };
      }
      if (dateRange === "90d") {
        const s = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        return { start: s, end: now };
      }
      if (customStart && customEnd) {
        return { start: new Date(customStart), end: new Date(customEnd) };
      }
      const s = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { start: s, end: now };
    };
    const { start, end } = pick();
    return {
      startISO: start.toISOString(),
      endISO: end.toISOString(),
    };
  }, [dateRange, customStart, customEnd]);

  useEffect(() => {
    loadReportData();
  }, [activeReport, currentRange.startISO, currentRange.endISO]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashboard, sales, inventory, orderStatus] = await Promise.all([
        getDashboardReport(),
        getSalesReport(currentRange.startISO, currentRange.endISO),
        getInventoryReport(),
        getOrderStatusReport(),
      ]);

      setDashboardData(dashboard);
      setSalesData(sales);
      setInventoryData(inventory);
      setOrderStatusData(orderStatus);
    } catch (err) {
      console.error("Error loading report data:", err);
      setError(err instanceof Error ? err.message : "Không thể tải báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Translate order status to Vietnamese
  const translateStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      PENDING: "Chờ xử lý",
      PROCESSING: "Đang xử lý",
      CONFIRMED: "Đã xác nhận",
      SHIPPING: "Đang giao",
      DELIVERED: "Đã giao",
      CANCELLED: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
    "#FFC658",
  ];

  const dailySalesChartData = useMemo(() => {
    if (!salesData?.dailySales) return [];
    return salesData.dailySales.map(item => ({
      date: new Date(item.date).toLocaleDateString('vi-VN'),
      revenue: item.revenue,
    }));
  }, [salesData]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Báo cáo & Thống kê
          </h1>
          <p className="mt-2 text-gray-600">
            Phân tích dữ liệu kinh doanh chi tiết
          </p>
        </div>

        {/* Date Range Filter */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDateRange("7d")}
                className={`px-3 py-1 rounded-md border ${
                  dateRange === "7d"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                7 ngày
              </button>
              <button
                onClick={() => setDateRange("30d")}
                className={`px-3 py-1 rounded-md border ${
                  dateRange === "30d"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                30 ngày
              </button>
              <button
                onClick={() => setDateRange("90d")}
                className={`px-3 py-1 rounded-md border ${
                  dateRange === "90d"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                90 ngày
              </button>
              <button
                onClick={() => setDateRange("custom")}
                className={`px-3 py-1 rounded-md border ${
                  dateRange === "custom"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Tùy chọn
              </button>
            </div>
            {dateRange === "custom" && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                />
                <span className="text-gray-500">đến</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* Report Type Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveReport("overview")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeReport === "overview"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Tổng quan
            </button>
            <button
              onClick={() => setActiveReport("sales")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeReport === "sales"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Doanh thu
            </button>
            <button
              onClick={() => setActiveReport("inventory")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeReport === "inventory"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Tồn kho
            </button>
            <button
              onClick={() => setActiveReport("orders")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeReport === "orders"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Đơn hàng
            </button>
          </nav>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-indigo-600"></div>
            <p className="mt-2 text-gray-600">Đang tải báo cáo...</p>
          </div>
        ) : (
          <>
            {/* Overview Report */}
            {activeReport === "overview" && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">
                          Doanh thu
                        </p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {formatCurrency(dashboardData?.totalRevenue)}
                        </p>
                      </div>
                    </div>
                  </div>

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
                          Đơn hàng
                        </p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {dashboardData?.totalOrders || 0}
                        </p>
                      </div>
                    </div>
                  </div>

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
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">
                          Sản phẩm
                        </p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {dashboardData?.totalProducts || 0}
                        </p>
                      </div>
                    </div>
                  </div>

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
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">
                          Khách hàng
                        </p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {dashboardData?.totalCustomers || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Monthly Revenue */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Doanh thu theo tháng
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={dailySalesChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => formatCurrency(Number(value))}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#8b5cf6"
                          fill="#8b5cf6"
                          name="Doanh thu"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Order Status */}
                  {orderStatusData && (
                    <div className="bg-white rounded-lg shadow p-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Trạng thái đơn hàng
                      </h2>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={Object.entries(orderStatusData).map(
                              ([status, count]) => ({
                                name: translateStatus(status),
                                value: count,
                              })
                            )}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            label={((entry: any) =>
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              `${entry.name}: ${((entry.percent ?? 0) * 100).toFixed(0)}%`) as any}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {Object.entries(orderStatusData).map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sales Report */}
            {activeReport === "sales" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Tổng doanh thu
                    </h3>
                    <p className="text-3xl font-bold text-indigo-600">
                      {formatCurrency(salesData?.totalRevenue)}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Tổng đơn hàng
                    </h3>
                    <p className="text-3xl font-bold text-green-600">
                      {salesData?.totalOrders || 0}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Giá trị trung bình
                    </h3>
                    <p className="text-3xl font-bold text-purple-600">
                      {formatCurrency(
                        salesData?.additionalData?.averageOrderValue as number
                      )}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Biểu đồ doanh thu
                  </h2>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={dailySalesChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#8b5cf6"
                        name="Doanh thu"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Inventory Report */}
            {activeReport === "inventory" && inventoryData && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Tổng biến thể
                    </h3>
                    <p className="text-3xl font-bold text-blue-600">
                      {inventoryData.totalVariants}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Sản phẩm sắp hết hàng
                    </h3>
                    <p className="text-3xl font-bold text-red-600">
                      {inventoryData.lowStockCount}
                    </p>
                  </div>
                </div>

                {inventoryData.lowStockItems &&
                  inventoryData.lowStockItems.length > 0 && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                      <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                          Sản phẩm cần nhập thêm
                        </h2>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                SKU
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Tồn kho
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Ngưỡng tối thiểu
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Cần nhập
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {inventoryData.lowStockItems.map((item) => (
                              <tr
                                key={item.variantId}
                                className="hover:bg-gray-50"
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {item.sku}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                    {item.currentStock}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.minThreshold}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                                  {Math.max(
                                    0,
                                    item.minThreshold - item.currentStock
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* Orders Report */}
            {activeReport === "orders" && orderStatusData && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(orderStatusData).map(([status, count]) => (
                    <div
                      key={status}
                      className="bg-white rounded-lg shadow p-6"
                    >
                      <h3 className="text-sm font-medium text-gray-500 mb-2 uppercase">
                        {translateStatus(status)}
                      </h3>
                      <p className="text-3xl font-bold text-gray-900">
                        {count}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Phân bố trạng thái
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={Object.entries(orderStatusData).map(
                            ([status, count]) => ({
                              name: translateStatus(status),
                              value: count,
                            })
                          )}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {Object.entries(orderStatusData).map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Biểu đồ cột
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={Object.entries(orderStatusData).map(
                          ([status, count]) => ({
                            name: translateStatus(status),
                            value: count,
                          })
                        )}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="value"
                          fill="#8b5cf6"
                          name="Số đơn hàng"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
