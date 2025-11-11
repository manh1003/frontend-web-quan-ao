import apiClient from "./client";
import { unwrap } from "./helpers";
import type { Order, ApiResponse } from "@/types";

export interface CreateOrderRequest {
  customer_id: number;
  shipping_address_id: number;
  shipping_method: string;
  payment_method: string;
  items: Array<{
    variant_id: number;
    quantity: number;
    unit_price: number;
  }>;
  subtotal: number;
  discount_amount: number;
  shipping_fee: number;
  total_amount: number;
  notes?: string;
}

export const ordersApi = {
  // Tạo đơn hàng mới
  create: async (data: CreateOrderRequest): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<Order>>(
      "/api/orders",
      data
    );
    return unwrap<Order>(response.data);
  },

  // Lấy đơn hàng theo customer
  getByCustomer: async (customerId: number): Promise<Order[]> => {
    const response = await apiClient.get<ApiResponse<Order[]>>(
      `/api/orders/customer/${customerId}`
    );
    return unwrap<Order[]>(response.data);
  },

  // Lấy đơn hàng theo ID
  getById: async (id: number): Promise<Order> => {
    const response = await apiClient.get<ApiResponse<Order>>(
      `/api/orders/${id}`
    );
    return unwrap<Order>(response.data);
  },

  // Cập nhật trạng thái đơn hàng
  updateStatus: async (id: number, status: string): Promise<Order> => {
    const response = await apiClient.patch<ApiResponse<Order>>(
      `/api/orders/${id}/status`,
      { status }
    );
    return unwrap<Order>(response.data);
  },

  // Cập nhật địa chỉ giao hàng
  updateShippingAddress: async (
    orderId: number,
    addressId: number
  ): Promise<Order> => {
    const response = await apiClient.patch<ApiResponse<Order>>(
      `/api/orders/${orderId}/shipping-address`,
      { shipping_address_id: addressId }
    );
    return unwrap<Order>(response.data);
  },

  // Hủy đơn hàng
  cancel: async (orderId: number, reason?: string): Promise<Order> => {
    const response = await apiClient.patch<ApiResponse<Order>>(
      `/api/orders/${orderId}/status`,
      {
        status: "CANCELLED",
        cancellation_reason: reason
      }
    );
    return unwrap<Order>(response.data);
  },

  // Yêu cầu hoàn trả đơn hàng
  requestReturn: async (orderId: number, reason?: string): Promise<Order> => {
    const response = await apiClient.patch<ApiResponse<Order>>(
      `/api/orders/${orderId}/status`,
      {
        status: "RETURNED",
        return_reason: reason
      }
    );
    return unwrap<Order>(response.data);
  },

  // Lấy tất cả đơn hàng (dashboard)
  list: async (): Promise<Order[]> => {
    const response = await apiClient.get<ApiResponse<Order[]>>("/api/orders");
    return unwrap<Order[]>(response.data);
  },
};

// Export individual functions for easier use
export const getOrders = ordersApi.list;
export const createOrder = ordersApi.create;
export const getOrderById = ordersApi.getById;
export const getOrdersByCustomer = ordersApi.getByCustomer;
export const updateOrderStatus = ordersApi.updateStatus;
