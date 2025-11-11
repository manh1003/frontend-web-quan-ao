import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Warehouse,
  TrendingUp,
  Tag,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  FileText,
  Image,
} from "lucide-react";

interface NavItem {
  title: string;
  icon: React.ElementType;
  path?: string;
  permission?: string;
  children?: NavItem[];
}

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const navigationItems: NavItem[] = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin",
      permission: "VIEW_REPORTS",
    },
    {
      title: "Sản phẩm",
      icon: Package,
      permission: "VIEW_PRODUCTS",
      children: [
        { title: "Danh sách sản phẩm", icon: Package, path: "/admin/products" },
        { title: "Danh mục", icon: FileText, path: "/admin/categories" },
        { title: "Thương hiệu", icon: Tag, path: "/admin/brands" },
      ],
    },
    {
      title: "Đơn hàng",
      icon: ShoppingCart,
      path: "/admin/orders",
      permission: "VIEW_ORDERS",
    },
    {
      title: "Khách hàng",
      icon: Users,
      path: "/admin/customers",
      permission: "VIEW_CUSTOMERS",
    },
    {
      title: "Quản lý kho",
      icon: Warehouse,
      permission: "VIEW_INVENTORY",
      children: [
        { title: "Tồn kho", icon: Warehouse, path: "/admin/inventory" },
      
        
      ],
    },
    {
      title: "Hero Banners",
      icon: Image,
      path: "/admin/banners",
      permission: "MANAGE_PROMOTIONS",
    },
    {
      title: "Khuyến mãi",
      icon: Tag,
      permission: "MANAGE_PROMOTIONS",
      children: [
        { title: "Chương trình KM", icon: Tag, path: "/admin/promotions" },
        { title: "Mã giảm giá", icon: Tag, path: "/admin/coupons" },
      ],
    },
    {
      title: "Báo cáo",
      icon: TrendingUp,
      path: "/admin/reports",
      permission: "VIEW_REPORTS",
    },
    {
      title: "Cài đặt",
      icon: Settings,
      path: "/admin/settings",
      permission: "MANAGE_USERS",
    },
  ];

  const hasPermission = (permission?: string) => {
    if (!permission) return true;
    return user?.permissions?.includes(permission);
  };

  const toggleMenu = (title: string) => {
    setExpandedMenus((prev) =>
      prev.includes(title) ? prev.filter((m) => m !== title) : [...prev, title]
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActivePath = (path?: string) => {
    if (!path) return false;
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const allowedNavItems = navigationItems.filter((item) =>
    hasPermission(item.permission)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gray-900 text-white transition-all duration-300 fixed h-full z-40 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          {sidebarOpen && (
            <Link to="/admin" className="text-xl font-bold">
              Fashion Store
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {allowedNavItems.map((item) => {
            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedMenus.includes(item.title);
            const isActive = isActivePath(item.path);

            if (hasChildren) {
              return (
                <div key={item.title}>
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800 transition-colors ${
                      isActive ? "bg-gray-800 border-l-4 border-blue-500" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} />
                      {sidebarOpen && <span>{item.title}</span>}
                    </div>
                    {sidebarOpen && (
                      <ChevronDown
                        size={16}
                        className={`transform transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>

                  {/* Submenu */}
                  {sidebarOpen && isExpanded && item.children && (
                    <div className="bg-gray-800">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        const isChildActive = isActivePath(child.path);
                        return (
                          <Link
                            key={child.path}
                            to={child.path!}
                            className={`flex items-center gap-3 px-4 py-2.5 pl-12 hover:bg-gray-700 transition-colors ${
                              isChildActive ? "bg-gray-700 text-blue-400" : ""
                            }`}
                          >
                            <ChildIcon size={16} />
                            <span className="text-sm">{child.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path!}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors ${
                  isActive ? "bg-gray-800 border-l-4 border-blue-500" : ""
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="border-t border-gray-800 p-4">
          <div
            className={`flex items-center ${
              sidebarOpen ? "gap-3" : "justify-center"
            }`}
          >
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-semibold">
              {user?.fullName?.charAt(0) || "A"}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.fullName}</p>
                <p className="text-xs text-gray-400 truncate">
                  {user?.roleName}
                </p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={handleLogout}
              className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm font-medium"
            >
              <LogOut size={16} />
              Đăng xuất
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 ${
          sidebarOpen ? "ml-64" : "ml-20"
        } transition-all duration-300`}
      >
        <Outlet />
      </main>
    </div>
  );
}
