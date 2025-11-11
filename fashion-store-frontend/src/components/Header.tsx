import { Link, useLocation } from "react-router-dom";
import {
  ShoppingCart,
  Search,
  Menu,
  Settings,
  ChevronDown,
  LogOut,
  Package,
  UserCircle,
} from "lucide-react";
import { useAuthStore, useCartStore, useThemeStore } from "@/stores";

export function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { getItemCount } = useCartStore();
  const { settings } = useThemeStore();
  const cartCount = getItemCount();
  const location = useLocation();

  const isAdmin = user?.roleName === "ADMIN";

  // Check if link is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-xl shadow-sm">
      <div className="container flex h-20 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="group flex items-center space-x-3">
          {settings.logoUrl ? (
            <div className="relative">
              <img
                src={settings.logoUrl}
                alt={settings?.siteName || "Logo"}
                className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </div>
          ) : (
            <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105">
              <span className="text-white font-bold text-2xl">
                {(settings?.siteName || "F").charAt(0).toUpperCase()}
              </span>
              <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
            </div>
          )}
          <div>
            <span className="font-bold text-xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {settings?.siteName || "Fashion Store"}
            </span>
            <div className="h-0.5 w-0 bg-gradient-to-r from-primary-600 to-primary-400 group-hover:w-full transition-all duration-300"></div>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {[
            { path: "/", label: "Trang chủ" },
            { path: "/products", label: "Sản phẩm" },
            { path: "/about", label: "Giới thiệu" },
            { path: "/contact", label: "Liên hệ" },
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`relative px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                isActive(item.path)
                  ? "text-white bg-gradient-to-r from-primary-600 to-primary-700 shadow-md"
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          {/* Search */}
          <button className="hidden sm:flex items-center justify-center h-10 w-10 rounded-xl hover:bg-gray-100 transition-all duration-300 group">
            <Search className="h-5 w-5 text-gray-600 group-hover:text-primary-600 group-hover:scale-110 transition-all" />
          </button>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative flex items-center justify-center h-10 w-10 rounded-xl hover:bg-gray-100 transition-all duration-300 group"
          >
            <ShoppingCart className="h-5 w-5 text-gray-600 group-hover:text-primary-600 group-hover:scale-110 transition-all" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 text-white text-xs font-bold flex items-center justify-center shadow-lg animate-pulse">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User */}
          {isAuthenticated && user ? (
            <div className="relative group">
              <button className="flex items-center space-x-2 h-10 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-300 border border-gray-200 hover:border-gray-300">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {(user.fullName || "U").charAt(0).toUpperCase()}
                </div>
                <span className="hidden lg:block text-sm font-bold text-gray-900">
                  {user.fullName}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-700 group-hover:rotate-180 transition-transform duration-300" />
              </button>

              {/* Dropdown */}
              <div className="absolute right-0 mt-3 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                  {/* User Info Header */}
                  <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <p className="text-xs text-gray-600 font-medium">
                      Xin chào,
                    </p>
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {user.fullName}
                    </p>
                  </div>

                  {isAdmin && (
                    <>
                      <Link
                        to="/admin"
                        className="flex items-center px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-100 transition-colors group/item"
                      >
                        <Settings className="h-4 w-4 mr-3 text-primary-600 group-hover/item:scale-110 transition-transform" />
                        Quản trị hệ thống
                      </Link>
                      <div className="border-t border-gray-100"></div>
                    </>
                  )}
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-100 transition-colors group/item"
                  >
                    <UserCircle className="h-4 w-4 mr-3 text-gray-600 group-hover/item:scale-110 transition-transform" />
                    Thông tin cá nhân
                  </Link>
                  <Link
                    to="/orders"
                    className="flex items-center px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-100 transition-colors group/item"
                  >
                    <Package className="h-4 w-4 mr-3 text-gray-600 group-hover/item:scale-110 transition-transform" />
                    Đơn hàng của tôi
                  </Link>
                  <div className="border-t border-gray-100"></div>
                  <button
                    onClick={logout}
                    className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors group/item"
                  >
                    <LogOut className="h-4 w-4 mr-3 group-hover/item:scale-110 transition-transform" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="hidden sm:flex items-center px-4 py-2 text-sm font-semibold text-gray-700 hover:text-primary-600 rounded-xl hover:bg-gray-100 transition-all duration-300"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="flex items-center px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Đăng ký
              </Link>
            </div>
          )}

          {/* Mobile menu */}
          <button className="md:hidden flex items-center justify-center h-10 w-10 rounded-xl hover:bg-gray-100 transition-all duration-300 group">
            <Menu className="h-5 w-5 text-gray-600 group-hover:text-primary-600 group-hover:scale-110 transition-all" />
          </button>
        </div>
      </div>
    </header>
  );
}
