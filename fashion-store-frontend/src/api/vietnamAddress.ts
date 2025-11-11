// Vietnam Address API Service
// Using: https://provinces.open-api.vn/api/

export interface Province {
  code: number;
  name: string;
  name_en?: string;
  full_name: string;
  full_name_en?: string;
  code_name?: string;
}

export interface District {
  code: number;
  name: string;
  name_en?: string;
  full_name: string;
  full_name_en?: string;
  code_name?: string;
  province_code: number;
}

export interface Ward {
  code: number;
  name: string;
  name_en?: string;
  full_name: string;
  full_name_en?: string;
  code_name?: string;
  district_code: number;
}

const BASE_URL = "https://provinces.open-api.vn/api";

export const vietnamAddressApi = {
  // Lấy tất cả tỉnh/thành phố
  getProvinces: async (): Promise<Province[]> => {
    try {
      const response = await fetch(`${BASE_URL}/p/`);
      if (!response.ok) throw new Error("Failed to fetch provinces");
      return await response.json();
    } catch (error) {
      console.error("Error fetching provinces:", error);
      return [];
    }
  },

  // Lấy quận/huyện theo mã tỉnh
  getDistricts: async (provinceCode: number): Promise<District[]> => {
    try {
      const response = await fetch(`${BASE_URL}/p/${provinceCode}?depth=2`);
      if (!response.ok) throw new Error("Failed to fetch districts");
      const data = await response.json();
      return data.districts || [];
    } catch (error) {
      console.error("Error fetching districts:", error);
      return [];
    }
  },

  // Lấy phường/xã theo mã quận
  getWards: async (districtCode: number): Promise<Ward[]> => {
    try {
      const response = await fetch(`${BASE_URL}/d/${districtCode}?depth=2`);
      if (!response.ok) throw new Error("Failed to fetch wards");
      const data = await response.json();
      return data.wards || [];
    } catch (error) {
      console.error("Error fetching wards:", error);
      return [];
    }
  },
};
