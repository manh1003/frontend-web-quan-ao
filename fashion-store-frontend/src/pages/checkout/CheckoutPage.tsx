import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, CreditCard, Truck, MapPin, Plus } from "lucide-react";
import { useCartStore, useAuthStore } from "@/stores";
import { ordersApi, customerApi } from "@/api";
import { formatCurrency } from "@/lib/utils";
import { useVietnamAddress } from "@/hooks/useVietnamAddress";
import type { CustomerAddress } from "@/types";

const checkoutSchema = z.object({
  recipient_name: z.string().min(2, "Tên người nhận phải có ít nhất 2 ký tự"),
  phone: z.string().regex(/^[0-9]{10}$/, "Số điện thoại không hợp lệ"),
  city: z.string().min(1, "Vui lòng chọn Tỉnh/Thành phố"),
  district: z.string().min(1, "Vui lòng chọn Quận/Huyện"),
  ward: z.string().min(1, "Vui lòng chọn Phường/Xã"),
  address_line: z.string().min(5, "Địa chỉ phải có ít nhất 5 ký tự"),
  payment_method: z.enum(["COD", "BANK_TRANSFER", "CREDIT_CARD"]),
  shipping_method: z.string().min(1, "Vui lòng chọn phương thức vận chuyển"),
  notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  // Vietnam Address Hook
  const {
    provinces,
    districts,
    wards,
    selectedProvince,
    selectedDistrict,
    selectedWard,
    setSelectedProvince,
    setSelectedDistrict,
    setSelectedWard,
    getProvinceName,
    getDistrictName,
    getWardName,
    loading: addressLoading,
  } = useVietnamAddress();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      recipient_name: user?.fullName || "",
      phone: user?.phone || "",
      payment_method: "COD",
      shipping_method: "STANDARD",
    },
  });

  // Load saved addresses
  useEffect(() => {
    const loadSavedAddresses = async () => {
      if (!user?.email) return;
      
      try {
        const customer = await customerApi.getByEmail(user.email);
        if (customer) {
          const addresses = await customerApi.getAddresses(customer.customer_id);
          setSavedAddresses(addresses);
          
          // Auto-select default address if exists
          const defaultAddr = addresses.find(addr => addr.is_default);
          if (defaultAddr && addresses.length > 0) {
            setSelectedAddressId(defaultAddr.address_id);
            setUseNewAddress(false);
          }
        }
      } catch (err) {
        console.error("Error loading addresses:", err);
      }
    };

    loadSavedAddresses();
  }, [user?.email]);

  // Update form when selecting saved address
  useEffect(() => {
    if (!useNewAddress && selectedAddressId) {
      const selectedAddr = savedAddresses.find(
        addr => addr.address_id === selectedAddressId
      );
      if (selectedAddr) {
        setValue("recipient_name", selectedAddr.recipient_name);
        setValue("phone", selectedAddr.phone);
        setValue("address_line", selectedAddr.address_line);
        setValue("ward", selectedAddr.ward);
        setValue("district", selectedAddr.district);
        setValue("city", selectedAddr.city);
      }
    }
  }, [useNewAddress, selectedAddressId, savedAddresses, setValue]);

  // Update form values when address selections change
  useEffect(() => {
    if (selectedProvince) {
      setValue("city", getProvinceName(selectedProvince));
    }
  }, [selectedProvince, setValue, getProvinceName]);

  useEffect(() => {
    if (selectedDistrict) {
      setValue("district", getDistrictName(selectedDistrict));
    }
  }, [selectedDistrict, setValue, getDistrictName]);

  useEffect(() => {
    if (selectedWard) {
      setValue("ward", getWardName(selectedWard));
    }
  }, [selectedWard, setValue, getWardName]);

  const shippingMethod = watch("shipping_method");

  // Calculate fees
  const shippingFee =
    shippingMethod === "EXPRESS" ? 50000 : total >= 500000 ? 0 : 30000;
  const finalTotal = total + shippingFee;

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <p className="text-gray-600 mb-4">Giỏ hàng của bạn đang trống</p>
        <button onClick={() => navigate("/products")} className="btn-primary">
          Tiếp tục mua sắm
        </button>
      </div>
    );
  }

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      setLoading(true);
      setError(null);

      // Get user info
      if (!user?.userId || !user?.email) {
        setError("Vui lòng đăng nhập để đặt hàng");
        return;
      }

      // Step 1: Find or create customer
      let customerId: number;
      try {
        const existingCustomer = await customerApi.getByEmail(user.email);

        if (existingCustomer) {
          customerId = existingCustomer.customer_id;
        } else {
          const newCustomer = await customerApi.create({
            email: user.email,
            phone: user.phone || data.phone,
            fullName: user.fullName,
          });
          customerId = newCustomer.customer_id;
        }
      } catch (err) {
        console.error("Error finding/creating customer:", err);
        setError("Không thể tạo thông tin khách hàng. Vui lòng thử lại.");
        return;
      }

      // Step 2: Get or create shipping address
      let shippingAddressId: number;
      
      if (!useNewAddress && selectedAddressId) {
        // Use existing address
        shippingAddressId = selectedAddressId;
      } else {
        // Create new address
        const addressData = {
          customerId: customerId,
          recipientName: data.recipient_name,
          phone: data.phone,
          addressLine: data.address_line,
          ward: data.ward,
          district: data.district,
          city: data.city,
          isDefault: false,
        };

        const createdAddress = await customerApi.createAddress(addressData);
        shippingAddressId = createdAddress.address_id;
      }

      // Step 3: Create order with the address
      const orderData = {
        customer_id: customerId,
        shipping_address_id: shippingAddressId,
        shipping_method: data.shipping_method,
        payment_method: data.payment_method,
        items: items.map((item) => ({
          variant_id: item.variantId,
          quantity: item.quantity,
          unit_price: item.variant.salePrice || item.variant.price,
        })),
        subtotal: total,
        discount_amount: 0,
        shipping_fee: shippingFee,
        total_amount: finalTotal,
        notes: data.notes,
      };

      await ordersApi.create(orderData);

      // Clear cart and redirect
      clearCart();
      navigate("/orders?success=true");
    } catch (error) {
      console.error("Checkout error:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Không thể tạo đơn hàng. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container py-8">
          <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary-600" />
                Địa chỉ giao hàng
              </h2>

              {/* Address Selection Toggle */}
              {savedAddresses.length > 0 && (
                <div className="mb-6 space-y-3">
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setUseNewAddress(false)}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                        !useNewAddress
                          ? "border-primary-600 bg-primary-600 text-white"
                          : "border-gray-300 bg-white text-gray-700 hover:border-primary-300 hover:bg-gray-50"
                      }`}
                    >
                      Chọn địa chỉ có sẵn
                    </button>
                    <button
                      type="button"
                      onClick={() => setUseNewAddress(true)}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                        useNewAddress
                          ? "border-primary-600 bg-primary-600 text-white"
                          : "border-gray-300 bg-white text-gray-700 hover:border-primary-300 hover:bg-gray-50"
                      }`}
                    >
                      <Plus className="h-4 w-4 inline mr-1" />
                      Địa chỉ mới
                    </button>
                  </div>

                  {/* Saved Addresses List */}
                  {!useNewAddress && (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {savedAddresses.map((addr) => (
                        <label
                          key={addr.address_id}
                          className={`block p-4 border-2 rounded-lg cursor-pointer transition-all bg-white ${
                            selectedAddressId === addr.address_id
                              ? "border-primary-600 shadow-md"
                              : "border-gray-300 hover:border-primary-400 hover:shadow-sm"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="saved_address"
                              value={addr.address_id}
                              checked={selectedAddressId === addr.address_id}
                              onChange={() => setSelectedAddressId(addr.address_id)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-gray-900">
                                  {addr.recipient_name}
                                </p>
                                {addr.is_default && (
                                  <span className="text-xs px-2 py-0.5 bg-primary-600 text-white rounded font-medium">
                                    Mặc định
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-700 font-medium">{addr.phone}</p>
                              <p className="text-sm text-gray-800 mt-1">
                                {addr.address_line}
                              </p>
                              <p className="text-sm text-gray-700">
                                {addr.ward}, {addr.district}, {addr.city}
                              </p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* New Address Form */}
              {useNewAddress && (
                <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    Tên người nhận <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Nguyễn Văn A"
                    {...register("recipient_name")}
                  />
                  {errors.recipient_name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.recipient_name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    className="input"
                    placeholder="0123456789"
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label">
                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="input"
                    value={selectedProvince || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedProvince(value ? Number(value) : null);
                    }}
                    disabled={addressLoading.provinces}
                  >
                    <option value="">
                      {addressLoading.provinces
                        ? "Đang tải..."
                        : "Chọn Tỉnh/Thành phố"}
                    </option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.code}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                  <input type="hidden" {...register("city")} />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.city.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label">
                    Quận/Huyện <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="input"
                    value={selectedDistrict || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedDistrict(value ? Number(value) : null);
                    }}
                    disabled={!selectedProvince || addressLoading.districts}
                  >
                    <option value="">
                      {!selectedProvince
                        ? "Chọn Tỉnh/Thành phố trước"
                        : addressLoading.districts
                        ? "Đang tải..."
                        : "Chọn Quận/Huyện"}
                    </option>
                    {districts.map((district) => (
                      <option key={district.code} value={district.code}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                  <input type="hidden" {...register("district")} />
                  {errors.district && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.district.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label">
                    Phường/Xã <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="input"
                    value={selectedWard || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedWard(value ? Number(value) : null);
                    }}
                    disabled={!selectedDistrict || addressLoading.wards}
                  >
                    <option value="">
                      {!selectedDistrict
                        ? "Chọn Quận/Huyện trước"
                        : addressLoading.wards
                        ? "Đang tải..."
                        : "Chọn Phường/Xã"}
                    </option>
                    {wards.map((ward) => (
                      <option key={ward.code} value={ward.code}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                  <input type="hidden" {...register("ward")} />
                  {errors.ward && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.ward.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="label">
                    Địa chỉ cụ thể <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Số nhà, tên đường..."
                    {...register("address_line")}
                  />
                  {errors.address_line && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.address_line.message}
                    </p>
                  )}
                </div>
              </div>
              )}
            </div>

            {/* Shipping Method */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Truck className="h-5 w-5 mr-2 text-primary-600" />
                Phương thức vận chuyển
              </h2>

              <div className="space-y-3">
                <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                  <input
                    type="radio"
                    value="STANDARD"
                    {...register("shipping_method")}
                    className="mt-1 h-4 w-4 text-primary-600"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between">
                      <p className="font-medium text-gray-900">
                        Giao hàng tiêu chuẩn
                      </p>
                      <p className="font-semibold text-gray-900">
                        {total >= 500000 ? "Miễn phí" : formatCurrency(30000)}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Dự kiến giao: 3-5 ngày
                    </p>
                  </div>
                </label>

                <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                  <input
                    type="radio"
                    value="EXPRESS"
                    {...register("shipping_method")}
                    className="mt-1 h-4 w-4 text-primary-600"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between">
                      <p className="font-medium text-gray-900">
                        Giao hàng nhanh
                      </p>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(50000)}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Dự kiến giao: 1-2 ngày
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-primary-600" />
                Phương thức thanh toán
              </h2>

              <div className="space-y-3">
                <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                  <input
                    type="radio"
                    value="COD"
                    {...register("payment_method")}
                    className="mt-1 h-4 w-4 text-primary-600"
                  />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">
                      Thanh toán khi nhận hàng (COD)
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Thanh toán bằng tiền mặt khi nhận hàng
                    </p>
                  </div>
                </label>

                <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                  <input
                    type="radio"
                    value="BANK_TRANSFER"
                    {...register("payment_method")}
                    className="mt-1 h-4 w-4 text-primary-600"
                  />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">
                      Chuyển khoản ngân hàng
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Chuyển khoản qua VietQR hoặc số tài khoản
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Notes */}
            <div className="card p-6">
              <label className="label">Ghi chú đơn hàng (tùy chọn)</label>
              <textarea
                className="input resize-none"
                rows={4}
                placeholder="Ghi chú về đơn hàng, ví dụ: giao hàng giờ hành chính"
                {...register("notes")}
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-20">
              <h3 className="font-semibold text-gray-900 mb-6">
                Đơn hàng ({items.length} sản phẩm)
              </h3>

              {/* Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.variantId} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product.images?.[0] && (
                        <img
                          src={item.product.images[0].imageUrl}
                          alt={item.product.productName}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product.productName}
                      </p>
                      <p className="text-xs text-gray-600">
                        {item.variant.color} / {item.variant.size}
                      </p>
                      <p className="text-sm text-gray-900 mt-1">
                        {item.quantity} x{" "}
                        {formatCurrency(
                          item.variant.salePrice || item.variant.price
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-gray-700">
                  <span>Tạm tính</span>
                  <span className="font-medium">{formatCurrency(total)}</span>
                </div>

                <div className="flex justify-between text-gray-700">
                  <span>Phí vận chuyển</span>
                  <span className="font-medium">
                    {shippingFee === 0 ? (
                      <span className="text-green-600">Miễn phí</span>
                    ) : (
                      formatCurrency(shippingFee)
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-baseline border-t pt-3">
                  <span className="text-lg font-semibold text-gray-900">
                    Tổng cộng
                  </span>
                  <span className="text-2xl font-bold text-primary-600">
                    {formatCurrency(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-4 text-base mt-6"
              >
                {loading ? (
                  <>
                    <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-white border-r-transparent mr-2"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Đặt hàng
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
