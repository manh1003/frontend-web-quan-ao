import apiClient from "./client";
import { unwrap } from "./helpers";
import type {
  Product,
  ProductVariant,
  ProductImage,
  ApiResponse,
  Brand,
  ProductCategory,
} from "@/types";

export const productsApi = {
  // Lấy danh sách sản phẩm
  getAll: async (): Promise<Product[]> => {
    const response = await apiClient.get<ApiResponse<Product[]>>(
      "/api/products"
    );
    return unwrap<Product[]>(response.data);
  },

  // Lấy sản phẩm theo ID
  getById: async (id: number): Promise<Product> => {
    const response = await apiClient.get<ApiResponse<Product>>(
      `/api/products/${id}`
    );
    return unwrap<Product>(response.data);
  },

  // Lấy sản phẩm liên quan (cùng danh mục hoặc thương hiệu)
  getRelated: async (id: number, limit: number = 4): Promise<Product[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Product[]>>(
        `/api/products/${id}/related`,
        { params: { limit } }
      );
      return unwrap<Product[]>(response.data);
    } catch {
      // Nếu API không có endpoint related, fallback về cách lấy sản phẩm cùng category
      const product = await productsApi.getById(id);
      const allProducts = await productsApi.getAll();
      
      // Lọc sản phẩm cùng category hoặc brand, loại trừ sản phẩm hiện tại
      const related = allProducts
        .filter(p =>
          p.productId !== id &&
          (p.categoryId === product.categoryId || p.brandId === product.brandId)
        )
        .slice(0, limit);
      
      return related;
    }
  },

  // Tạo sản phẩm mới
  create: async (product: Partial<Product>): Promise<Product> => {
    const response = await apiClient.post<ApiResponse<Product>>(
      "/api/products",
      product
    );
    return unwrap<Product>(response.data);
  },

  // Cập nhật sản phẩm
  update: async (id: number, product: Partial<Product>): Promise<Product> => {
    const response = await apiClient.put<ApiResponse<Product>>(
      `/api/products/${id}`,
      product
    );
    return unwrap<Product>(response.data);
  },

  // Xóa sản phẩm
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/products/${id}`);
  },

  // Lấy tất cả biến thể (variants)
  getAllVariants: async (): Promise<ProductVariant[]> => {
    const response = await apiClient.get<ApiResponse<ProductVariant[]>>(
      "/api/product-variants"
    );
    return unwrap<ProductVariant[]>(response.data);
  },

  // Lấy biến thể theo sản phẩm
  getVariantsByProduct: async (
    productId: number
  ): Promise<ProductVariant[]> => {
    const response = await apiClient.get<ApiResponse<ProductVariant[]>>(
      `/api/product-variants/product/${productId}`
    );
    return unwrap<ProductVariant[]>(response.data);
  },

  // Lấy biến thể theo ID
  getVariantById: async (id: number): Promise<ProductVariant> => {
    const response = await apiClient.get<ApiResponse<ProductVariant>>(
      `/api/product-variants/${id}`
    );
    return unwrap<ProductVariant>(response.data);
  },
};

// API cho danh mục sản phẩm
export const categoriesApi = {
  // Lấy tất cả danh mục
  getAll: async (): Promise<ProductCategory[]> => {
    const response = await apiClient.get<ApiResponse<ProductCategory[]>>(
      "/api/categories"
    );
    return unwrap<ProductCategory[]>(response.data);
  },

  // Lấy danh mục theo ID
  getById: async (id: number): Promise<ProductCategory> => {
    const response = await apiClient.get<ApiResponse<ProductCategory>>(
      `/api/categories/${id}`
    );
    return unwrap<ProductCategory>(response.data);
  },

  // Tạo danh mục mới
  create: async (
    category: Partial<ProductCategory>
  ): Promise<ProductCategory> => {
    const response = await apiClient.post<ApiResponse<ProductCategory>>(
      "/api/categories",
      category
    );
    return unwrap<ProductCategory>(response.data);
  },

  // Cập nhật danh mục
  update: async (
    id: number,
    category: Partial<ProductCategory>
  ): Promise<ProductCategory> => {
    const response = await apiClient.put<ApiResponse<ProductCategory>>(
      `/api/categories/${id}`,
      category
    );
    return unwrap<ProductCategory>(response.data);
  },

  // Xóa danh mục
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/categories/${id}`);
  },
};

// API cho thương hiệu
export const brandsApi = {
  // Lấy tất cả thương hiệu
  getAll: async (): Promise<Brand[]> => {
    const response = await apiClient.get<ApiResponse<Brand[]>>("/api/brands");
    return unwrap<Brand[]>(response.data);
  },

  // Lấy thương hiệu đang hoạt động
  getActive: async (): Promise<Brand[]> => {
    const response = await apiClient.get<ApiResponse<Brand[]>>(
      "/api/brands/active"
    );
    return unwrap<Brand[]>(response.data);
  },

  // Lấy thương hiệu theo ID
  getById: async (id: number): Promise<Brand> => {
    const response = await apiClient.get<ApiResponse<Brand>>(
      `/api/brands/${id}`
    );
    return unwrap<Brand>(response.data);
  },

  // Tạo thương hiệu mới
  create: async (brand: Partial<Brand>): Promise<Brand> => {
    const response = await apiClient.post<ApiResponse<Brand>>(
      "/api/brands",
      brand
    );
    return unwrap<Brand>(response.data);
  },

  // Cập nhật thương hiệu
  update: async (id: number, brand: Partial<Brand>): Promise<Brand> => {
    const response = await apiClient.put<ApiResponse<Brand>>(
      `/api/brands/${id}`,
      brand
    );
    return unwrap<Brand>(response.data);
  },

  // Xóa thương hiệu
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/brands/${id}`);
  },
};

// API cho biến thể sản phẩm
export const productVariantsApi = {
  // Tạo biến thể
  create: async (variant: Partial<ProductVariant>): Promise<ProductVariant> => {
    const response = await apiClient.post<ApiResponse<ProductVariant>>(
      "/api/product-variants",
      variant
    );
    return unwrap<ProductVariant>(response.data);
  },
  // Cập nhật biến thể
  update: async (
    id: number,
    variant: Partial<ProductVariant>
  ): Promise<ProductVariant> => {
    const response = await apiClient.put<ApiResponse<ProductVariant>>(
      `/api/product-variants/${id}`,
      variant
    );
    return unwrap<ProductVariant>(response.data);
  },
  // Xóa biến thể
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/product-variants/${id}`);
  },
};

// API cho hình ảnh sản phẩm
export const productImagesApi = {
  // Lấy ảnh theo sản phẩm
  getByProduct: async (productId: number): Promise<ProductImage[]> => {
    const response = await apiClient.get<ApiResponse<ProductImage[]>>(
      `/api/product-images/product/${productId}`
    );
    return unwrap<ProductImage[]>(response.data);
  },
  // Lấy ảnh theo biến thể
  getByVariant: async (variantId: number): Promise<ProductImage[]> => {
    const response = await apiClient.get<ApiResponse<ProductImage[]>>(
      `/api/product-images/variant/${variantId}`
    );
    return unwrap<ProductImage[]>(response.data);
  },
  // Lấy ảnh chính của sản phẩm
  getPrimary: async (productId: number): Promise<ProductImage> => {
    const response = await apiClient.get<ApiResponse<ProductImage>>(
      `/api/product-images/product/${productId}/primary`
    );
    return unwrap<ProductImage>(response.data);
  },
  // Tạo ảnh mới
  create: async (
    image: Partial<ProductImage> & { productId?: number; variantId?: number }
  ): Promise<ProductImage> => {
    const response = await apiClient.post<ApiResponse<ProductImage>>(
      "/api/product-images",
      image
    );
    return unwrap<ProductImage>(response.data);
  },
  // Cập nhật ảnh
  update: async (
    id: number,
    image: Partial<ProductImage>
  ): Promise<ProductImage> => {
    const response = await apiClient.put<ApiResponse<ProductImage>>(
      `/api/product-images/${id}`,
      image
    );
    return unwrap<ProductImage>(response.data);
  },
  // Đặt ảnh làm chính
  setPrimary: async (id: number): Promise<void> => {
    await apiClient.put<ApiResponse<void>>(
      `/api/product-images/${id}/set-primary`,
      {}
    );
  },
  // Cập nhật thứ tự hiển thị
  updateDisplayOrder: async (
    id: number,
    displayOrder: number
  ): Promise<void> => {
    await apiClient.put<ApiResponse<void>>(
      `/api/product-images/${id}/display-order`,
      undefined,
      {
        params: { displayOrder },
      }
    );
  },
  // Xóa ảnh
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/product-images/${id}`);
  },
  // Xóa tất cả ảnh của sản phẩm
  deleteAllByProduct: async (productId: number): Promise<void> => {
    await apiClient.delete(`/api/product-images/product/${productId}`);
  },
};
