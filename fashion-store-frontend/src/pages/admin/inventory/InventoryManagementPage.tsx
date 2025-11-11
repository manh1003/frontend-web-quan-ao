import { useEffect, useState } from "react";
import {
  inventoryApi,
  type Supplier,
  type PurchaseOrder,
  type InventoryTransaction,
} from "@/api/inventory";
import { productsApi } from "@/api/products";
import type { ProductVariant } from "@/types";

type TabType = "variants" | "suppliers" | "purchaseOrders" | "transactions";

export function InventoryManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>("variants");
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Supplier Form State
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierForm, setSupplierForm] = useState({
    supplierName: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    taxCode: "",
    paymentTerms: "",
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === "variants") {
        const data = await productsApi.getAllVariants();
        setVariants(data);
      } else if (activeTab === "suppliers") {
        const data = await inventoryApi.getAllSuppliers();
        setSuppliers(data);
      } else if (activeTab === "purchaseOrders") {
        const data = await inventoryApi.getAllPurchaseOrders();
        setPurchaseOrders(data);
      } else if (activeTab === "transactions") {
        const data = await inventoryApi.getAllTransactions();
        setTransactions(data);
      }
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err instanceof Error ? err.message : "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await inventoryApi.createSupplier(supplierForm);
      setShowSupplierForm(false);
      resetSupplierForm();
      loadData();
    } catch (err) {
      console.error("Error creating supplier:", err);
      alert("Không thể tạo nhà cung cấp");
    }
  };

  const handleUpdateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier) return;
    try {
      await inventoryApi.updateSupplier(
        editingSupplier.supplierId,
        supplierForm
      );
      setShowSupplierForm(false);
      setEditingSupplier(null);
      resetSupplierForm();
      loadData();
    } catch (err) {
      console.error("Error updating supplier:", err);
      alert("Không thể cập nhật nhà cung cấp");
    }
  };

  const handleDeleteSupplier = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa nhà cung cấp này?")) return;
    try {
      await inventoryApi.deleteSupplier(id);
      loadData();
    } catch (err) {
      console.error("Error deleting supplier:", err);
      alert("Không thể xóa nhà cung cấp");
    }
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setSupplierForm({
      supplierName: supplier.supplierName,
      contactPerson: supplier.contactPerson || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
      taxCode: supplier.taxCode || "",
      paymentTerms: supplier.paymentTerms || "",
      isActive: supplier.isActive,
    });
    setShowSupplierForm(true);
  };

  const resetSupplierForm = () => {
    setSupplierForm({
      supplierName: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      taxCode: "",
      paymentTerms: "",
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

  const getStockStatus = (variant: ProductVariant) => {
    if (variant.stockQuantity <= 0) {
      return { text: "Hết hàng", className: "bg-red-100 text-red-800" };
    } else if (variant.stockQuantity <= variant.minStockThreshold) {
      return { text: "Sắp hết", className: "bg-yellow-100 text-yellow-800" };
    } else {
      return { text: "Còn hàng", className: "bg-green-100 text-green-800" };
    }
  };

  const filteredVariants = variants.filter(
    (variant) =>
      variant.variantSku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variant.color?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variant.size?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone?.includes(searchTerm)
  );

  const filteredPurchaseOrders = purchaseOrders.filter(
    (po) =>
      po.poNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplierName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý kho hàng</h1>
          <p className="mt-2 text-gray-600">
            Quản lý tồn kho, nhà cung cấp và đơn nhập hàng
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("variants")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "variants"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Tồn kho
            </button>
            <button
              onClick={() => setActiveTab("suppliers")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "suppliers"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Nhà cung cấp
            </button>
            <button
              onClick={() => setActiveTab("purchaseOrders")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "purchaseOrders"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Đơn nhập hàng
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "transactions"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Lịch sử giao dịch
            </button>
          </nav>
        </div>

        {/* Search and Actions */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            {activeTab === "suppliers" && (
              <button
                onClick={() => {
                  setEditingSupplier(null);
                  resetSupplierForm();
                  setShowSupplierForm(true);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Thêm nhà cung cấp
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-indigo-600"></div>
              <p className="mt-2 text-gray-600">Đang tải...</p>
            </div>
          ) : (
            <>
              {/* Variants Tab */}
              {activeTab === "variants" && (
                <div className="overflow-x-auto">
                  {filteredVariants.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      Không tìm thấy biến thể nào.
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Mã sản phẩm
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            SKU Biến thể
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Màu sắc / Kích thước
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Giá bán
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tồn kho
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ngưỡng tối thiểu
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Trạng thái
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredVariants.map((variant) => {
                          const status = getStockStatus(variant);
                          return (
                            <tr
                              key={variant.variantId}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                <span className="font-mono text-xs bg-blue-50 px-2 py-1 rounded">
                                  {variant.productSku || "-"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                  {variant.variantSku}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {variant.color} / {variant.size}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(variant.price)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {variant.stockQuantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {variant.minStockThreshold}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.className}`}
                                >
                                  {status.text}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Suppliers Tab */}
              {activeTab === "suppliers" && (
                <div className="overflow-x-auto">
                  {filteredSuppliers.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      Không tìm thấy nhà cung cấp nào.
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tên nhà cung cấp
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Người liên hệ
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email / Điện thoại
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Địa chỉ
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Trạng thái
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Thao tác
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredSuppliers.map((supplier) => (
                          <tr
                            key={supplier.supplierId}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {supplier.supplierName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {supplier.contactPerson || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {supplier.email || "-"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {supplier.phone || "-"}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {supplier.address || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  supplier.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {supplier.isActive
                                  ? "Hoạt động"
                                  : "Ngừng hoạt động"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleEditSupplier(supplier)}
                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteSupplier(supplier.supplierId)
                                }
                                className="text-red-600 hover:text-red-900"
                              >
                                Xóa
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Purchase Orders Tab */}
              {activeTab === "purchaseOrders" && (
                <div className="overflow-x-auto">
                  {filteredPurchaseOrders.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      Không tìm thấy đơn nhập hàng nào.
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Mã PO
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nhà cung cấp
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ngày đặt hàng
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ngày nhận dự kiến
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tổng tiền
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Trạng thái
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredPurchaseOrders.map((po) => (
                          <tr key={po.poId} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {po.poNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {po.supplierName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(po.orderDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(po.expectedDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(po.totalAmount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  po.status === "PENDING"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : po.status === "APPROVED"
                                    ? "bg-blue-100 text-blue-800"
                                    : po.status === "RECEIVED"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {po.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Transactions Tab */}
              {activeTab === "transactions" && (
                <div className="overflow-x-auto">
                  {transactions.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      Không tìm thấy giao dịch nào.
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            SKU
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Biến thể
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Loại
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Số lượng
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tồn kho
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tham chiếu
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Người thực hiện
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ngày giao dịch
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ghi chú
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {transactions.map((transaction) => (
                          <tr
                            key={transaction.transactionId}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              #{transaction.transactionId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                {transaction.variantSku || "-"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <div className="font-medium">
                                {transaction.variantName || `Variant #${transaction.variantId}`}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  transaction.transactionType === "IN"
                                    ? "bg-green-100 text-green-800"
                                    : transaction.transactionType === "OUT"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {transaction.transactionType === "IN"
                                  ? "Nhập"
                                  : transaction.transactionType === "OUT"
                                  ? "Xuất"
                                  : "Điều chỉnh"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span
                                className={`font-semibold ${
                                  transaction.transactionType === "IN"
                                    ? "text-green-600"
                                    : transaction.transactionType === "OUT"
                                    ? "text-red-600"
                                    : "text-blue-600"
                                }`}
                              >
                                {transaction.transactionType === "OUT" ? "-" : "+"}
                                {transaction.quantity}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">
                                  {transaction.stockBefore ?? "-"}
                                </span>
                                <span className="text-gray-400">→</span>
                                <span className="font-semibold text-gray-900">
                                  {transaction.stockAfter ?? "-"}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {transaction.referenceType ? (
                                <div>
                                  <div className="font-medium text-xs text-gray-500">
                                    {transaction.referenceType}
                                  </div>
                                  {transaction.referenceId && (
                                    <div className="text-xs text-gray-400">
                                      #{transaction.referenceId}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {transaction.createdByName || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(transaction.createdAt)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                              {transaction.notes || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Supplier Form Modal */}
      {showSupplierForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingSupplier
                    ? "Chỉnh sửa nhà cung cấp"
                    : "Thêm nhà cung cấp mới"}
                </h2>
                <button
                  onClick={() => {
                    setShowSupplierForm(false);
                    setEditingSupplier(null);
                    resetSupplierForm();
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

              <form
                onSubmit={
                  editingSupplier ? handleUpdateSupplier : handleCreateSupplier
                }
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tên nhà cung cấp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={supplierForm.supplierName}
                    onChange={(e) =>
                      setSupplierForm({
                        ...supplierForm,
                        supplierName: e.target.value,
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Người liên hệ
                  </label>
                  <input
                    type="text"
                    value={supplierForm.contactPerson}
                    onChange={(e) =>
                      setSupplierForm({
                        ...supplierForm,
                        contactPerson: e.target.value,
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={supplierForm.email}
                      onChange={(e) =>
                        setSupplierForm({
                          ...supplierForm,
                          email: e.target.value,
                        })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Điện thoại
                    </label>
                    <input
                      type="tel"
                      value={supplierForm.phone}
                      onChange={(e) =>
                        setSupplierForm({
                          ...supplierForm,
                          phone: e.target.value,
                        })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Địa chỉ
                  </label>
                  <textarea
                    value={supplierForm.address}
                    onChange={(e) =>
                      setSupplierForm({
                        ...supplierForm,
                        address: e.target.value,
                      })
                    }
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Mã số thuế
                    </label>
                    <input
                      type="text"
                      value={supplierForm.taxCode}
                      onChange={(e) =>
                        setSupplierForm({
                          ...supplierForm,
                          taxCode: e.target.value,
                        })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Điều khoản thanh toán
                    </label>
                    <input
                      type="text"
                      value={supplierForm.paymentTerms}
                      onChange={(e) =>
                        setSupplierForm({
                          ...supplierForm,
                          paymentTerms: e.target.value,
                        })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={supplierForm.isActive}
                    onChange={(e) =>
                      setSupplierForm({
                        ...supplierForm,
                        isActive: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Hoạt động
                  </label>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSupplierForm(false);
                      setEditingSupplier(null);
                      resetSupplierForm();
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    {editingSupplier ? "Cập nhật" : "Tạo mới"}
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
