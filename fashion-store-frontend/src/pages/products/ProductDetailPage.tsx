import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  Minus,
  Plus,
  Star,
  Truck,
  Shield,
  ArrowLeft,
  CheckCircle,
  X,
} from "lucide-react";
import { productsApi } from "@/api";
import { useCartStore } from "@/stores";
import { formatCurrency } from "@/lib/utils";
import { ProductCard } from "@/components";
import type { Product, ProductVariant } from "@/types";

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCartStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (id) {
      loadProduct(Number(id));
    }
  }, [id]);

  const loadProduct = async (productId: number) => {
    try {
      setLoading(true);
      const data = await productsApi.getById(productId);
      setProduct(data);

      // Set default variant
      if (data.variants && data.variants.length > 0) {
        setSelectedVariant(data.variants[0]);
      }

      // Set default image
      const primaryImg = data.images?.find((img) => img.isPrimary);
      setSelectedImage(
        primaryImg?.imageUrl || data.images?.[0]?.imageUrl || ""
      );

      // Load related products
      loadRelatedProducts(productId);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Không thể tải sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedProducts = async (productId: number) => {
    try {
      setLoadingRelated(true);
      const related = await productsApi.getRelated(productId, 4);
      setRelatedProducts(related);
    } catch (err) {
      console.error("Failed to load related products:", err);
    } finally {
      setLoadingRelated(false);
    }
  };

  const handleAddToCart = () => {
    if (product && selectedVariant) {
      addItem(product, selectedVariant, quantity);
      
      // Show toast notification
      setShowToast(true);
      
      // Auto hide after 3 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
  };

  const handleBuyNow = () => {
    if (product && selectedVariant) {
      addItem(product, selectedVariant, quantity);
      navigate("/cart");
    }
  };

  if (loading) {
    return (
      <div className="container py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container py-20 text-center">
        <p className="text-red-600">{error || "Không tìm thấy sản phẩm"}</p>
        <button
          onClick={() => navigate("/products")}
          className="btn-primary mt-4"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const price = selectedVariant?.salePrice || selectedVariant?.price || 0;
  const hasDiscount = !!selectedVariant?.salePrice;
  const discountPercent = hasDiscount
    ? Math.round(
        ((selectedVariant!.price - selectedVariant!.salePrice!) /
          selectedVariant!.price) *
          100
      )
    : 0;

  // Group variants by color and size
  const colors = Array.from(
    new Set(product.variants?.map((v) => v.color).filter(Boolean))
  );
  const sizes = Array.from(
    new Set(product.variants?.map((v) => v.size).filter(Boolean))
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-5 duration-300">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 min-w-[320px] max-w-md">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              
              <div className="flex-1 pt-0.5">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  Đã thêm vào giỏ hàng!
                </h3>
                <p className="text-sm text-gray-600">
                  {product?.productName}
                  {selectedVariant?.color && ` - ${selectedVariant.color}`}
                  {selectedVariant?.size && ` - ${selectedVariant.size}`}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Số lượng: {quantity}
                </p>
                
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => navigate("/cart")}
                    className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    Xem giỏ hàng
                  </button>
                  <span className="text-gray-300">•</span>
                  <button
                    onClick={() => setShowToast(false)}
                    className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Tiếp tục mua sắm
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => setShowToast(false)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Progress bar */}
            <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 animate-progress"
                style={{
                  animation: 'progress 3s linear forwards'
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="container py-8">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate("/products")}
          className="flex items-center text-gray-600 hover:text-primary-600 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại danh sách sản phẩm
        </button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            {/* Main Image */}
            <div className="card overflow-hidden mb-4">
              <div className="aspect-square bg-gray-100">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={product.productName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-400">
                    Chưa có ảnh
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img) => (
                  <button
                    key={img.imageId}
                    onClick={() => setSelectedImage(img.imageUrl)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === img.imageUrl
                        ? "border-primary-600"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={img.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Brand */}
            {product.brand && (
              <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">
                {product.brand.brandName}
              </p>
            )}

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.productName}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < 4
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">(128 đánh giá)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-bold text-gray-900">
                {formatCurrency(price)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    {formatCurrency(selectedVariant!.price)}
                  </span>
                  <span className="px-2.5 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-lg">
                    -{discountPercent}%
                  </span>
                </>
              )}
            </div>

            {/* Variants */}
            <div className="space-y-6 mb-8">
              {/* Color */}
              {colors.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Màu sắc:{" "}
                    <span className="text-primary-600">
                      {selectedVariant?.color}
                    </span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => {
                      const variant = product.variants?.find(
                        (v) => v.color === color
                      );
                      const isSelected = selectedVariant?.color === color;
                      const isAvailable = variant && variant.stockQuantity > 0;

                      return (
                        <button
                          key={color}
                          onClick={() => variant && setSelectedVariant(variant)}
                          disabled={!isAvailable}
                          className={`px-6 py-2.5 rounded-lg border-2 font-medium transition-all ${
                            isSelected
                              ? "border-primary-600 bg-primary-600 text-white"
                              : isAvailable
                              ? "border-gray-300 hover:border-gray-400 text-gray-700"
                              : "border-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {color}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size */}
              {sizes.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Kích thước:{" "}
                    <span className="text-primary-600">
                      {selectedVariant?.size}
                    </span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => {
                      const variant = product.variants?.find(
                        (v) =>
                          v.size === size && v.color === selectedVariant?.color
                      );
                      const isSelected = selectedVariant?.size === size;
                      const isAvailable = variant && variant.stockQuantity > 0;

                      return (
                        <button
                          key={size}
                          onClick={() => variant && setSelectedVariant(variant)}
                          disabled={!isAvailable}
                          className={`h-12 w-12 rounded-lg border-2 font-medium transition-all ${
                            isSelected
                              ? "border-primary-600 bg-primary-600 text-white"
                              : isAvailable
                              ? "border-gray-300 hover:border-gray-400 text-gray-700"
                              : "border-gray-200 text-gray-400 cursor-not-allowed line-through"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Số lượng
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-12 w-12 flex items-center justify-center hover:bg-gray-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="h-12 w-16 flex items-center justify-center font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(
                        Math.min(
                          selectedVariant?.stockQuantity || 999,
                          quantity + 1
                        )
                      )
                    }
                    className="h-12 w-12 flex items-center justify-center hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-600">
                  {selectedVariant?.stockQuantity || 0} sản phẩm có sẵn
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                className="btn-outline flex-1 py-4 text-base"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Thêm vào giỏ
              </button>
              <button
                onClick={handleBuyNow}
                className="btn-primary flex-1 py-4 text-base"
              >
                Mua ngay
              </button>
              <button className="btn-outline h-14 w-14 p-0">
                <Heart className="h-5 w-5" />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 p-6 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Miễn phí vận chuyển
                  </p>
                  <p className="text-xs text-gray-600">Đơn từ 500k</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Đổi trả dễ dàng
                  </p>
                  <p className="text-xs text-gray-600">Trong 7 ngày</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="card p-8 mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Mô tả sản phẩm
            </h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            {product.material && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-2">Chất liệu</h3>
                <p className="text-gray-700">{product.material}</p>
              </div>
            )}

            {product.careInstructions && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Hướng dẫn bảo quản
                </h3>
                <p className="text-gray-700">{product.careInstructions}</p>
              </div>
            )}
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Sản Phẩm Liên Quan
              </h2>
            </div>
            
            {loadingRelated ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="card p-4 animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct.productId} product={relatedProduct} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
