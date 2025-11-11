import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { customerApi } from "@/api/customers";
import type { CustomerAddress } from "@/api/customers";
import { useVietnamAddress } from "@/hooks/useVietnamAddress";

interface AddressModalProps {
  customerId: number;
  address: CustomerAddress | null;
  onClose: (saved: boolean) => void;
}

export function AddressModal({
  customerId,
  address,
  onClose,
}: AddressModalProps) {
  const isEditing = !!address;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    recipientName: address?.recipient_name || "",
    phone: address?.phone || "",
    addressLine: address?.address_line || "",
    isDefault: address?.is_default || false,
  });

  // Vietnam address hook
  const {
    provinces,
    districts,
    wards,
    loadingProvinces,
    loadingDistricts,
    loadingWards,
    selectedProvince,
    selectedDistrict,
    selectedWard,
    setSelectedProvince,
    setSelectedDistrict,
    setSelectedWard,
    getProvinceName,
    getDistrictName,
    getWardName,
  } = useVietnamAddress();

  // Set initial address values for editing
  useEffect(() => {
    if (address) {
      // Find matching province
      const province = provinces.find((p) => p.name === address.city);
      if (province) {
        setSelectedProvince(province.code);
      }
    }
  }, [address, provinces]);

  useEffect(() => {
    if (address && districts.length > 0) {
      const district = districts.find((d) => d.name === address.district);
      if (district) {
        setSelectedDistrict(district.code);
      }
    }
  }, [address, districts]);

  useEffect(() => {
    if (address && wards.length > 0) {
      const ward = wards.find((w) => w.name === address.ward);
      if (ward) {
        setSelectedWard(ward.code);
      }
    }
  }, [address, wards]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!selectedProvince || !selectedDistrict || !selectedWard) {
      setError("Vui lòng chọn đầy đủ Tỉnh/Thành, Quận/Huyện, Phường/Xã");
      return;
    }

    try {
      setLoading(true);

      const addressData = {
        customerId,
        recipientName: formData.recipientName,
        phone: formData.phone,
        addressLine: formData.addressLine,
        ward: getWardName(),
        district: getDistrictName(),
        city: getProvinceName(),
        isDefault: formData.isDefault,
      };

      if (isEditing) {
        await customerApi.updateAddress(address.address_id, addressData);
      } else {
        await customerApi.createAddress(addressData);
      }

      onClose(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          `Không thể ${isEditing ? "cập nhật" : "thêm"} địa chỉ`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
          </h2>
          <button
            onClick={() => onClose(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {/* Tên người nhận */}
            <div>
              <label className="label">
                Tên người nhận <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="input"
                value={formData.recipientName}
                onChange={(e) =>
                  setFormData({ ...formData, recipientName: e.target.value })
                }
                required
              />
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="label">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                className="input"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
              />
            </div>

            {/* Tỉnh/Thành phố */}
            <div>
              <label className="label">
                Tỉnh/Thành phố <span className="text-red-500">*</span>
              </label>
              <select
                className="input"
                value={selectedProvince || ""}
                onChange={(e) => setSelectedProvince(Number(e.target.value))}
                disabled={loadingProvinces}
                required
              >
                <option value="">
                  {loadingProvinces ? "Đang tải..." : "Chọn Tỉnh/Thành phố"}
                </option>
                {provinces.map((province) => (
                  <option key={province.code} value={province.code}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Quận/Huyện */}
            <div>
              <label className="label">
                Quận/Huyện <span className="text-red-500">*</span>
              </label>
              <select
                className="input"
                value={selectedDistrict || ""}
                onChange={(e) => setSelectedDistrict(Number(e.target.value))}
                disabled={!selectedProvince || loadingDistricts}
                required
              >
                <option value="">
                  {!selectedProvince
                    ? "Chọn Tỉnh/Thành trước"
                    : loadingDistricts
                    ? "Đang tải..."
                    : "Chọn Quận/Huyện"}
                </option>
                {districts.map((district) => (
                  <option key={district.code} value={district.code}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Phường/Xã */}
            <div className="md:col-span-2">
              <label className="label">
                Phường/Xã <span className="text-red-500">*</span>
              </label>
              <select
                className="input"
                value={selectedWard || ""}
                onChange={(e) => setSelectedWard(Number(e.target.value))}
                disabled={!selectedDistrict || loadingWards}
                required
              >
                <option value="">
                  {!selectedDistrict
                    ? "Chọn Quận/Huyện trước"
                    : loadingWards
                    ? "Đang tải..."
                    : "Chọn Phường/Xã"}
                </option>
                {wards.map((ward) => (
                  <option key={ward.code} value={ward.code}>
                    {ward.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Địa chỉ cụ thể */}
            <div className="md:col-span-2">
              <label className="label">
                Địa chỉ cụ thể <span className="text-red-500">*</span>
              </label>
              <textarea
                className="input"
                rows={3}
                placeholder="Số nhà, tên đường..."
                value={formData.addressLine}
                onChange={(e) =>
                  setFormData({ ...formData, addressLine: e.target.value })
                }
                required
              />
            </div>

            {/* Đặt làm mặc định */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) =>
                    setFormData({ ...formData, isDefault: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">
                  Đặt làm địa chỉ mặc định
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading
                ? "Đang xử lý..."
                : isEditing
                ? "Cập nhật"
                : "Thêm địa chỉ"}
            </button>
            <button
              type="button"
              onClick={() => onClose(false)}
              className="btn-outline"
              disabled={loading}
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
