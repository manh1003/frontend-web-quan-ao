import { apiClient } from "./client";
import { unwrap } from "./helpers";
import type { ApiResponse } from "@/types";

export interface Customer {
  customer_id: number;
  email: string;
  phone: string;
  full_name: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  date_of_birth?: string;
  customer_tier?: string;
  total_orders?: number;
  total_spent?: number;
  registration_date?: string;
  created_at?: string;
}

export interface CustomerAddress {
  address_id: number;
  customer_id: number;
  recipient_name: string;
  phone: string;
  address_line: string;
  ward: string;
  district: string;
  city: string;
  is_default: boolean;
}

export interface CreateCustomerDto {
  email: string;
  phone: string;
  fullName: string; // Frontend uses camelCase
  gender?: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth?: string;
}

// Backend expects snake_case
interface CreateCustomerRequestDto {
  email: string;
  phone: string;
  full_name: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  date_of_birth?: string;
}

export interface UpdateCustomerDto {
  email?: string;
  phone?: string;
  fullName?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth?: string;
}

export interface CreateAddressDto {
  customerId: number;
  recipientName: string;
  phone: string;
  addressLine: string;
  ward: string;
  district: string;
  city: string;
  isDefault?: boolean;
}

// Backend expects snake_case
export interface CreateAddressRequestDto {
  customer_id: number;
  recipient_name: string;
  phone: string;
  address_line: string;
  ward: string;
  district: string;
  city: string;
  is_default?: boolean;
}

export const customerApi = {
  getAll: async (): Promise<Customer[]> => {
    const response = await apiClient.get<ApiResponse<Customer[]>>(
      "/api/customers"
    );
    return unwrap<Customer[]>(response.data);
  },

  getById: async (id: number): Promise<Customer> => {
    const response = await apiClient.get<ApiResponse<Customer>>(
      `/api/customers/${id}`
    );
    return unwrap<Customer>(response.data);
  },

  getByEmail: async (email: string): Promise<Customer | null> => {
    try {
      const response = await apiClient.get<ApiResponse<Customer>>(
        `/api/customers/by-email/${encodeURIComponent(email)}`
      );
      return unwrap<Customer>(response.data);
    } catch (error: any) {
      // Return null if customer not found
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  create: async (data: CreateCustomerDto): Promise<Customer> => {
    // Convert to backend format (snake_case)
    const requestData: CreateCustomerRequestDto = {
      email: data.email,
      phone: data.phone,
      full_name: data.fullName,
      gender: data.gender,
      date_of_birth: data.dateOfBirth,
    };

    const response = await apiClient.post<ApiResponse<Customer>>(
      "/api/customers",
      requestData
    );
    return unwrap<Customer>(response.data);
  },

  update: async (id: number, data: UpdateCustomerDto): Promise<Customer> => {
    const response = await apiClient.put<ApiResponse<Customer>>(
      `/api/customers/${id}`,
      data
    );
    return unwrap<Customer>(response.data);
  },

  // Addresses
  getAddresses: async (customerId: number): Promise<CustomerAddress[]> => {
    const response = await apiClient.get<ApiResponse<CustomerAddress[]>>(
      `/api/customer-addresses/customer/${customerId}`
    );
    return unwrap<CustomerAddress[]>(response.data);
  },

  createAddress: async (data: CreateAddressDto): Promise<CustomerAddress> => {
    // Convert to backend format (snake_case)
    const requestData: CreateAddressRequestDto = {
      customer_id: data.customerId,
      recipient_name: data.recipientName,
      phone: data.phone,
      address_line: data.addressLine,
      ward: data.ward,
      district: data.district,
      city: data.city,
      is_default: data.isDefault,
    };

    const response = await apiClient.post<ApiResponse<CustomerAddress>>(
      "/api/customer-addresses",
      requestData
    );
    return unwrap<CustomerAddress>(response.data);
  },

  updateAddress: async (
    addressId: number,
    data: CreateAddressDto
  ): Promise<CustomerAddress> => {
    const requestData: CreateAddressRequestDto = {
      customer_id: data.customerId,
      recipient_name: data.recipientName,
      phone: data.phone,
      address_line: data.addressLine,
      ward: data.ward,
      district: data.district,
      city: data.city,
      is_default: data.isDefault,
    };

    const response = await apiClient.put<ApiResponse<CustomerAddress>>(
      `/api/customer-addresses/${addressId}`,
      requestData
    );
    return unwrap<CustomerAddress>(response.data);
  },

  setDefaultAddress: async (addressId: number): Promise<void> => {
    await apiClient.put(`/api/customer-addresses/${addressId}/set-default`);
  },

  deleteAddress: async (addressId: number): Promise<void> => {
    await apiClient.delete(`/api/customer-addresses/${addressId}`);
  },
};
