import { apiClient } from "./client";
import { unwrap } from "./helpers";
import type { ApiResponse } from "@/types";

export interface Promotion {
  promotionId: number;
  promotionName: string;
  description?: string;
  promotionType: "PRODUCT_DISCOUNT" | "BUY_X_GET_Y" | "BUNDLE";
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  couponId: number;
  couponCode: string;
  couponName: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  usageLimit?: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreatePromotionDto {
  promotionName: string;
  description?: string;
  promotionType: "PRODUCT_DISCOUNT" | "BUY_X_GET_Y" | "BUNDLE";
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

export interface CreateCouponDto {
  couponCode: string;
  couponName: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  usageLimit?: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

export const promotionApi = {
  // Promotions
  getAllPromotions: async (): Promise<Promotion[]> => {
    const response = await apiClient.get<ApiResponse<Promotion[]>>(
      "/api/promotions"
    );
    return unwrap<Promotion[]>(response.data);
  },

  getPromotionById: async (id: number): Promise<Promotion> => {
    const response = await apiClient.get<ApiResponse<Promotion>>(
      `/api/promotions/${id}`
    );
    return unwrap<Promotion>(response.data);
  },

  getActivePromotions: async (): Promise<Promotion[]> => {
    const response = await apiClient.get<ApiResponse<Promotion[]>>(
      "/api/promotions/active"
    );
    return unwrap<Promotion[]>(response.data);
  },

  createPromotion: async (data: CreatePromotionDto): Promise<Promotion> => {
    const response = await apiClient.post<ApiResponse<Promotion>>(
      "/api/promotions",
      data
    );
    return unwrap<Promotion>(response.data);
  },

  updatePromotion: async (
    id: number,
    data: Partial<CreatePromotionDto>
  ): Promise<Promotion> => {
    const response = await apiClient.put<ApiResponse<Promotion>>(
      `/api/promotions/${id}`,
      data
    );
    return unwrap<Promotion>(response.data);
  },

  deletePromotion: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/promotions/${id}`);
  },

  togglePromotionStatus: async (id: number): Promise<void> => {
    await apiClient.put(`/api/promotions/${id}/toggle-status`);
  },

  // Coupons
  getAllCoupons: async (): Promise<Coupon[]> => {
    const response = await apiClient.get<ApiResponse<Coupon[]>>("/api/coupons");
    return unwrap<Coupon[]>(response.data);
  },

  getActiveCoupons: async (): Promise<Coupon[]> => {
    const response = await apiClient.get<ApiResponse<Coupon[]>>(
      "/api/coupons/active"
    );
    return unwrap<Coupon[]>(response.data);
  },

  validateCoupon: async (code: string): Promise<any> => {
    const response = await apiClient.post(`/api/coupons/validate/${code}`);
    return unwrap<any>(response.data);
  },

  createCoupon: async (data: CreateCouponDto): Promise<Coupon> => {
    const response = await apiClient.post<ApiResponse<Coupon>>(
      "/api/coupons",
      data
    );
    return unwrap<Coupon>(response.data);
  },
};
