import { apiClient } from "./client";

export interface WebsiteSettings {
  siteName: string;
  siteDescription: string;
  logoUrl: string;
  faviconUrl: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  primaryColor: string;
  secondaryColor: string;
}

export const settingsApi = {
  // Lấy tất cả cài đặt
  getSettings: async (): Promise<WebsiteSettings> => {
    const response = await apiClient.get<WebsiteSettings>("/api/settings");
    return response.data;
  },

  // Cập nhật tất cả cài đặt
  updateSettings: async (settings: WebsiteSettings): Promise<WebsiteSettings> => {
    const response = await apiClient.put<WebsiteSettings>("/api/settings", settings);
    return response.data;
  },

  // Reset về cài đặt mặc định
  resetSettings: async (): Promise<WebsiteSettings> => {
    const response = await apiClient.post<WebsiteSettings>("/api/settings/reset");
    return response.data;
  },

  // Lấy một setting cụ thể
  getSetting: async (key: string): Promise<{ key: string; value: string }> => {
    const response = await apiClient.get<{ key: string; value: string }>(`/api/settings/${key}`);
    return response.data;
  },

  // Cập nhật một setting cụ thể
  updateSetting: async (key: string, value: string): Promise<WebsiteSettings> => {
    const response = await apiClient.patch<WebsiteSettings>(`/api/settings/${key}`, { value });
    return response.data;
  },
};