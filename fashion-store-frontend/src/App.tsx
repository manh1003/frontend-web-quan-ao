import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout, ProtectedRoute, AdminRoute } from "./components";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { HomePage } from "./pages/home/HomePage";
import { ProductsPage } from "./pages/products/ProductsPage";
import { ProductDetailPage } from "./pages/products/ProductDetailPage";
import { CartPage } from "./pages/cart/CartPage";
import { CheckoutPage } from "./pages/checkout/CheckoutPage";
import { OrdersPage } from "./pages/orders/OrdersPage";
import { OrderDetailPage as CustomerOrderDetailPage } from "./pages/orders/OrderDetailPage";
import { ProfilePage } from "./pages/profile/ProfilePage";
import { AboutPage } from "./pages/about/AboutPage";
import { ContactPage } from "./pages/contact/ContactPage";
import { DashboardPage } from "./pages/admin/DashboardPage";
import { AdminLayout } from "./components/admin/AdminLayout";
import { ProductsManagementPage } from "./pages/admin/products/ProductsManagementPage";
import { CategoriesPage } from "./pages/admin/categories/CategoriesPage";
import { BrandsPage } from "./pages/admin/brands/BrandsPage";
import { OrdersManagementPage } from "./pages/admin/orders/OrdersManagementPage";
import { OrderDetailPage as AdminOrderDetailPage } from "./pages/admin/orders/OrderDetailPage";
import { ProductFormPage } from "./pages/admin/products/ProductFormPage";
import { CustomersManagementPage } from "./pages/admin/customers/CustomersManagementPage";
import { InventoryManagementPage } from "./pages/admin/inventory/InventoryManagementPage";
import { CouponsManagementPage } from "./pages/admin/coupons/CouponsManagementPage";
import { ReportsPage } from "./pages/admin/reports/ReportsPage";
import { BannersPage } from "./pages/admin/banners/BannersPage";
import { SettingsPage } from "./pages/admin/settings/SettingsPage";
import { useThemeStore } from "./stores";
import { useDocumentSettings } from "./hooks";

function App() {
  const { applyTheme } = useThemeStore();

  // Apply theme on app load
  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  // Apply document settings (title, favicon, meta)
  useDocumentSettings();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Layout routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Protected routes */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <CustomerOrderDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<ProductsManagementPage />} />
            <Route path="products/create" element={<ProductFormPage />} />
            <Route path="products/:id/edit" element={<ProductFormPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="brands" element={<BrandsPage />} />
            <Route path="orders" element={<OrdersManagementPage />} />
            <Route path="orders/:id" element={<AdminOrderDetailPage />} />
            <Route path="customers" element={<CustomersManagementPage />} />
            <Route path="inventory" element={<InventoryManagementPage />} />
            <Route path="coupons" element={<CouponsManagementPage />} />
            <Route path="banners" element={<BannersPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
