import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, AlertTriangle, X, CheckCircle } from "lucide-react";
import { useCartStore } from "@/stores";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

export function CartPage() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart, total } =
    useCartStore();

  const shippingFee = total >= 500000 ? 0 : 30000;
  const finalTotal = total + shippingFee;
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleDeleteClick = (variantId: number) => {
    setItemToDelete(variantId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      removeItem(itemToDelete);
      setShowDeleteModal(false);
      setItemToDelete(null);
      showSuccessToast("Đã xóa sản phẩm khỏi giỏ hàng");
    }
  };

  const handleClearCartClick = () => {
    setShowClearModal(true);
  };

  const confirmClearCart = () => {
    clearCart();
    setShowClearModal(false);
    showSuccessToast("Đã xóa toàn bộ giỏ hàng");
  };

  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-20">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 mb-6">
            <ShoppingBag className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Giỏ hàng trống
          </h2>
          <p className="text-gray-600 mb-8">
            Bạn chưa có sản phẩm nào trong giỏ hàng
          </p>
          <Link to="/products" className="btn-primary px-8 py-3">
            Khám phá sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container py-8">
          <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng</h1>
          <p className="text-gray-600 mt-2">
            Bạn có {items.length} sản phẩm trong giỏ hàng
          </p>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const price = item.variant.salePrice || item.variant.price;
              const hasDiscount = !!item.variant.salePrice;

              return (
                <div key={item.variantId} className="card p-6">
                  <div className="flex gap-6">
                    {/* Image */}
                    <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      {item.product.images?.[0] ? (
                        <img
                          src={item.product.images[0].imageUrl}
                          alt={item.product.productName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
                          No image
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {item.product.productName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {item.variant.color} / {item.variant.size}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteClick(item.variantId)}
                          className="h-8 w-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity */}
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() =>
                              updateQuantity(item.variantId, item.quantity - 1)
                            }
                            className="h-10 w-10 flex items-center justify-center hover:bg-gray-50"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="h-10 w-12 flex items-center justify-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.variantId, item.quantity + 1)
                            }
                            disabled={
                              item.quantity >= item.variant.stockQuantity
                            }
                            className="h-10 w-10 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {formatCurrency(price * item.quantity)}
                          </p>
                          {hasDiscount && (
                            <p className="text-sm text-gray-500 line-through">
                              {formatCurrency(
                                item.variant.price * item.quantity
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Clear cart */}
            <button
              onClick={handleClearCartClick}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Xóa toàn bộ giỏ hàng
            </button>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-20">
              <h3 className="font-semibold text-gray-900 mb-6">
                Tóm tắt đơn hàng
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Tạm tính ({items.length} sản phẩm)</span>
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

                {total < 500000 && shippingFee > 0 && (
                  <p className="text-xs text-gray-600 bg-blue-50 p-3 rounded-lg">
                    Mua thêm {formatCurrency(500000 - total)} để được miễn phí
                    vận chuyển
                  </p>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-lg font-semibold text-gray-900">
                      Tổng cộng
                    </span>
                    <span className="text-2xl font-bold text-primary-600">
                      {formatCurrency(finalTotal)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="w-full btn-primary py-4 text-base mb-3"
              >
                Tiến hành thanh toán
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>

              <Link
                to="/products"
                className="block text-center text-sm text-gray-600 hover:text-primary-600"
              >
                Tiếp tục mua sắm
              </Link>

              {/* Trust badges */}
              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <svg
                    className="h-5 w-5 text-green-600"
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
                  <span>Thanh toán an toàn & bảo mật</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <svg
                    className="h-5 w-5 text-green-600"
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
                  <span>Đổi trả miễn phí trong 7 ngày</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Item Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Xóa sản phẩm
                </h3>
                <p className="text-sm text-gray-600">
                  Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng không?
                </p>
              </div>
              
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 rounded-lg font-medium text-white hover:bg-red-700 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Cart Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Xóa toàn bộ giỏ hàng
                </h3>
                <p className="text-sm text-gray-600">
                  Bạn có chắc chắn muốn xóa tất cả {items.length} sản phẩm trong giỏ hàng không? Thao tác này không thể hoàn tác.
                </p>
              </div>
              
              <button
                onClick={() => setShowClearModal(false)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowClearModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={confirmClearCart}
                className="flex-1 px-4 py-2.5 bg-red-600 rounded-lg font-medium text-white hover:bg-red-700 transition-colors"
              >
                Xóa tất cả
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showToast && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-5 duration-300">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 min-w-[320px]">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {toastMessage}
                </p>
              </div>
              
              <button
                onClick={() => setShowToast(false)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 animate-progress" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
