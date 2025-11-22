import { useEffect, useState } from "react";
import {
  promotionApi,
  type Coupon,
  type CreateCouponDto,
} from "@/api/promotions";

export function CouponsManagementPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [couponForm, setCouponForm] = useState<CreateCouponDto>({
    couponCode: "",
    couponName: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: 0,
    maxDiscountAmount: undefined,
    minOrderAmount: undefined,
    usageLimit: undefined,
    startDate: "",
    endDate: "",
    isActive: true,
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const data = await promotionApi.getAllCoupons();
      setCoupons(data);
    } catch (err) {
      console.error("Error loading coupons:", err);
      setError(
        err instanceof Error ? err.message : "Không thể tải danh sách coupon"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await promotionApi.createCoupon(couponForm);
      setShowForm(false);
      resetForm();
      loadCoupons();
    } catch (err) {
      console.error("Error creating coupon:", err);
      alert("Không thể tạo coupon");
    }
  };

  const resetForm = () => {
    setCouponForm({
      couponCode: "",
      couponName: "",
      description: "",
      discountType: "PERCENTAGE",
      discountValue: 0,
      maxDiscountAmount: undefined,
      minOrderAmount: undefined,
      usageLimit: undefined,
      startDate: "",
      endDate: "",
      isActive: true,
    });
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN");
    } catch {
      return dateStr;
    }
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const isActive = (coupon: Coupon) => {
    const now = new Date();
    const start = new Date(coupon.startDate);
    const end = new Date(coupon.endDate);
    return coupon.isActive && now >= start && now <= end;
  };

  const filteredCoupons = coupons.filter(
    (coupon) =>
      coupon.couponCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.couponName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCoupons = filteredCoupons.filter((c) => isActive(c));
  const expiredCoupons = filteredCoupons.filter((c) => isExpired(c.endDate));
  const usageRate = (coupon: Coupon) => {
    if (!coupon.usageLimit || coupon.usageLimit === 0) return 0;
    return (coupon.usedCount / coupon.usageLimit) * 100;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Coupons</h1>
          <p className="mt-2 text-gray-600">
            Quản lý mã giảm giá và khuyến mãi
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Tổng coupons
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {coupons.length}
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Đang hoạt động
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {activeCoupons.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Đã hết hạn</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {expiredCoupons.length}
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
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Tổng lượt dùng
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {coupons.reduce((sum, c) => sum + c.usedCount, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm theo mã coupon, tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Thêm Coupon
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Coupons Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-indigo-600"></div>
                <p className="mt-2 text-gray-600">Đang tải...</p>
              </div>
            ) : filteredCoupons.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Không tìm thấy coupon nào.
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã Coupon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giảm giá
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giá trị tối thiểu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sử dụng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời gian
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCoupons.map((coupon) => (
                    <tr key={coupon.couponId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                            {coupon.couponCode}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {coupon.couponName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {coupon.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {coupon.discountType === "PERCENTAGE"
                            ? `${coupon.discountValue}%`
                            : formatCurrency(coupon.discountValue)}
                        </div>
                        {coupon.maxDiscountAmount && (
                          <div className="text-sm text-gray-500">
                            Tối đa: {formatCurrency(coupon.maxDiscountAmount)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {coupon.minOrderAmount
                          ? formatCurrency(coupon.minOrderAmount)
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {coupon.usedCount} / {coupon.usageLimit || "∞"}
                        </div>
                        {coupon.usageLimit && (
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-indigo-600 h-2 rounded-full"
                              style={{
                                width: `${Math.min(usageRate(coupon), 100)}%`,
                              }}
                            />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(coupon.startDate)}
                        </div>
                        <div className="text-sm text-gray-500">
                          đến {formatDate(coupon.endDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            isActive(coupon)
                              ? "bg-green-100 text-green-800"
                              : isExpired(coupon.endDate)
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {isActive(coupon)
                            ? "Hoạt động"
                            : isExpired(coupon.endDate)
                            ? "Hết hạn"
                            : "Chưa bắt đầu"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Create Coupon Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Tạo Coupon mới
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateCoupon} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Mã Coupon <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={couponForm.couponCode}
                      onChange={(e) =>
                        setCouponForm({
                          ...couponForm,
                          couponCode: e.target.value.toUpperCase(),
                        })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                      placeholder="SUMMER2024"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tên Coupon <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={couponForm.couponName}
                      onChange={(e) =>
                        setCouponForm({
                          ...couponForm,
                          couponName: e.target.value,
                        })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Mô tả
                  </label>
                  <textarea
                    value={couponForm.description}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Loại giảm giá <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={couponForm.discountType}
                      onChange={(e) =>
                        setCouponForm({
                          ...couponForm,
                          discountType: e.target.value as
                            | "PERCENTAGE"
                            | "FIXED_AMOUNT",
                        })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="PERCENTAGE">Phần trăm (%)</option>
                      <option value="FIXED_AMOUNT">Số tiền cố định (₫)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Giá trị giảm <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step={
                        couponForm.discountType === "PERCENTAGE" ? "1" : "1000"
                      }
                      max={
                        couponForm.discountType === "PERCENTAGE"
                          ? "100"
                          : undefined
                      }
                      value={couponForm.discountValue}
                      onChange={(e) =>
                        setCouponForm({
                          ...couponForm,
                          discountValue: Number(e.target.value),
                        })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Giảm tối đa (₫)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={couponForm.maxDiscountAmount || ""}
                      onChange={(e) =>
                        setCouponForm({
                          ...couponForm,
                          maxDiscountAmount: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Đơn hàng tối thiểu (₫)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={couponForm.minOrderAmount || ""}
                      onChange={(e) =>
                        setCouponForm({
                          ...couponForm,
                          minOrderAmount: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Giới hạn sử dụng
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={couponForm.usageLimit || ""}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        usageLimit: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Để trống nếu không giới hạn"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Ngày bắt đầu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={couponForm.startDate}
                      onChange={(e) =>
                        setCouponForm({
                          ...couponForm,
                          startDate: e.target.value,
                        })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Ngày kết thúc <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={couponForm.endDate}
                      onChange={(e) =>
                        setCouponForm({
                          ...couponForm,
                          endDate: e.target.value,
                        })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={couponForm.isActive}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        isActive: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Kích hoạt ngay
                  </label>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Tạo Coupon
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
