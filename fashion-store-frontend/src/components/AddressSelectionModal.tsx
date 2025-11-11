import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { customerApi, ordersApi } from "@/api";
import { useAuthStore } from "@/stores";
import type { CustomerAddress } from "@/types";

interface AddressSelectionModalProps {
  orderId: number;
  currentAddressId?: number;
  onClose: () => void;
  onUpdate: () => void;
}

export function AddressSelectionModal({
  orderId,
  currentAddressId,
  onClose,
  onUpdate,
}: AddressSelectionModalProps) {
  const { user } = useAuthStore();
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [selectedId, setSelectedId] = useState<number | undefined>(
    currentAddressId
  );
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.email) {
        setError("Vui lòng đăng nhập");
        return;
      }

      // Get customer ID from user email
      const customer = await customerApi.getByEmail(user.email);
      if (!customer) {
        setError("Không tìm thấy thông tin khách hàng");
        return;
      }

      // Load customer addresses
      const addressList = await customerApi.getAddresses(customer.customer_id);
      setAddresses(addressList);

      if (addressList.length === 0) {
        setError(
          "Bạn chưa có địa chỉ nào. Vui lòng thêm địa chỉ trong trang Hồ sơ."
        );
      }
    } catch (err: any) {
      console.error("Error loading addresses:", err);
      setError("Không thể tải danh sách địa chỉ");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedId) {
      alert("Vui lòng chọn địa chỉ");
      return;
    }

    try {
      setUpdating(true);
      await ordersApi.updateShippingAddress(orderId, selectedId);
      alert("Cập nhật địa chỉ giao hàng thành công!");
      onUpdate();
    } catch (error: any) {
      console.error("Error updating address:", error);
      const errorMessage =
        error.response?.data?.message || "Không thể cập nhật địa chỉ";
      alert(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            Chọn địa chỉ giao hàng
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={updating}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">
                Đang tải danh sách địa chỉ...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              {addresses.length === 0 && (
                <button
                  onClick={() =>
                    (window.location.href = "/profile?tab=addresses")
                  }
                  className="btn-primary"
                >
                  Thêm địa chỉ mới
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <label
                  key={addr.address_id}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedId === addr.address_id
                      ? "border-primary-600 bg-primary-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="address"
                      value={addr.address_id}
                      checked={selectedId === addr.address_id}
                      onChange={() => setSelectedId(addr.address_id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900">
                          {addr.recipient_name}
                        </p>
                        {addr.is_default && (
                          <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded">
                            Mặc định
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{addr.phone}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {addr.address_line}
                      </p>
                      <p className="text-sm text-gray-600">
                        {addr.ward}, {addr.district}, {addr.city}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && !error && addresses.length > 0 && (
          <div className="flex gap-3 p-6 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="btn-outline flex-1"
              disabled={updating}
            >
              Hủy
            </button>
            <button
              onClick={handleUpdate}
              className="btn-primary flex-1"
              disabled={
                updating || !selectedId || selectedId === currentAddressId
              }
            >
              {updating ? "Đang cập nhật..." : "Cập nhật địa chỉ"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}






