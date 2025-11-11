import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  productsApi,
  categoriesApi,
  brandsApi,
  productVariantsApi,
  productImagesApi,
} from "@/api/products";
import type { Brand, Product, ProductCategory } from "@/types";

type FormState = {
  sku: string;
  productName: string;
  categoryId?: number;
  brandId?: number;
  material?: string;
  description?: string;
  careInstructions?: string;
  isActive: boolean;
};

type VariantAny = {
  variantId?: number;
  productId?: number;
  productName?: string;
  sku?: string;
  variantSku?: string;
  size?: string;
  color?: string;
  price?: number;
  retailPrice?: number;
  salePrice?: number;
  stockQuantity?: number;
  minStockLevel?: number;
  minStockThreshold?: number;
  isActive?: boolean;
};

type ImageDTO = {
  imageId: number;
  productId: number;
  variantId?: number;
  imageUrl: string;
  isPrimary?: boolean;
  displayOrder?: number;
  createdAt?: string;
};

type NewVariantState = {
  sku: string;
  size: string;
  color: string;
  price?: number;
  salePrice?: number;
  stockQuantity?: number;
  minStockLevel?: number;
  isActive: boolean;
};

export function ProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const productId = isEdit ? Number(id) : undefined;

  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    sku: "",
    productName: "",
    categoryId: undefined,
    brandId: undefined,
    material: "",
    description: "",
    careInstructions: "",
    isActive: true,
  });
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Variants & Images state
  const [variants, setVariants] = useState<VariantAny[]>([]);
  const [images, setImages] = useState<ImageDTO[]>([]);
  const [variantSubmitting, setVariantSubmitting] = useState(false);
  const [imageSubmitting, setImageSubmitting] = useState(false);
  const [editingVariantId, setEditingVariantId] = useState<number | null>(null);

  const [newVariant, setNewVariant] = useState<NewVariantState>({
    sku: "",
    size: "",
    color: "",
    price: undefined,
    salePrice: undefined,
    stockQuantity: undefined,
    minStockLevel: undefined,
    isActive: true,
  });
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageIsPrimary, setNewImageIsPrimary] = useState(false);
  const [newImageDisplayOrder, setNewImageDisplayOrder] = useState<number | "">(
    ""
  );

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [cats, brs] = await Promise.all([
          categoriesApi.getAll(),
          brandsApi.getAll(),
        ]);
        if (!active) return;
        setCategories(cats);
        setBrands(brs);

        if (isEdit && productId) {
          const p = await productsApi.getById(productId);
          if (!active) return;
          setForm({
            sku: p.sku ?? "",
            productName: p.productName ?? "",
            categoryId: p.categoryId ?? p.category?.categoryId,
            brandId: p.brandId ?? p.brand?.brandId,
            material: p.material ?? "",
            description: p.description ?? "",
            careInstructions: p.careInstructions ?? "",
            isActive: p.isActive ?? true,
          });

          // Load variants & images cho sản phẩm
          const [vars, imgs] = await Promise.all([
            productsApi.getVariantsByProduct(productId),
            productImagesApi.getByProduct(productId),
          ]);
          if (!active) return;
          setVariants((vars as unknown as VariantAny[]) || []);
          setImages((imgs as unknown as ImageDTO[]) || []);
        }
      } catch (e: unknown) {
        if (!active) return;
        const msg =
          e instanceof Error ? e.message : "Không thể tải dữ liệu biểu mẫu";
        setError(msg);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [isEdit, productId]);

  const onChange =
    (field: keyof FormState) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const value =
        e.target.type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : e.target.value;

      setForm((prev) => ({
        ...prev,
        [field]:
          field === "categoryId" || field === "brandId"
            ? value === ""
              ? undefined
              : Number(value)
            : value,
      }));
    };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      const payload: Partial<Product> = {
        sku: form.sku,
        productName: form.productName,
        categoryId: form.categoryId,
        brandId: form.brandId,
        material: form.material,
        description: form.description,
        careInstructions: form.careInstructions,
        isActive: form.isActive,
      };

      let savedProductId: number;
      if (isEdit && productId) {
        await productsApi.update(productId, payload);
        savedProductId = productId;
        // Hiển thị thông báo thành công và không chuyển trang
        alert("Cập nhật sản phẩm thành công!");
      } else {
        const newProduct = await productsApi.create(payload);
        savedProductId = newProduct.productId;
        // Chuyển đến trang edit của sản phẩm vừa tạo
        navigate(`/admin/products/${savedProductId}/edit`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Không thể lưu sản phẩm";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Handlers cho biến thể
  const onNewVariantChange =
    (field: keyof NewVariantState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const isCheckbox = e.target.type === "checkbox";
      const raw = isCheckbox
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
      setNewVariant((prev) => ({
        ...prev,
        [field]:
          field === "price" ||
          field === "salePrice" ||
          field === "stockQuantity" ||
          field === "minStockLevel"
            ? raw === ""
              ? undefined
              : Number(raw)
            : raw,
      }));
    };

  const handleEditVariant = (variant: VariantAny) => {
    setEditingVariantId(variant.variantId || null);
    setNewVariant({
      sku: variant.sku || variant.variantSku || "",
      size: variant.size || "",
      color: variant.color || "",
      price: variant.price ?? variant.retailPrice,
      salePrice: variant.salePrice,
      stockQuantity: variant.stockQuantity,
      minStockLevel: variant.minStockLevel ?? variant.minStockThreshold,
      isActive: variant.isActive ?? true,
    });
  };

  const handleCancelEdit = () => {
    setEditingVariantId(null);
    setNewVariant({
      sku: "",
      size: "",
      color: "",
      price: undefined,
      salePrice: undefined,
      stockQuantity: undefined,
      minStockLevel: undefined,
      isActive: true,
    });
  };

  const handleAddVariant = async () => {
    if (!isEdit || !productId) return;

    // Validate required fields
    if (
      !newVariant.sku.trim() ||
      !newVariant.size.trim() ||
      !newVariant.color.trim()
    ) {
      alert("Vui lòng điền đầy đủ thông tin: SKU, Size, Màu");
      return;
    }

    if (!newVariant.price || newVariant.price <= 0) {
      alert("Vui lòng nhập giá hợp lệ");
      return;
    }

    try {
      setVariantSubmitting(true);
      // Payload theo backend DTO
      const payload: Record<string, unknown> = {
        productId,
        sku: newVariant.sku,
        size: newVariant.size,
        color: newVariant.color,
        price: newVariant.price,
        salePrice: newVariant.salePrice,
        stockQuantity: newVariant.stockQuantity,
        minStockLevel: newVariant.minStockLevel,
        isActive: newVariant.isActive,
      };

      if (editingVariantId) {
        // Check if anything changed
        const originalVariant = variants.find(
          (v) => v.variantId === editingVariantId
        );
        if (originalVariant) {
          const hasChanges =
            newVariant.sku !==
              (originalVariant.sku || originalVariant.variantSku) ||
            newVariant.size !== originalVariant.size ||
            newVariant.color !== originalVariant.color ||
            newVariant.price !==
              (originalVariant.price ?? originalVariant.retailPrice) ||
            newVariant.salePrice !== originalVariant.salePrice ||
            newVariant.stockQuantity !== originalVariant.stockQuantity ||
            newVariant.minStockLevel !==
              (originalVariant.minStockLevel ??
                originalVariant.minStockThreshold) ||
            newVariant.isActive !== originalVariant.isActive;

          if (!hasChanges) {
            alert("Không có thay đổi nào để cập nhật");
            handleCancelEdit();
            return;
          }
        }

        // Update existing variant
        await productVariantsApi.update(editingVariantId, payload);
        alert("Cập nhật biến thể thành công!");
      } else {
        // Create new variant
        await productVariantsApi.create(payload);
        alert("Thêm biến thể thành công!");
      }

      const vars = await productsApi.getVariantsByProduct(productId);
      setVariants((vars as unknown as VariantAny[]) || []);
      handleCancelEdit();
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      alert("Lỗi: " + msg);
    } finally {
      setVariantSubmitting(false);
    }
  };

  const handleDeleteVariant = async (variantId?: number) => {
    if (!isEdit || !productId || !variantId) return;
    if (!confirm("Xóa biến thể này?")) return;
    try {
      await productVariantsApi.delete(variantId);
      setVariants((prev) => prev.filter((v) => v.variantId !== variantId));
      alert("Xóa biến thể thành công!");
      // Cancel edit if deleting the variant being edited
      if (editingVariantId === variantId) {
        handleCancelEdit();
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      alert("Lỗi: " + msg);
    }
  };

  // Handlers cho hình ảnh
  const handleAddImage = async () => {
    if (!isEdit || !productId || !newImageUrl.trim()) return;
    try {
      setImageSubmitting(true);
      await productImagesApi.create({
        productId,
        imageUrl: newImageUrl.trim(),
        isPrimary: newImageIsPrimary,
        displayOrder:
          newImageDisplayOrder === ""
            ? undefined
            : Number(newImageDisplayOrder),
      });
      const imgs = await productImagesApi.getByProduct(productId);
      setImages((imgs as unknown as ImageDTO[]) || []);
      setNewImageUrl("");
      setNewImageIsPrimary(false);
      setNewImageDisplayOrder("");
      alert("Thêm hình ảnh thành công!");
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      alert("Lỗi: " + msg);
    } finally {
      setImageSubmitting(false);
    }
  };

  const handleSetPrimaryImage = async (imageId: number) => {
    if (!isEdit || !productId) return;
    try {
      await productImagesApi.setPrimary(imageId);
      const imgs = await productImagesApi.getByProduct(productId);
      setImages((imgs as unknown as ImageDTO[]) || []);
      alert("Đã đặt làm ảnh chính!");
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      alert("Lỗi: " + msg);
    }
  };

  const handleUpdateDisplayOrder = async (imageId: number) => {
    if (!isEdit || !productId) return;
    const current =
      images.find((i) => i.imageId === imageId)?.displayOrder ?? 0;
    const val = prompt("Nhập thứ tự hiển thị", String(current));
    if (val === null) return;
    const parsed = Number(val);
    if (Number.isNaN(parsed)) return;
    try {
      await productImagesApi.updateDisplayOrder(imageId, parsed);
      const imgs = await productImagesApi.getByProduct(productId);
      setImages((imgs as unknown as ImageDTO[]) || []);
      alert("Cập nhật thứ tự hiển thị thành công!");
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      alert("Lỗi: " + msg);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!isEdit || !productId) return;
    if (!confirm("Xóa hình ảnh này?")) return;
    try {
      await productImagesApi.delete(imageId);
      setImages((prev) => prev.filter((i) => i.imageId !== imageId));
      alert("Xóa hình ảnh thành công!");
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      alert("Lỗi: " + msg);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? "Chỉnh sửa sản phẩm" : "Tạo sản phẩm mới"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit
              ? "Cập nhật thông tin sản phẩm"
              : "Nhập thông tin để tạo sản phẩm"}
          </p>
        </div>
        <Link
          to="/admin/products"
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Quay lại
        </Link>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-lg p-3">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="bg-white rounded-lg shadow p-6">
        {loading ? (
          <div className="py-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-2 text-gray-600">Đang tải...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={onChange("sku")}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VD: TS-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên sản phẩm
                </label>
                <input
                  type="text"
                  value={form.productName}
                  onChange={onChange("productName")}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Áo thun nam"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Danh mục
                </label>
                <select
                  value={form.categoryId ?? ""}
                  onChange={onChange("categoryId")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((c) => (
                    <option key={c.categoryId} value={c.categoryId}>
                      {c.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thương hiệu
                </label>
                <select
                  value={form.brandId ?? ""}
                  onChange={onChange("brandId")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Chọn thương hiệu</option>
                  {brands.map((b) => (
                    <option key={b.brandId} value={b.brandId}>
                      {b.brandName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chất liệu
                </label>
                <input
                  type="text"
                  value={form.material ?? ""}
                  onChange={onChange("material")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Cotton, polyester..."
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={onChange("isActive")}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Hoạt động
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={form.description ?? ""}
                  onChange={onChange("description")}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mô tả chi tiết sản phẩm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hướng dẫn bảo quản
                </label>
                <textarea
                  value={form.careInstructions ?? ""}
                  onChange={onChange("careInstructions")}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Giặt tay, không dùng chất tẩy..."
                />
              </div>
            </div>

            {/* Variants Section */}
            {isEdit ? (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Biến thể sản phẩm
                </h2>
                <div className="overflow-x-auto border rounded-lg">
                  {variants.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500">
                      Chưa có biến thể.
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-gray-600">
                            SKU
                          </th>
                          <th className="px-3 py-2 text-left text-gray-600">
                            Size
                          </th>
                          <th className="px-3 py-2 text-left text-gray-600">
                            Màu
                          </th>
                          <th className="px-3 py-2 text-right text-gray-600">
                            Giá
                          </th>
                          <th className="px-3 py-2 text-right text-gray-600">
                            Giá KM
                          </th>
                          <th className="px-3 py-2 text-right text-gray-600">
                            Tồn kho
                          </th>
                          <th className="px-3 py-2 text-right text-gray-600">
                            Tối thiểu
                          </th>
                          <th className="px-3 py-2 text-center text-gray-600">
                            Trạng thái
                          </th>
                          <th className="px-3 py-2 text-right text-gray-600">
                            Thao tác
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {variants.map((v) => (
                          <tr key={v.variantId} className="border-t">
                            <td className="px-3 py-2">
                              {v.sku || v.variantSku}
                            </td>
                            <td className="px-3 py-2">{v.size}</td>
                            <td className="px-3 py-2">{v.color}</td>
                            <td className="px-3 py-2 text-right">
                              {(v.price ?? v.retailPrice ?? 0).toLocaleString(
                                "vi-VN"
                              )}
                            </td>
                            <td className="px-3 py-2 text-right">
                              {(v.salePrice ?? 0).toLocaleString("vi-VN")}
                            </td>
                            <td className="px-3 py-2 text-right">
                              {v.stockQuantity ?? 0}
                            </td>
                            <td className="px-3 py-2 text-right">
                              {v.minStockLevel ?? v.minStockThreshold ?? 0}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  v.isActive
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {v.isActive ? "Hoạt động" : "Tạm dừng"}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right">
                              <button
                                type="button"
                                onClick={() => handleEditVariant(v)}
                                className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded mr-2"
                              >
                                Sửa
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteVariant(v.variantId)}
                                className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
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

                {/* Add/Edit variant */}
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    {editingVariantId
                      ? "Cập nhật biến thể"
                      : "Thêm biến thể mới"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                    <input
                      type="text"
                      value={newVariant.sku}
                      onChange={onNewVariantChange("sku")}
                      placeholder="SKU"
                      className="px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="text"
                      value={newVariant.size}
                      onChange={onNewVariantChange("size")}
                      placeholder="Size"
                      className="px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="text"
                      value={newVariant.color}
                      onChange={onNewVariantChange("color")}
                      placeholder="Màu"
                      className="px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="number"
                      value={newVariant.price ?? ""}
                      onChange={onNewVariantChange("price")}
                      placeholder="Giá"
                      className="px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="number"
                      value={newVariant.salePrice ?? ""}
                      onChange={onNewVariantChange("salePrice")}
                      placeholder="Giá KM"
                      className="px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="number"
                      value={newVariant.stockQuantity ?? ""}
                      onChange={onNewVariantChange("stockQuantity")}
                      placeholder="Tồn kho"
                      className="px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="number"
                      value={newVariant.minStockLevel ?? ""}
                      onChange={onNewVariantChange("minStockLevel")}
                      placeholder="Tối thiểu"
                      className="px-3 py-2 border rounded-lg"
                    />
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newVariant.isActive}
                        onChange={onNewVariantChange("isActive")}
                        className="h-4 w-4"
                      />
                      <span className="text-sm text-gray-700">Hoạt động</span>
                    </label>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      disabled={variantSubmitting}
                      className={`px-4 py-2 rounded-lg text-white ${
                        variantSubmitting
                          ? "bg-blue-400"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {variantSubmitting
                        ? editingVariantId
                          ? "Đang cập nhật..."
                          : "Đang thêm..."
                        : editingVariantId
                        ? "Cập nhật biến thể"
                        : "Thêm biến thể"}
                    </button>
                    {editingVariantId && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={variantSubmitting}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Hủy
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-8 p-4 border rounded-lg bg-gray-50 text-sm text-gray-600">
                Lưu sản phẩm để thêm biến thể.
              </div>
            )}

            {/* Images Section */}
            {isEdit && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Hình ảnh sản phẩm
                </h2>
                {images.length === 0 ? (
                  <div className="p-4 border rounded-lg text-sm text-gray-500">
                    Chưa có hình ảnh.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((img) => (
                      <div key={img.imageId} className="border rounded-lg p-2">
                        <img
                          src={img.imageUrl}
                          alt="Product"
                          className="w-full h-32 object-cover rounded"
                        />
                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span
                            className={`px-2 py-0.5 rounded-full ${
                              img.isPrimary
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {img.isPrimary ? "Ảnh chính" : "Ảnh phụ"}
                          </span>
                          <span>Thứ tự: {img.displayOrder ?? 0}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(img.imageId)}
                            className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded text-xs"
                          >
                            Đặt chính
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateDisplayOrder(img.imageId)
                            }
                            className="px-2 py-1 text-gray-700 hover:bg-gray-50 rounded text-xs"
                          >
                            Thứ tự
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(img.imageId)}
                            className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-xs"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add image */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="URL hình ảnh"
                    className="px-3 py-2 border rounded-lg"
                  />
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newImageIsPrimary}
                      onChange={(e) => setNewImageIsPrimary(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-gray-700">
                      Đặt làm ảnh chính
                    </span>
                  </label>
                  <input
                    type="number"
                    value={newImageDisplayOrder}
                    onChange={(e) =>
                      setNewImageDisplayOrder(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    placeholder="Thứ tự hiển thị"
                    className="px-3 py-2 border rounded-lg"
                  />
                </div>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={handleAddImage}
                    disabled={imageSubmitting}
                    className={`px-4 py-2 rounded-lg text-white ${
                      imageSubmitting
                        ? "bg-blue-400"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {imageSubmitting ? "Đang thêm..." : "Thêm hình ảnh"}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {isEdit &&
                  "Sau khi cập nhật, bạn có thể tiếp tục chỉnh sửa hoặc quay về danh sách sản phẩm."}
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/admin/products"
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {isEdit ? "Quay về danh sách" : "Hủy"}
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-4 py-2 rounded-lg text-white ${
                    submitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {submitting
                    ? "Đang lưu..."
                    : isEdit
                    ? "Cập nhật sản phẩm"
                    : "Tạo sản phẩm"}
                </button>
              </div>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
