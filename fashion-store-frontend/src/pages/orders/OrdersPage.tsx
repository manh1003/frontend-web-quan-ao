import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  ChevronRight,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
} from "lucide-react";
import { ordersApi, customerApi } from "@/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import type { Order } from "@/types";

const statusConfig = {
  PENDING: {
    label: "Chờ xác nhận",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    color: "bg-blue-100 text-blue-800",
    icon: CheckCircle,
  },
  PROCESSING: {
    label: "Đang xử lý",
    color: "bg-purple-100 text-purple-800",
    icon: Package,
  },
  SHIPPING: {
    label: "Đang giao hàng",
    color: "bg-indigo-100 text-indigo-800",
    icon: Truck,
  },
  DELIVERED: {
    label: "Đã giao hàng",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
  RETURNED: {
    label: "Đã trả hàng",
    color: "bg-gray-100 text-gray-800",
    icon: Package,
  },
};

export function OrdersPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get customer ID from logged in user's email
      if (!user?.email) {
        setError("Vui lòng đăng nhập để xem đơn hàng");
        return;
      }

      // Check if user is admin/staff - redirect to admin panel
      const staffRoles = [
        "ADMIN",
        "MANAGER",
        "SALES",
        "WAREHOUSE",
        "ACCOUNTANT",
      ];
      if (user.role && staffRoles.includes(user.role)) {
        navigate("/admin/orders");
        return;
      }

      const customer = await customerApi.getByEmail(user.email);
      if (!customer) {
        setError(
          "Không tìm thấy thông tin khách hàng. Vui lòng liên hệ hỗ trợ."
        );
        return;
      }

      const data = await ordersApi.getByCustomer(customer.customer_id);
      setOrders(data);
    } catch (err: any) {
      console.error("Error loading orders:", err);
      setError(err.response?.data?.message || "Không thể tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "ALL") return true;
    return order.status === filter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container py-8">
          <h1 className="text-3xl font-bold text-gray-900">Đơn hàng của tôi</h1>
          <p className="text-gray-600 mt-2">
            Theo dõi và quản lý đơn hàng của bạn
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { value: "ALL", label: "Tất cả" },
            { value: "PENDING", label: "Chờ xác nhận" },
            { value: "PROCESSING", label: "Đang xử lý" },
            { value: "SHIPPING", label: "Đang giao" },
            { value: "DELIVERED", label: "Đã giao" },
            { value: "CANCELLED", label: "Đã hủy" },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                filter === item.value
                  ? "bg-primary-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Đang tải đơn hàng...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="card p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button onClick={loadOrders} className="btn-primary mt-4">
              Thử lại
            </button>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && (
          <>
            {filteredOrders.length > 0 ? (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const status = statusConfig[order.status];
                  const StatusIcon = status.icon;

                  return (
                    <div key={order.order_id} className="card p-6">
                      {/* Header */}
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Mã đơn hàng</p>
                            <p className="font-semibold text-gray-900">
                              #{order.order_number}
                            </p>
                          </div>
                          <div
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${status.color}`}
                          >
                            <StatusIcon className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {status.label}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-gray-600">Ngày đặt</p>
                          <p className="font-medium text-gray-900">
                            {formatDate(order.order_date)}
                          </p>
                        </div>
                      </div>

                      {/* Items - TODO: Hiển thị order items */}
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Sản phẩm:</p>
                        <p className="text-gray-500 text-sm">
                          (Chi tiết sản phẩm sẽ hiển thị khi có OrderItem API)
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
                        <div>
                          <p className="text-sm text-gray-600">
                            Phương thức thanh toán
                          </p>
                          <p className="font-medium text-gray-900">
                            {order.payment_method === "COD"
                              ? "Thanh toán khi nhận hàng"
                              : "Chuyển khoản ngân hàng"}
                          </p>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Tổng tiền</p>
                            <p className="text-2xl font-bold text-primary-600">
                              {formatCurrency(order.total_amount)}
                            </p>
                          </div>

                          <button
                            onClick={() =>
                              navigate(`/orders/${order.order_id}`)
                            }
                            className="btn-outline px-4 py-2"
                          >
                            Chi tiết
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="card p-12 text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Không có đơn hàng
                </h3>
                <p className="text-gray-600 mb-6">
                  Bạn chưa có đơn hàng nào{" "}
                  {filter !== "ALL" && "ở trạng thái này"}
                </p>
                <button
                  onClick={() => setFilter("ALL")}
                  className="btn-outline mr-2"
                >
                  Xem tất cả
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
