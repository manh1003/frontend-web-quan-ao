import { apiClient } from "./client";

export interface HeroBanner {
  bannerId: number;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  buttonText?: string;
  displayOrder: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  backgroundColor?: string;
  textColor?: string;
  createdAt: string;
  updatedAt: string;
}

export const bannersApi = {
  // Public endpoints
  getActiveBanners: async (): Promise<HeroBanner[]> => {
    const response = await apiClient.get("/api/banners/active");
    // API returns ApiResponse wrapper, extract data field
    return response.data?.data || [];
  },

  getCurrentBanners: async (): Promise<HeroBanner[]> => {
    const response = await apiClient.get("/api/banners/current");
    // API returns ApiResponse wrapper, extract data field
    return response.data?.data || [];
  },

  // Admin endpoints
  getAllBanners: async (): Promise<HeroBanner[]> => {
    const response = await apiClient.get("/api/admin/banners");
    // API returns ApiResponse wrapper, extract data field
    return response.data?.data || [];
  },

  getBannerById: async (id: number): Promise<HeroBanner> => {
    const response = await apiClient.get(`/api/admin/banners/${id}`);
    return response.data?.data;
  },

  createBanner: async (banner: Partial<HeroBanner>): Promise<HeroBanner> => {
    const response = await apiClient.post("/api/admin/banners", banner);
    return response.data?.data;
  },

  updateBanner: async (
    id: number,
    banner: Partial<HeroBanner>
  ): Promise<HeroBanner> => {
    const response = await apiClient.put(`/api/admin/banners/${id}`, banner);
    return response.data?.data;
  },

  deleteBanner: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/admin/banners/${id}`);
  },

  toggleBannerStatus: async (id: number): Promise<HeroBanner> => {
    const response = await apiClient.patch(`/api/admin/banners/${id}/toggle`);
    return response.data?.data;
  },
};
