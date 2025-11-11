import { useState, useEffect } from "react";
import { MapPin, Plus, Edit2, Trash2, Star } from "lucide-react";
import { useAuthStore } from "@/stores";
import { customerApi } from "@/api/customers";
import type { CustomerAddress } from "@/api/customers";
import { AddressModal } from "./AddressModal";

export function AddressesTab() {
  const { user } = useAuthStore();
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(
    null
  );
  const [customerId, setCustomerId] = useState<number | null>(null);

  // Fetch customer ID từ email
  useEffect(() => {
    const fetchCustomerId = async () => {
      if (!user?.email) return;

      try {
        const customer = await customerApi.getByEmail(user.email);
        if (customer) {
          setCustomerId(customer.customer_id);
        }
      } catch (err) {
        console.error("Error fetching customer:", err);
      }
    };

    fetchCustomerId();
  }, [user?.email]);

  // Fetch addresses
  useEffect(() => {
    const loadAddresses = async () => {
      if (!customerId) return;

      try {
        setLoading(true);
        setError(null);
        const data = await customerApi.getAddresses(customerId);
        setAddresses(data);
      } catch (err: any) {
        setError("Không thể tải danh sách địa chỉ");
        console.error("Error loading addresses:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAddresses();
  }, [customerId]);

  const handleAdd = () => {
    setEditingAddress(null);
    setShowModal(true);
  };

  const handleEdit = (address: CustomerAddress) => {
    setEditingAddress(address);
    setShowModal(true);
  };

  const handleDelete = async (addressId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;

    try {
      await customerApi.deleteAddress(addressId);
      setAddresses(addresses.filter((a) => a.address_id !== addressId));
    } catch (err: any) {
      alert("Không thể xóa địa chỉ");
      console.error("Error deleting address:", err);
    }
  };

  const handleSetDefault = async (addressId: number) => {
    try {
      await customerApi.setDefaultAddress(addressId);
      // Reload addresses
      if (customerId) {
        const data = await customerApi.getAddresses(customerId);
        setAddresses(data);
      }
    } catch (err: any) {
      alert("Không thể đặt địa chỉ mặc định");
      console.error("Error setting default address:", err);
    }
  };

  const handleModalClose = async (saved: boolean) => {
    setShowModal(false);
    setEditingAddress(null);

    // Reload if saved
    if (saved && customerId) {
      const data = await customerApi.getAddresses(customerId);
      setAddresses(data);
    }
  };

  if (loading) {
    return (
      <div className="card p-8">
        <p className="text-center text-gray-600">Đang tải...</p>
      </div>
    );
  }

  return (
    <>
      <div className="card p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Địa chỉ của tôi</h2>
          <button onClick={handleAdd} className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Thêm địa chỉ mới
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {addresses.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Bạn chưa có địa chỉ nào. Thêm địa chỉ để dễ dàng thanh toán hơn.
            </p>
            <button onClick={handleAdd} className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Thêm địa chỉ đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {addresses.map((address) => (
              <div
                key={address.address_id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow relative"
              >
                {address.is_default && (
                  <span className="absolute top-4 right-4 flex items-center gap-1 text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                    <Star className="h-3 w-3 fill-current" />
                    Mặc định
                  </span>
                )}

                <div className="pr-24">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {address.recipient_name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">{address.phone}</p>
                  <p className="text-gray-700">
                    {address.address_line}, {address.ward}, {address.district},{" "}
                    {address.city}
                  </p>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEdit(address)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Sửa
                  </button>
                  {!address.is_default && (
                    <>
                      <button
                        onClick={() => handleSetDefault(address.address_id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-yellow-600 hover:bg-yellow-50 rounded"
                      >
                        <Star className="h-3.5 w-3.5" />
                        Đặt mặc định
                      </button>
                      <button
                        onClick={() => handleDelete(address.address_id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Xóa
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && customerId && (
        <AddressModal
          customerId={customerId}
          address={editingAddress}
          onClose={handleModalClose}
        />
      )}
    </>
  );
}
