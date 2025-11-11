import { Link } from "react-router-dom";
import { ShoppingCart, Heart, Star, Sparkles, Eye } from "lucide-react";
import type { Product, ProductVariant } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/stores";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const [imageError, setImageError] = useState(false);

  // Lấy variant đầu tiên hoặc variant có giá thấp nhất
  const defaultVariant = product.variants?.[0] as ProductVariant | undefined;

  // Lấy ảnh primary, nếu không có thì lấy ảnh đầu tiên
  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.imageUrl ||
    product.images?.[0]?.imageUrl;

  // Lấy ảnh phụ (không phải primary) hoặc ảnh thứ 2
  const secondaryImage =
    product.images?.find((img) => !img.isPrimary)?.imageUrl ||
    product.images?.[1]?.imageUrl;

  // Sử dụng giá mặc định 0 nếu không có variant
  const price = defaultVariant
    ? defaultVariant.salePrice || defaultVariant.price
    : 0;
  const hasDiscount = defaultVariant ? !!defaultVariant.salePrice : false;
  const discountPercent =
    hasDiscount && defaultVariant
      ? Math.round(
          ((defaultVariant.price - (defaultVariant.salePrice || 0)) /
            defaultVariant.price) *
            100
        )
      : 0;

  // Kiểm tra sản phẩm mới (trong vòng 7 ngày)
  const isNew = () => {
    const createdDate = new Date(product.createdAt);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays <= 7;
  };

  // Kiểm tra tồn kho thấp
  const isLowStock =
    defaultVariant &&
    defaultVariant.stockQuantity > 0 &&
    defaultVariant.stockQuantity <= defaultVariant.minStockThreshold;
  const isOutOfStock = defaultVariant && defaultVariant.stockQuantity === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (defaultVariant && !isOutOfStock) {
      addItem(product, defaultVariant, 1);
    }
  };

  return (
    <Link
      to={`/products/${product.productId}`}
      className="group flex flex-col h-full bg-white rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-primary-200 relative"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {/* Main Image */}
        {primaryImage && !imageError ? (
          <div className="relative h-full w-full">
            <img
              src={primaryImage}
              alt={product.productName}
              className="absolute inset-0 h-full w-full object-cover group-hover:opacity-0 transition-opacity duration-500"
              onError={() => setImageError(true)}
            />
            {/* Secondary image on hover */}
            {secondaryImage && (
              <img
                src={secondaryImage}
                alt={`${product.productName} - view 2`}
                className="absolute inset-0 h-full w-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />
            )}
          </div>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-gray-400">
            <Eye className="h-12 w-12 mb-2 opacity-30" />
            <span className="text-sm">Chưa có ảnh</span>
          </div>
        )}

        {/* Badges Container - Top Left */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {/* New Badge */}
          {isNew() && (
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 animate-pulse">
              <Sparkles className="h-3 w-3" />
              MỚI
            </div>
          )}

          {/* Discount Badge */}
          {hasDiscount && discountPercent > 0 && (
            <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
              -{discountPercent}%
            </div>
          )}

          {/* Low Stock Badge */}
          {isLowStock && (
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
              SẮP HẾT
            </div>
          )}

          {/* Out of Stock Badge */}
          {isOutOfStock && (
            <div className="bg-gray-800 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
              HẾT HÀNG
            </div>
          )}
        </div>

        {/* Quick Actions - Top Right */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <button
            onClick={(e) => {
              e.preventDefault();
              // TODO: Add to wishlist
            }}
            className="h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-primary-500 hover:text-white transition-all duration-300 hover:scale-110"
            title="Thêm vào yêu thích"
          >
            <Heart className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              // Quick view functionality
            }}
            className="h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-primary-500 hover:text-white transition-all duration-300 hover:scale-110"
            title="Xem nhanh"
          >
            <Eye className="h-5 w-5" />
          </button>
        </div>

        {/* Overlay gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Add to cart button - Bottom overlay */}
        {defaultVariant && !isOutOfStock && (
          <div className="absolute bottom-0 inset-x-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white py-3 rounded-xl font-semibold shadow-xl flex items-center justify-center gap-2 transform hover:scale-105 transition-all duration-200"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>THÊM VÀO GIỎ</span>
            </button>
          </div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute bottom-0 inset-x-0 p-4 bg-gray-900/80 backdrop-blur-sm">
            <div className="text-white text-center font-semibold py-2">
              Tạm thời hết hàng
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Top Section - Fixed height */}
        <div className="flex-shrink-0">
          {/* Brand & Rating Row */}
          <div className="flex items-center justify-between mb-2 h-5">
            {product.brand && (
              <span className="text-xs text-primary-600 font-bold uppercase tracking-wider">
                {product.brand.brandName}
              </span>
            )}
            {/* Rating - Placeholder for future */}
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium text-gray-600">4.8</span>
            </div>
          </div>

          {/* Title - Fixed height for 2 lines */}
          <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors leading-snug h-[3rem]">
            {product.productName}
          </h3>
        </div>

        {/* Bottom Section - Price & Info */}
        <div className="mt-auto flex-shrink-0">
          {/* Price Section - Fixed height */}
          <div className="mb-3 h-[4.5rem] flex flex-col justify-end">
            {defaultVariant ? (
              <>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-2xl font-bold text-primary-600 whitespace-nowrap">
                    {formatCurrency(price)}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-gray-400 line-through font-medium whitespace-nowrap">
                      {formatCurrency(defaultVariant.price)}
                    </span>
                  )}
                </div>
                {hasDiscount ? (
                  <p className="text-xs text-green-600 font-semibold whitespace-nowrap mt-2">
                    Tiết kiệm {formatCurrency(defaultVariant.price - price)}
                  </p>
                ) : (
                  <div className="h-5"></div>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500 italic">Liên hệ để biết giá</p>
            )}
          </div>

          {/* Variants & Stock Info */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between min-h-[2.5rem]">
          {/* Color variants */}
          {product.variants && product.variants.length > 1 && (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1">
                {product.variants.slice(0, 4).map((variant, idx) => (
                  <div
                    key={variant.variantId}
                    className="h-6 w-6 rounded-full border-2 border-white shadow-sm"
                    style={{
                      backgroundColor: variant.color?.toLowerCase() || "#ccc",
                      zIndex: 4 - idx,
                    }}
                    title={variant.color || "N/A"}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600 font-medium">
                +{product.variants.length} màu
              </span>
            </div>
          )}

          {/* Stock indicator */}
          {defaultVariant && !isOutOfStock && (
            <div className="text-xs text-gray-500">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-1"></span>
              Còn {defaultVariant.stockQuantity} sản phẩm
            </div>
          )}
          </div>
        </div>
      </div>
    </Link>
  );
}
