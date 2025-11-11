import apiClient from "./client";
import { unwrap } from "./helpers";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  ApiResponse,
} from "@/types";

export const authApi = {
  // Đăng ký
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      "/api/auth/register",
      data
    );
    return response.data;
  },

  // Đăng nhập
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      "/api/auth/login",
      data
    );
    return response.data;
  },

  // Lấy thông tin user hiện tại
  me: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>("/api/auth/me");
    return unwrap<User>(response.data);
  },

  // Cập nhật thông tin cá nhân
  updateProfile: async (data: {
    fullName?: string;
    email?: string;
    phone?: string;
  }): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>(
      "/api/auth/update-profile",
      data
    );
    return unwrap<User>(response.data);
  },

  // Đổi mật khẩu
  changePassword: async (data: {
    oldPassword: string;
    newPassword: string;
  }): Promise<void> => {
    await apiClient.post("/api/auth/change-password", data);
  },

  // Đăng xuất
  logout: async (): Promise<void> => {
    await apiClient.post("/api/auth/logout");
  },

  // Refresh token
  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/api/auth/refresh",
      { refreshToken }
    );
    return unwrap<AuthResponse>(response.data);
  },
};
