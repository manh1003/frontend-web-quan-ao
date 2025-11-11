import { apiClient } from "./client";
import { unwrap } from "./helpers";
import type { ApiResponse } from "@/types";

export interface Category {
  categoryId: number;
  categoryName: string;
  parentCategoryId?: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  categoryName: string;
  parentCategoryId?: number;
  description?: string;
  isActive?: boolean;
}

export interface UpdateCategoryDto {
  categoryName?: string;
  parentCategoryId?: number;
  description?: string;
  isActive?: boolean;
}

export const categoryApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get<ApiResponse<Category[]>>(
      "/api/categories"
    );
    return unwrap<Category[]>(response.data);
  },

  getById: async (id: number): Promise<Category> => {
    const response = await apiClient.get<ApiResponse<Category>>(
      `/api/categories/${id}`
    );
    return unwrap<Category>(response.data);
  },

  create: async (data: CreateCategoryDto): Promise<Category> => {
    const response = await apiClient.post<ApiResponse<Category>>(
      "/api/categories",
      data
    );
    return unwrap<Category>(response.data);
  },

  update: async (id: number, data: UpdateCategoryDto): Promise<Category> => {
    const response = await apiClient.put<ApiResponse<Category>>(
      `/api/categories/${id}`,
      data
    );
    return unwrap<Category>(response.data);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/categories/${id}`);
  },
};
