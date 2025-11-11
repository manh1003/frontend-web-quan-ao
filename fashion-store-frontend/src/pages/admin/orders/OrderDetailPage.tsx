import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, MapPin, CreditCard, Truck, AlertCircle } from "lucide-react";
import { getOrderById, updateOrderStatus } from "@/api/orders";
import type { Order } from "@/types";

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  SHIPPING: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  RETURNED: "bg-gray-100 text-gray-800",
};

const statusLabels = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang xử lý",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã hủy",
  RETURNED: "Đã trả",
};

const statusFlow = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPING",
  "DELIVERED",
];

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      loadOrder(parseInt(id));
    }
  }, [id]);

  const loadOrder = async (orderId: number) => {
    try {
      setLoading(true);
      const data = await getOrderById(orderId);
      setOrder(data);
    } catch (error) {
      console.error("Error loading order:", error);
      alert("Không thể tải thông tin đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!order || !id) return;

    if (
      !confirm(
        `Bạn có chắc chắn muốn chuyển trạng thái sang "${
          statusLabels[newStatus as keyof typeof statusLabels]
        }"?`
      )
    ) {
      return;
    }

    try {
      setUpdating(true);
      await updateOrderStatus(parseInt(id), newStatus);

      // Reload order data from backend to get fresh data
      await loadOrder(parseInt(id));

      alert("Cập nhật trạng thái thành công!");
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Không thể cập nhật trạng thái đơn hàng");
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-600">Không tìm thấy đơn hàng</div>
      </div>
    );
  }

  const getCustomerName = () => {
    return order.customer_name || order.customer?.full_name || "N/A";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/orders")}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chi tiết đơn hàng
            </h1>
            <p className="text-gray-600 mt-1">Mã đơn: {order.order_number}</p>
          </div>
        </div>
        <span
          className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
            statusColors[order.status as keyof typeof statusColors]
          }`}
        >
          {statusLabels[order.status as keyof typeof statusLabels]}
        </span>
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Trạng thái đơn hàng</h2>
        <div className="flex justify-between items-center mb-6">
          {statusFlow.map((status, index) => {
            const currentIndex = statusFlow.indexOf(order.status);
            const isActive = index <= currentIndex;
            const isCurrent = status === order.status;

            return (
              <div key={status} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-400"
                    } ${isCurrent ? "ring-4 ring-blue-200" : ""}`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`text-xs mt-2 ${
                      isActive ? "text-gray-900 font-medium" : "text-gray-400"
                    }`}
                  >
                    {statusLabels[status as keyof typeof statusLabels]}
                  </span>
                </div>
                {index < statusFlow.length - 1 && (
                  <div
                    className={`h-1 flex-1 ${
                      index < currentIndex ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Status Actions */}
        {order.status !== "DELIVERED" &&
          order.status !== "CANCELLED" &&
          order.status !== "RETURNED" && (
            <div className="flex gap-2 pt-4 border-t">
              <span className="text-sm text-gray-600 mr-2">
                Chuyển trạng thái:
              </span>
              {statusFlow.map((status) => {
                const currentIndex = statusFlow.indexOf(order.status);
                const statusIndex = statusFlow.indexOf(status);
                if (statusIndex <= currentIndex) return null;

                return (
                  <button
                    key={status}
                    onClick={() => handleUpdateStatus(status)}
                    disabled={updating}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {statusLabels[status as keyof typeof statusLabels]}
                  </button>
                );
              })}
              <button
                onClick={() => handleUpdateStatus("CANCELLED")}
                disabled={updating}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Hủy đơn
              </button>
            </div>
          )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package size={20} />
            Thông tin khách hàng
          </h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Tên khách hàng:</span>
              <p className="font-medium">{getCustomerName()}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Email:</span>
              <p className="font-medium">{order.customer?.email || "N/A"}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Số điện thoại:</span>
              <p className="font-medium">{order.customer?.phone || "N/A"}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Ngày đặt hàng:</span>
              <p className="font-medium">{formatDate(order.order_date)}</p>
            </div>
          </div>
        </div>

        {/* Shipping Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin size={20} />
            Địa chỉ giao hàng
          </h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Người nhận:</span>
              <p className="font-medium">
                {order.shipping_address?.recipient_name || "N/A"}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Số điện thoại:</span>
              <p className="font-medium">
                {order.shipping_address?.phone || "N/A"}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Địa chỉ:</span>
              <p className="font-medium">
                {order.shipping_address
                  ? `${order.shipping_address.address_line}, ${order.shipping_address.ward}, ${order.shipping_address.district}, ${order.shipping_address.city}`
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CreditCard size={20} />
            Thông tin thanh toán
          </h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">
                Phương thức thanh toán:
              </span>
              <p className="font-medium">{order.payment_method || "N/A"}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Trạng thái:</span>
              <p className="font-medium">
                {order.payment_status === "PAID"
                  ? "Đã thanh toán"
                  : order.payment_status === "UNPAID"
                  ? "Chưa thanh toán"
                  : "Đã hoàn tiền"}
              </p>
            </div>
          </div>
        </div>

        {/* Shipping Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Truck size={20} />
            Thông tin vận chuyển
          </h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Phương thức:</span>
              <p className="font-medium">{order.shipping_method || "N/A"}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Mã vận đơn:</span>
              <p className="font-medium">{order.shipping_code || "Chưa có"}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Phí vận chuyển:</span>
              <p className="font-medium">
                {formatCurrency(order.shipping_fee)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel/Return Reason - Show prominently if order is cancelled or returned */}
      {order.status === "CANCELLED" && order.cancellation_reason && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle size={20} className="text-red-600" />
            <span className="text-red-900">Lý do hủy đơn</span>
          </h2>
          <div className="p-4 rounded-lg bg-white border border-red-200">
            <p className="text-gray-800 whitespace-pre-wrap">{order.cancellation_reason}</p>
          </div>
        </div>
      )}

      {order.status === "RETURNED" && order.return_reason && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle size={20} className="text-orange-600" />
            <span className="text-orange-900">Lý do hoàn trả</span>
          </h2>
          <div className="p-4 rounded-lg bg-white border border-orange-200">
            <p className="text-gray-800 whitespace-pre-wrap">{order.return_reason}</p>
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Package size={20} />
          Sản phẩm đã đặt
        </h2>
        {order.items && order.items.length > 0 ? (
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div
                key={item.order_detail_id || index}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {item.product_name || "N/A"}
                  </h3>
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    <span>SKU: {item.variant_sku || "N/A"}</span>
                    {item.color && <span>Màu: {item.color}</span>}
                    {item.size && <span>Size: {item.size}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    Số lượng: {item.quantity}
                  </div>
                  <div className="font-medium text-gray-900 mt-1">
                    {formatCurrency(item.unit_price)}
                  </div>
                  <div className="text-sm font-semibold text-blue-600 mt-1">
                    Tổng: {formatCurrency(item.unit_price * item.quantity)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            Không có sản phẩm trong đơn hàng
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Tạm tính:</span>
            <span className="font-medium">
              {formatCurrency(order.subtotal)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phí vận chuyển:</span>
            <span className="font-medium">
              {formatCurrency(order.shipping_fee)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Giảm giá:</span>
            <span className="font-medium text-red-600">
              -{formatCurrency(order.discount_amount)}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t text-lg font-bold">
            <span>Tổng cộng:</span>
            <span className="text-blue-600">
              {formatCurrency(order.total_amount)}
            </span>
          </div>
        </div>

        {/* Show notes for shipper */}
        {order.notes && (
          <div className="mt-4 pt-4 border-t">
            <span className="text-sm text-gray-600 font-medium">Ghi chú cho shipper:</span>
            <p className="mt-2 text-gray-800 bg-gray-50 p-3 rounded-lg">{order.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
