import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { ordersApi } from "@/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AddressSelectionModal } from "@/components/AddressSelectionModal";
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

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await ordersApi.getById(parseInt(id));
      setOrder(data);
    } catch (error) {
      console.error("Error loading order:", error);
      setError("Không thể tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra xem có thể hủy đơn không (chỉ khi đơn đang chờ xác nhận)
  const canCancel = order?.status === "PENDING";

  // Kiểm tra xem có thể hoàn trả không (đã giao trong vòng 7 ngày)
  const canReturn = () => {
    if (!order || order.status !== "DELIVERED") return false;
    
    // Kiểm tra ngày giao hàng (giả sử có trường delivered_date, nếu không có thì dùng order_date)
    const deliveredDate = new Date(order.order_date); // Thay bằng delivered_date nếu có
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysDiff <= 7;
  };

  const handleCancelOrder = async () => {
    if (!order || !cancelReason.trim()) {
      alert("Vui lòng nhập lý do hủy đơn");
      return;
    }

    if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
      return;
    }

    try {
      setActionLoading(true);
      await ordersApi.cancel(order.order_id, cancelReason);
      alert("Đã hủy đơn hàng thành công!");
      setShowCancelModal(false);
      loadOrder(); // Reload để cập nhật trạng thái
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Không thể hủy đơn hàng. Vui lòng thử lại.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturnOrder = async () => {
    if (!order || !returnReason.trim()) {
      alert("Vui lòng nhập lý do hoàn trả");
      return;
    }

    if (!confirm("Bạn có chắc chắn muốn hoàn trả đơn hàng này?")) {
      return;
    }

    try {
      setActionLoading(true);
      await ordersApi.requestReturn(order.order_id, returnReason);
      alert("Đã gửi yêu cầu hoàn trả thành công! Chúng tôi sẽ liên hệ với bạn sớm.");
      setShowReturnModal(false);
      loadOrder(); // Reload để cập nhật trạng thái
    } catch (error) {
      console.error("Error returning order:", error);
      alert("Không thể gửi yêu cầu hoàn trả. Vui lòng thử lại.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container py-8">
          <div className="card p-6 text-center">
            <p className="text-red-600 mb-4">
              {error || "Không tìm thấy đơn hàng"}
            </p>
            <button onClick={() => navigate("/orders")} className="btn-primary">
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container py-6">
          <button
            onClick={() => navigate("/orders")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Quay lại
          </button>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Chi tiết đơn hàng #{order.order_number}
              </h1>
              <p className="text-gray-600 mt-1">
                Đặt ngày {formatDate(order.order_date)}
              </p>
            </div>

            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${status.color}`}
            >
              <StatusIcon className="h-5 w-5" />
              <span className="font-medium">{status.label}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Sản phẩm đã đặt
              </h2>

              {order.items && order.items.length > 0 ? (
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-4 pb-4 border-b last:border-0"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {item.product_name || "Sản phẩm"}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Số lượng: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(item.unit_price)}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Tổng:{" "}
                          {formatCurrency(item.unit_price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  Chi tiết sản phẩm sẽ hiển thị khi có dữ liệu
                </p>
              )}
            </div>

            {/* Shipping Address */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Địa chỉ giao hàng
                </h2>

                {/* Show edit button if order is PENDING or CONFIRMED */}
                {(order.status === "PENDING" ||
                  order.status === "CONFIRMED") && (
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Thay đổi
                  </button>
                )}
              </div>

              {order.shipping_address ? (
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">
                    {order.shipping_address.recipient_name}
                  </p>
                  <p className="text-gray-600">{order.shipping_address.phone}</p>
                  <p className="text-gray-600">
                    {order.shipping_address.address_line}
                  </p>
                  <p className="text-gray-600">
                    {order.shipping_address.ward},{" "}
                    {order.shipping_address.district}
                  </p>
                  <p className="text-gray-600">{order.shipping_address.city}</p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-500 mb-3">
                    Chưa có địa chỉ giao hàng
                  </p>
                  {(order.status === "PENDING" ||
                    order.status === "CONFIRMED") && (
                    <button
                      onClick={() => setShowAddressModal(true)}
                      className="btn-primary text-sm py-2 px-4"
                    >
                      Thêm địa chỉ
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Delivery Info */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Thông tin vận chuyển
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Phương thức vận chuyển</span>
                  <span className="font-medium text-gray-900">
                    {order.shipping_method === "STANDARD"
                      ? "Giao hàng tiêu chuẩn"
                      : order.shipping_method === "EXPRESS"
                      ? "Giao hàng nhanh"
                      : order.shipping_method}
                  </span>
                </div>

                {order.shipping_code && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã vận đơn</span>
                    <span className="font-medium text-primary-600">
                      {order.shipping_code}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Tóm tắt đơn hàng
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="text-gray-900">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="text-gray-900">
                    {formatCurrency(order.shipping_fee)}
                  </span>
                </div>

                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Giảm giá</span>
                    <span className="text-red-600">
                      -{formatCurrency(order.discount_amount)}
                    </span>
                  </div>
                )}

                <div className="border-t pt-3 flex justify-between">
                  <span className="font-semibold text-gray-900">Tổng cộng</span>
                  <span className="text-xl font-bold text-primary-600">
                    {formatCurrency(order.total_amount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Thanh toán
              </h2>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">Phương thức thanh toán</p>
                <p className="font-medium text-gray-900">
                  {order.payment_method === "COD"
                    ? "Thanh toán khi nhận hàng"
                    : order.payment_method === "BANK_TRANSFER"
                    ? "Chuyển khoản ngân hàng"
                    : order.payment_method}
                </p>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600">Trạng thái thanh toán</p>
                <p className="font-medium text-gray-900">
                  {order.payment_status === "PAID" ? (
                    <span className="text-green-600">✓ Đã thanh toán</span>
                  ) : order.payment_status === "UNPAID" ? (
                    <span className="text-yellow-600">⏱ Chưa thanh toán</span>
                  ) : order.payment_status === "REFUNDED" ? (
                    <span className="text-blue-600">↩ Đã hoàn tiền</span>
                  ) : (
                    "Chưa thanh toán"
                  )}
                </p>
              </div>
            </div>

            {/* Customer Info */}
            {order.customer && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Thông tin khách hàng
                </h2>

                <div className="space-y-2">
                  <p className="font-medium text-gray-900">
                    {order.customer.full_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.customer.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.customer.phone}
                  </p>
                </div>
              </div>
            )}

            {/* Notes */}
            {order.notes && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Ghi chú
                </h2>
                <p className="text-gray-600 text-sm">{order.notes}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Thao tác
              </h2>
              
              <div className="space-y-3">
                {/* Nút hủy đơn - chỉ hiện khi đơn đang chờ xác nhận */}
                {canCancel && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="w-full btn-outline border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 flex items-center justify-center gap-2"
                  >
                    <XCircle className="h-5 w-5" />
                    Hủy đơn hàng
                  </button>
                )}

                {/* Nút hoàn trả - chỉ hiện khi đã giao trong vòng 7 ngày */}
                {canReturn() && (
                  <button
                    onClick={() => setShowReturnModal(true)}
                    className="w-full btn-outline border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="h-5 w-5" />
                    Yêu cầu hoàn trả
                  </button>
                )}

                {!canCancel && !canReturn() && (
                  <p className="text-sm text-gray-500 text-center py-2">
                    Không có thao tác khả dụng
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address Selection Modal */}
      {showAddressModal && order && (
        <AddressSelectionModal
          orderId={order.order_id}
          currentAddressId={order.shipping_address_id}
          onClose={() => setShowAddressModal(false)}
          onUpdate={() => {
            loadOrder();
            setShowAddressModal(false);
          }}
        />
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Hủy đơn hàng
            </h3>
            <p className="text-gray-600 mb-4">
              Vui lòng cho chúng tôi biết lý do bạn muốn hủy đơn hàng này:
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 resize-none"
              rows={4}
              placeholder="Nhập lý do hủy đơn..."
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
                className="flex-1 btn-outline"
                disabled={actionLoading}
              >
                Đóng
              </button>
              <button
                onClick={handleCancelOrder}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                disabled={actionLoading || !cancelReason.trim()}
              >
                {actionLoading ? "Đang xử lý..." : "Xác nhận hủy"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Order Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Yêu cầu hoàn trả
            </h3>
            <p className="text-gray-600 mb-2">
              Bạn có thể hoàn trả đơn hàng trong vòng 7 ngày kể từ khi nhận hàng.
            </p>
            <p className="text-gray-600 mb-4">
              Vui lòng cho chúng tôi biết lý do hoàn trả:
            </p>
            <textarea
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 resize-none"
              rows={4}
              placeholder="Nhập lý do hoàn trả (sản phẩm lỗi, không đúng mô tả, v.v.)..."
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReturnModal(false);
                  setReturnReason("");
                }}
                className="flex-1 btn-outline"
                disabled={actionLoading}
              >
                Đóng
              </button>
              <button
                onClick={handleReturnOrder}
                className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
                disabled={actionLoading || !returnReason.trim()}
              >
                {actionLoading ? "Đang xử lý..." : "Gửi yêu cầu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
