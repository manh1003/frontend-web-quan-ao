import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShoppingBag,
  Truck,
  Shield,
  HeadphonesIcon,
  Star,
  TrendingUp,
  Zap,
  Sparkles,
  Tag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { productsApi, categoriesApi, bannersApi } from "@/api";
import { ProductCard } from "@/components/ProductCard";
import type { Product, ProductCategory } from "@/types";
import type { HeroBanner } from "@/api/banners";

export function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  // Auto-rotate banners every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData, bannersData] = await Promise.all([
        productsApi.getAll(),
        categoriesApi.getAll(),
        bannersApi.getActiveBanners().catch(() => []), // Gracefully handle banner errors
      ]);

      // Get 8 newest products for featured section
      const sortedProducts = productsData.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setFeaturedProducts(sortedProducts.slice(0, 8));
      setCategories(categoriesData.slice(0, 6));
      setBanners(bannersData);
    } catch (error) {
      console.error("Failed to load home data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Banner navigation functions
  const goToNextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
  };

  const goToPrevBanner = () => {
    setCurrentBannerIndex((prev) =>
      prev === 0 ? banners.length - 1 : prev - 1
    );
  };

  const currentBanner = banners[currentBannerIndex];

  return (
    <div className="bg-white">
      {/* Hero Section - Dynamic Banner */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            }}
          />
        </div>

        <div className="container relative py-16 md:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-8 text-white">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-semibold">
                  🔥 BST Mùa Đông 2025
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight">
                Thời Trang
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400">
                  Phong Cách Riêng
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-white/90 max-w-lg leading-relaxed">
                Khám phá bộ sưu tập thời trang mới nhất với chất lượng cao cấp
                và giá cả phải chăng. Tạo nên phong cách riêng của bạn ngay hôm
                nay!
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/products"
                  className="group inline-flex items-center px-8 py-4 bg-white text-primary-600 rounded-xl font-bold text-lg hover:bg-yellow-400 hover:text-gray-900 transition-all duration-300 shadow-2xl hover:shadow-yellow-400/50 hover:scale-105"
                >
                  Mua sắm ngay
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/products"
                  className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-300 border-2 border-white/30"
                >
                  Khuyến mãi hôm nay
                  <Tag className="ml-2 h-5 w-5" />
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 pt-8">
                <div>
                  <div className="text-3xl font-bold">1000+</div>
                  <div className="text-white/70 text-sm">Sản phẩm</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">50K+</div>
                  <div className="text-white/70 text-sm">Khách hàng</div>
                </div>
                <div>
                  <div className="text-3xl font-bold flex items-center gap-2">
                    <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                    4.9
                  </div>
                  <div className="text-white/70 text-sm">Đánh giá</div>
                </div>
              </div>
            </div>

            {/* Hero Image - Dynamic from API with Smooth Transition */}
            <div className="relative hidden lg:block">
              <div className="aspect-[4/5] rounded-3xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-lg border-2 border-white/30 shadow-2xl overflow-hidden">
                {banners.length > 0 ? (
                  <div className="relative h-full w-full">
                    {banners.map((banner, index) => (
                      <div
                        key={banner.bannerId}
                        className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                          index === currentBannerIndex
                            ? "opacity-100 scale-100"
                            : "opacity-0 scale-105"
                        }`}
                      >
                        <img
                          src={banner.imageUrl}
                          alt={banner.title}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "";
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <div className="text-center space-y-4 p-8">
                      <ShoppingBag className="h-24 w-24 mx-auto text-white/40" />
                      <p className="text-white/60 text-lg">
                        Chưa có banner nào
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Banner Navigation Arrows */}
              {banners.length > 1 && (
                <>
                  {/* Previous Button */}
                  <button
                    onClick={goToPrevBanner}
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 hover:scale-110 group"
                    aria-label="Previous banner"
                  >
                    <ChevronLeft className="h-6 w-6 group-hover:-translate-x-0.5 transition-transform" />
                  </button>

                  {/* Next Button */}
                  <button
                    onClick={goToNextBanner}
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 hover:scale-110 group"
                    aria-label="Next banner"
                  >
                    <ChevronRight className="h-6 w-6 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </>
              )}

              {/* Banner Navigation Dots */}
              {banners.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentBannerIndex(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === currentBannerIndex
                          ? "w-8 bg-white shadow-lg"
                          : "w-2 bg-white/50 hover:bg-white/75"
                      }`}
                      aria-label={`Go to banner ${index + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 h-24 w-24 bg-yellow-400 rounded-full blur-2xl opacity-50 animate-pulse" />
              <div className="absolute -bottom-8 -left-8 h-32 w-32 bg-pink-400 rounded-full blur-2xl opacity-50 animate-pulse animation-delay-1000" />
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group flex items-start space-x-4 p-6 rounded-2xl hover:bg-gradient-to-br hover:from-primary-50 hover:to-primary-100 transition-all duration-300 hover:shadow-lg">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                <Truck className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1 text-lg">
                  Miễn phí vận chuyển
                </h3>
                <p className="text-sm text-gray-600">Đơn hàng từ 500.000đ</p>
              </div>
            </div>

            <div className="group flex items-start space-x-4 p-6 rounded-2xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 transition-all duration-300 hover:shadow-lg">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1 text-lg">
                  Thanh toán an toàn
                </h3>
                <p className="text-sm text-gray-600">Bảo mật 100%</p>
              </div>
            </div>

            <div className="group flex items-start space-x-4 p-6 rounded-2xl hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100 transition-all duration-300 hover:shadow-lg">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                <ShoppingBag className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1 text-lg">
                  Đổi trả dễ dàng
                </h3>
                <p className="text-sm text-gray-600">Trong vòng 7 ngày</p>
              </div>
            </div>

            <div className="group flex items-start space-x-4 p-6 rounded-2xl hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100 transition-all duration-300 hover:shadow-lg">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                <HeadphonesIcon className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1 text-lg">
                  Hỗ trợ 24/7
                </h3>
                <p className="text-sm text-gray-600">Luôn sẵn sàng hỗ trợ</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Danh Mục Sản Phẩm
            </h2>
            <p className="text-lg text-gray-600">
              Khám phá bộ sưu tập đa dạng của chúng tôi
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-64 bg-gray-200 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.categoryId}
                  to={`/products?category=${category.categoryId}`}
                  className="group relative h-64 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  {/* Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 group-hover:scale-110 transition-transform duration-500" />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                    <h3 className="text-2xl font-bold mb-2 transform group-hover:scale-110 transition-transform">
                      {category.categoryName}
                    </h3>
                    {category.description && (
                      <p className="text-sm text-white/90 text-center mb-4">
                        {category.description}
                      </p>
                    )}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-semibold group-hover:bg-white/30 transition-colors">
                      Xem ngay
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Zap className="h-8 w-8 text-yellow-500 fill-yellow-500" />
                Sản Phẩm Nổi Bật
              </h2>
              <p className="text-lg text-gray-600">
                Những sản phẩm mới nhất và hot nhất
              </p>
            </div>
            <Link
              to="/products"
              className="hidden md:inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold group"
            >
              Xem tất cả
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-gray-200 rounded-xl mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard
                    key={product.productId}
                    product={product as any}
                  />
                ))}
              </div>

              <div className="text-center mt-12 md:hidden">
                <Link to="/products" className="btn-primary px-8 py-3">
                  Xem tất cả sản phẩm
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Promotion Banner */}
      <section className="py-20 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full mb-6">
              <Sparkles className="h-5 w-5" />
              <span className="font-semibold">KHUYẾN MÃI ĐẶC BIỆT</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Giảm Giá Lên Đến 50%
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Áp dụng cho tất cả sản phẩm mới. Không bỏ lỡ cơ hội vàng!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-yellow-400 hover:text-gray-900 transition-all duration-300 shadow-2xl hover:shadow-yellow-400/50 hover:scale-105"
              >
                Mua sắm ngay
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-300 border-2 border-white/30"
              >
                <Tag className="mr-2 h-5 w-5" />
                Xem khuyến mãi
              </Link>
            </div>

            {/* Countdown Timer (Static for now) */}
            <div className="mt-12 flex justify-center gap-4">
              {[
                { label: "Ngày", value: "05" },
                { label: "Giờ", value: "12" },
                { label: "Phút", value: "34" },
                { label: "Giây", value: "56" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-4 min-w-[80px]"
                >
                  <div className="text-3xl font-bold">{item.value}</div>
                  <div className="text-sm text-white/80">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Đăng Ký Nhận Tin
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Nhận thông tin về sản phẩm mới và ưu đãi đặc biệt
            </p>

            <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <input
                type="email"
                placeholder="Nhập email của bạn..."
                className="flex-1 px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-bold hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Đăng ký
              </button>
            </form>

            <p className="text-sm text-gray-500 mt-4">
              Chúng tôi tôn trọng quyền riêng tư của bạn. Hủy đăng ký bất cứ lúc
              nào.
            </p>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-white border-t">
        <div className="container">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-12 w-32 bg-gray-200 rounded-lg"
                title="Brand Logo"
              />
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-6">
            Đối tác tin cậy của các thương hiệu hàng đầu
          </p>
        </div>
      </section>
    </div>
  );
}
