import { apiClient } from "./client";
import { unwrap } from "./helpers";
import type { ApiResponse } from "@/types";

export interface Brand {
  brandId: number;
  brandName: string;
  description?: string;
  logoUrl?: string;
  country?: string;
  website?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBrandDto {
  brandName: string;
  description?: string;
  logoUrl?: string;
  country?: string;
  website?: string;
  isActive?: boolean;
}

export interface UpdateBrandDto {
  brandName?: string;
  description?: string;
  logoUrl?: string;
  country?: string;
  website?: string;
  isActive?: boolean;
}

export const brandApi = {
  getAll: async (): Promise<Brand[]> => {
    const response = await apiClient.get<ApiResponse<Brand[]>>("/api/brands");
    return unwrap<Brand[]>(response.data);
  },

  getActive: async (): Promise<Brand[]> => {
    const response = await apiClient.get<ApiResponse<Brand[]>>(
      "/api/brands/active"
    );
    return unwrap<Brand[]>(response.data);
  },

  getById: async (id: number): Promise<Brand> => {
    const response = await apiClient.get<ApiResponse<Brand>>(
      `/api/brands/${id}`
    );
    return unwrap<Brand>(response.data);
  },

  create: async (data: CreateBrandDto): Promise<Brand> => {
    const response = await apiClient.post<ApiResponse<Brand>>(
      "/api/brands",
      data
    );
    return unwrap<Brand>(response.data);
  },

  update: async (id: number, data: UpdateBrandDto): Promise<Brand> => {
    const response = await apiClient.put<ApiResponse<Brand>>(
      `/api/brands/${id}`,
      data
    );
    return unwrap<Brand>(response.data);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/brands/${id}`);
  },
};
