import { useState, useEffect, useMemo } from "react";
import {
  Filter,
  SlidersHorizontal,
  X,
  ChevronRight,
  Tag,
  Sparkles,
  Search,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { productsApi } from "@/api";
import { ProductCard } from "@/components/ProductCard";
import type { Product, ProductCategory, Brand } from "@/types";

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  // Removed viewMode - only grid view now

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getAll();
      setProducts(data);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không thể tải sản phẩm"
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter & Sort logic with search
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = product.productName.toLowerCase().includes(query);
        const matchBrand = product.brand?.brandName
          .toLowerCase()
          .includes(query);
        const matchCategory = product.category?.categoryName
          .toLowerCase()
          .includes(query);
        const matchSku = product.sku.toLowerCase().includes(query);

        if (!matchName && !matchBrand && !matchCategory && !matchSku) {
          return false;
        }
      }

      // Category filter
      if (
        selectedCategory !== "all" &&
        product.categoryId?.toString() !== selectedCategory
      ) {
        return false;
      }

      // Brand filter
      if (
        selectedBrand !== "all" &&
        product.brandId?.toString() !== selectedBrand
      ) {
        return false;
      }

      // Price range filter
      if (priceRange !== "all" && product.variants?.[0]) {
        const price =
          product.variants[0].salePrice || product.variants[0].price;
        const ranges: Record<string, [number, number]> = {
          "under-500k": [0, 500000],
          "500k-1m": [500000, 1000000],
          "1m-2m": [1000000, 2000000],
          "over-2m": [2000000, Infinity],
        };
        const [min, max] = ranges[priceRange] || [0, Infinity];
        if (price < min || price > max) return false;
      }

      return true;
    });
  }, [products, searchQuery, selectedCategory, selectedBrand, priceRange]);

  // Sort
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === "price-asc") {
        const priceA =
          a.variants?.[0]?.salePrice || a.variants?.[0]?.price || 0;
        const priceB =
          b.variants?.[0]?.salePrice || b.variants?.[0]?.price || 0;
        return priceA - priceB;
      }
      if (sortBy === "price-desc") {
        const priceA =
          a.variants?.[0]?.salePrice || a.variants?.[0]?.price || 0;
        const priceB =
          b.variants?.[0]?.salePrice || b.variants?.[0]?.price || 0;
        return priceB - priceA;
      }
      if (sortBy === "name") {
        return a.productName.localeCompare(b.productName);
      }
      // newest (default)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filteredProducts, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = sortedProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedBrand, priceRange, sortBy]);

  // Scroll to top when page changes - DISABLED to keep scroll position
  // const scrollToTop = () => {
  //   window.scrollTo({ top: 0, behavior: "smooth" });
  // };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // scrollToTop(); // Removed to keep current scroll position
  };

  // Get unique categories & brands by ID (avoid duplicate keys)
  const categoryMap = new Map<number, ProductCategory>();
  const brandMap = new Map<number, Brand>();
  for (const p of products) {
    if (p.category && !categoryMap.has(p.category.categoryId)) {
      categoryMap.set(p.category.categoryId, p.category);
    }
    if (p.brand && !brandMap.has(p.brand.brandId)) {
      brandMap.set(p.brand.brandId, p.brand);
    }
  }
  const categories = Array.from(categoryMap.values());
  const brands = Array.from(brandMap.values());

  // Derive a stable key for products regardless of DTO field style
  const getProductKey = (p: Product) => p.productId ?? p.sku;

  // Get active filters count
  const activeFiltersCount = [
    selectedCategory !== "all",
    selectedBrand !== "all",
    priceRange !== "all",
    searchQuery.trim() !== "",
  ].filter(Boolean).length;

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategory("all");
    setSelectedBrand("all");
    setPriceRange("all");
    setSearchQuery("");
  };

  // Get active filter labels
  const getActiveFilterLabel = (type: string, value: string) => {
    if (type === "category") {
      const cat = categories.find((c) => c.categoryId.toString() === value);
      return cat?.categoryName;
    }
    if (type === "brand") {
      const brand = brands.find((b) => b.brandId.toString() === value);
      return brand?.brandName;
    }
    if (type === "price") {
      const priceLabels: Record<string, string> = {
        "under-500k": "Dưới 500K",
        "500k-1m": "500K - 1M",
        "1m-2m": "1M - 2M",
        "over-2m": "Trên 2M",
      };
      return priceLabels[value];
    }
    return "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            }}
          />
        </div>

        <div className="container relative">
          {/* Breadcrumb */}
          <div className="pt-6 pb-4">
            <nav className="flex items-center text-sm">
              <Link
                to="/"
                className="text-white/80 hover:text-white transition-colors flex items-center"
              >
                Trang chủ
              </Link>
              <ChevronRight className="h-4 w-4 mx-2 text-white/60" />
              <span className="text-white font-medium">Sản phẩm</span>
            </nav>
          </div>

          {/* Title Section */}
          <div className="py-12">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="h-8 w-8" />
              <h1 className="text-4xl md:text-5xl font-bold">
                Bộ Sưu Tập Thời Trang
              </h1>
            </div>
            <p className="text-xl text-white/90 max-w-2xl mb-8">
              Khám phá những xu hướng mới nhất và tìm kiếm phong cách hoàn hảo
              của bạn
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60 group-focus-within:text-white transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm, thương hiệu, danh mục..."
                  className="w-full pl-12 pr-12 py-4 rounded-xl bg-white/10 backdrop-blur-md border-2 border-white/20 text-white placeholder-white/60 focus:bg-white/20 focus:border-white/40 focus:outline-none transition-all duration-300 text-lg"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                    title="Xóa tìm kiếm"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                <span className="font-semibold">{products.length}+</span> sản
                phẩm
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                <span className="font-semibold">Mới</span> mỗi tuần
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Active Filters Bar */}
        {activeFiltersCount > 0 && (
          <div className="mb-6 bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Đang lọc:
                </span>
                {searchQuery.trim() && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                  >
                    <Search className="h-3.5 w-3.5" />"
                    {searchQuery.length > 20
                      ? searchQuery.slice(0, 20) + "..."
                      : searchQuery}
                    "
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                {selectedCategory !== "all" && (
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 text-white rounded-full text-sm font-medium hover:bg-gray-700 transition-colors"
                  >
                    {getActiveFilterLabel("category", selectedCategory)}
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                {selectedBrand !== "all" && (
                  <button
                    onClick={() => setSelectedBrand("all")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 text-white rounded-full text-sm font-medium hover:bg-gray-700 transition-colors"
                  >
                    {getActiveFilterLabel("brand", selectedBrand)}
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                {priceRange !== "all" && (
                  <button
                    onClick={() => setPriceRange("all")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 text-white rounded-full text-sm font-medium hover:bg-gray-700 transition-colors"
                  >
                    {getActiveFilterLabel("price", priceRange)}
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <button
                onClick={clearAllFilters}
                className="text-sm text-red-600 hover:text-red-700 font-medium underline"
              >
                Xóa tất cả
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 sticky top-20 shadow-lg border border-gray-100">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-900 flex items-center text-lg">
                  <SlidersHorizontal className="h-5 w-5 mr-2 text-primary-600" />
                  Bộ lọc
                </h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                  >
                    <X className="h-3.5 w-3.5" />
                    Xóa ({activeFiltersCount})
                  </button>
                )}
              </div>

              {/* Category */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                  <div className="h-1 w-1 rounded-full bg-primary-600 mr-2"></div>
                  Danh mục
                </h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      selectedCategory === "all"
                        ? "bg-gray-800 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Tất cả
                  </button>
                  {categories.map((cat) => {
                    const count = products.filter(
                      (p) => p.categoryId === cat.categoryId
                    ).length;
                    return (
                      <button
                        key={cat?.categoryId}
                        onClick={() =>
                          setSelectedCategory(cat?.categoryId.toString())
                        }
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                          selectedCategory === cat?.categoryId.toString()
                            ? "bg-gray-800 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {cat?.categoryName}
                        <span className="ml-1.5 text-xs opacity-75">
                          ({count})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Brand */}
              <div className="mb-6 pb-6 border-b border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                  <div className="h-1 w-1 rounded-full bg-primary-600 mr-2"></div>
                  Thương hiệu
                </h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedBrand("all")}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      selectedBrand === "all"
                        ? "bg-gray-800 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Tất cả
                  </button>
                  {brands.map((brand) => {
                    const count = products.filter(
                      (p) => p.brandId === brand.brandId
                    ).length;
                    return (
                      <button
                        key={brand?.brandId}
                        onClick={() =>
                          setSelectedBrand(brand?.brandId.toString())
                        }
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                          selectedBrand === brand?.brandId.toString()
                            ? "bg-gray-800 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {brand?.brandName}
                        <span className="ml-1.5 text-xs opacity-75">
                          ({count})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-4">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                  <div className="h-1 w-1 rounded-full bg-primary-600 mr-2"></div>
                  Khoảng giá
                </h4>
                <div className="space-y-2">
                  {[
                    { value: "all", label: "Tất cả", icon: "" },
                    { value: "under-500k", label: "< 500.000đ", icon: "" },
                    { value: "500k-1m", label: "500.000đ - 1.000.000đ", icon: "" },
                    { value: "1m-2m", label: "1.000.000đ - 2.000.000đ", icon: "" },
                    { value: "over-2m", label: "> 2.000.000đ", icon: "" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setPriceRange(option.value)}
                      className={`w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-between ${
                        priceRange === option.value
                          ? "bg-gray-800 text-white shadow-md transform scale-[1.02]"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{option.icon}</span>
                        {option.label}
                      </span>
                      {priceRange === option.value && (
                        <span className="text-xs opacity-90">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <p className="text-sm text-gray-700">
                    <span className="font-bold text-primary-600 text-lg">
                      {sortedProducts.length}
                    </span>{" "}
                    <span className="text-gray-600">sản phẩm</span>
                    {sortedProducts.length > itemsPerPage && (
                      <span className="text-gray-500 ml-1">
                        (Trang {currentPage}/{totalPages})
                      </span>
                    )}
                  </p>

                  {/* Items Per Page Selector */}
                  {sortedProducts.length > 12 && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">Hiển thị:</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="input py-1.5 text-sm w-auto border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                      >
                        <option value={12}>12</option>
                        <option value={24}>24</option>
                        <option value={48}>48</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Mobile filter button */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 relative"
                  >
                    <SlidersHorizontal className="h-5 w-5" />
                    <span>Bộ lọc</span>
                    {activeFiltersCount > 0 && (
                      <span className="ml-1 px-2 py-0.5 bg-white/20 text-white text-xs rounded-full font-bold border border-white/30">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>

                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="input py-2.5 text-sm w-auto pr-10 font-medium border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="newest"> Mới nhất</option>
                    <option value="price-asc"> Giá tăng dần</option>
                    <option value="price-desc"> Giá giảm dần</option>
                    <option value="name"> Tên A-Z</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="text-center py-20">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
                <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="card p-6 text-center">
                <p className="text-red-600">{error}</p>
                <button onClick={loadProducts} className="btn-primary mt-4">
                  Thử lại
                </button>
              </div>
            )}

            {/* Products Grid */}
            {!loading && !error && (
              <>
                {sortedProducts.length > 0 ? (
                  <div className="flex flex-col min-h-[800px]">
                    {/* Products Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch content-start">
                      {currentProducts.map((product) => (
                        <ProductCard
                          key={getProductKey(product)}
                          product={product}
                        />
                      ))}
                    </div>

                    {/* Pagination - Fixed at bottom */}
                    {totalPages > 1 && (
                      <div className="mt-12 flex flex-col items-center gap-6 flex-shrink-0">
                        {/* Page Info */}
                        <p className="text-sm text-gray-600">
                          Hiển thị{" "}
                          <span className="font-semibold text-gray-900">
                            {startIndex + 1}
                          </span>{" "}
                          đến{" "}
                          <span className="font-semibold text-gray-900">
                            {Math.min(endIndex, sortedProducts.length)}
                          </span>{" "}
                          trong tổng số{" "}
                          <span className="font-semibold text-gray-900">
                            {sortedProducts.length}
                          </span>{" "}
                          sản phẩm
                        </p>

                        {/* Pagination Controls */}
                        <div className="flex items-center gap-2 flex-wrap justify-center">
                          {/* First Page */}
                          <button
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                            className="h-10 w-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            title="Trang đầu"
                          >
                            <ChevronsLeft className="h-5 w-5" />
                          </button>

                          {/* Previous Page */}
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="h-10 px-4 rounded-lg border border-gray-300 flex items-center gap-2 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Trước</span>
                          </button>

                          {/* Page Numbers */}
                          <div className="flex items-center gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                              .filter((page) => {
                                // Show first page, last page, current page, and pages around current
                                if (page === 1 || page === totalPages)
                                  return true;
                                if (Math.abs(page - currentPage) <= 1)
                                  return true;
                                return false;
                              })
                              .map((page, index, array) => {
                                // Add ellipsis
                                const prevPage = array[index - 1];
                                const showEllipsis =
                                  prevPage && page - prevPage > 1;

                                return (
                                  <div
                                    key={page}
                                    className="flex items-center gap-2"
                                  >
                                    {showEllipsis && (
                                      <span className="text-gray-400 px-2">
                                        ...
                                      </span>
                                    )}
                                    <button
                                      onClick={() => handlePageChange(page)}
                                      className={`h-10 min-w-[40px] px-3 rounded-lg font-medium transition-all ${
                                        currentPage === page
                                          ? "bg-primary-600 text-white shadow-lg scale-110"
                                          : "border border-gray-300 hover:bg-gray-50 text-gray-700"
                                      }`}
                                    >
                                      {page}
                                    </button>
                                  </div>
                                );
                              })}
                          </div>

                          {/* Next Page */}
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="h-10 px-4 rounded-lg border border-gray-300 flex items-center gap-2 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            <span className="hidden sm:inline">Sau</span>
                            <ChevronRight className="h-4 w-4" />
                          </button>

                          {/* Last Page */}
                          <button
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                            className="h-10 w-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            title="Trang cuối"
                          >
                            <ChevronsRight className="h-5 w-5" />
                          </button>
                        </div>

                        {/* Quick Jump (for many pages) */}
                        {totalPages > 5 && (
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">
                              Đến trang:
                            </span>
                            <input
                              type="number"
                              min={1}
                              max={totalPages}
                              value={currentPage}
                              onChange={(e) => {
                                const page = Number(e.target.value);
                                if (page >= 1 && page <= totalPages) {
                                  handlePageChange(page);
                                }
                              }}
                              className="w-16 px-3 py-2 rounded-lg border border-gray-300 text-center focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl p-16 text-center shadow-sm">
                    <div className="max-w-md mx-auto">
                      <div className="h-24 w-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <Filter className="h-12 w-12 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Không tìm thấy sản phẩm
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Không có sản phẩm nào phù hợp với bộ lọc của bạn. Thử
                        điều chỉnh bộ lọc hoặc xóa tất cả.
                      </p>
                      <button
                        onClick={clearAllFilters}
                        className="btn-primary px-6 py-3"
                      >
                        Xóa tất cả bộ lọc
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b bg-gradient-to-r from-primary-600 to-primary-700 text-white">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                <h3 className="font-bold text-lg">Bộ lọc</h3>
              </div>
              <button
                onClick={() => setShowFilters(false)}
                className="h-9 w-9 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Filters Content */}
            <div
              className="overflow-y-auto"
              style={{ maxHeight: "calc(100vh - 140px)" }}
            >
              <div className="p-5 space-y-6">
                {/* Category */}
                <div className="pb-6 border-b border-gray-200">
                  <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                    <div className="h-1 w-1 rounded-full bg-primary-600 mr-2"></div>
                    Danh mục
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        selectedCategory === "all"
                          ? "bg-gray-800 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 active:bg-gray-200"
                      }`}
                    >
                      Tất cả
                    </button>
                    {categories.map((cat) => {
                      const count = products.filter(
                        (p) => p.categoryId === cat.categoryId
                      ).length;
                      return (
                        <button
                          key={cat?.categoryId}
                          onClick={() =>
                            setSelectedCategory(cat?.categoryId.toString())
                          }
                          className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                            selectedCategory === cat?.categoryId.toString()
                              ? "bg-gray-800 text-white shadow-md"
                              : "bg-gray-100 text-gray-700 active:bg-gray-200"
                          }`}
                        >
                          {cat?.categoryName}
                          <span className="ml-1.5 text-xs opacity-75">
                            ({count})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Brand */}
                <div className="pb-6 border-b border-gray-200">
                  <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                    <div className="h-1 w-1 rounded-full bg-primary-600 mr-2"></div>
                    Thương hiệu
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedBrand("all")}
                      className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        selectedBrand === "all"
                          ? "bg-gray-800 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 active:bg-gray-200"
                      }`}
                    >
                      Tất cả
                    </button>
                    {brands.map((brand) => {
                      const count = products.filter(
                        (p) => p.brandId === brand.brandId
                      ).length;
                      return (
                        <button
                          key={brand?.brandId}
                          onClick={() =>
                            setSelectedBrand(brand?.brandId.toString())
                          }
                          className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                            selectedBrand === brand?.brandId.toString()
                              ? "bg-gray-800 text-white shadow-md"
                              : "bg-gray-100 text-gray-700 active:bg-gray-200"
                          }`}
                        >
                          {brand?.brandName}
                          <span className="ml-1.5 text-xs opacity-75">
                            ({count})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Price Range */}
                <div className="pb-6">
                  <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                    <div className="h-1 w-1 rounded-full bg-primary-600 mr-2"></div>
                    Khoảng giá
                  </h4>
                  <div className="space-y-2.5">
                    {[
                      { value: "all", label: "Tất cả", icon: "" },
                      { value: "under-500k", label: "< 500K", icon: "" },
                      { value: "500k-1m", label: "500K - 1M", icon: "" },
                      { value: "1m-2m", label: "1M - 2M", icon: "" },
                      { value: "over-2m", label: "> 2M", icon: "" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setPriceRange(option.value)}
                        className={`w-full px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-between ${
                          priceRange === option.value
                            ? "bg-gray-800 text-white shadow-md"
                            : "bg-gray-50 text-gray-700 active:bg-gray-100"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{option.icon}</span>
                          {option.label}
                        </span>
                        {priceRange === option.value && (
                          <span className="text-xs opacity-90">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="absolute bottom-0 inset-x-0 p-4 bg-white border-t shadow-lg flex gap-3">
              <button
                onClick={clearAllFilters}
                className="flex-1 px-4 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <X className="h-4 w-4" />
                Xóa bộ lọc
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 px-4 py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-bold hover:shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>✓</span>
                Áp dụng ({sortedProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
