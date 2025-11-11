import { apiClient } from "./client";
import { unwrap } from "./helpers";
import type { ApiResponse } from "@/types";

export interface Supplier {
  supplierId: number;
  supplierName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxCode?: string;
  paymentTerms?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrder {
  poId: number;
  poNumber: string;
  supplierId: number;
  supplierName?: string;
  orderDate: string;
  expectedDate: string;
  receivedDate?: string;
  status: "PENDING" | "APPROVED" | "RECEIVED" | "CANCELLED";
  totalAmount: number;
  notes?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryTransaction {
  transactionId: number;
  variantId: number;
  variantName?: string;
  variantSku?: string;
  transactionType: "IN" | "OUT" | "ADJUSTMENT";
  quantity: number;
  stockBefore?: number;
  stockAfter?: number;
  referenceType?: string;
  referenceId?: number;
  notes?: string;
  createdById?: number;
  createdByName?: string;
  createdAt: string;
}

export interface CreateSupplierDto {
  supplierName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxCode?: string;
  paymentTerms?: string;
  isActive?: boolean;
}

export interface CreatePurchaseOrderDto {
  poNumber: string;
  supplierId: number;
  orderDate: string;
  expectedDate: string;
  totalAmount: number;
  notes?: string;
}

export interface CreateInventoryTransactionDto {
  variantId: number;
  transactionType: "IN" | "OUT" | "ADJUSTMENT";
  quantity: number;
  referenceType?: string;
  referenceId?: number;
  notes?: string;
}

export const inventoryApi = {
  // Suppliers
  getAllSuppliers: async (): Promise<Supplier[]> => {
    const response = await apiClient.get<ApiResponse<Supplier[]>>(
      "/api/suppliers"
    );
    return unwrap<Supplier[]>(response.data);
  },

  getActiveSuppliers: async (): Promise<Supplier[]> => {
    const response = await apiClient.get<ApiResponse<Supplier[]>>(
      "/api/suppliers/active"
    );
    return unwrap<Supplier[]>(response.data);
  },

  getSupplierById: async (id: number): Promise<Supplier> => {
    const response = await apiClient.get<ApiResponse<Supplier>>(
      `/api/suppliers/${id}`
    );
    return unwrap<Supplier>(response.data);
  },

  createSupplier: async (data: CreateSupplierDto): Promise<Supplier> => {
    const response = await apiClient.post<ApiResponse<Supplier>>(
      "/api/suppliers",
      data
    );
    return unwrap<Supplier>(response.data);
  },

  updateSupplier: async (
    id: number,
    data: Partial<CreateSupplierDto>
  ): Promise<Supplier> => {
    const response = await apiClient.put<ApiResponse<Supplier>>(
      `/api/suppliers/${id}`,
      data
    );
    return unwrap<Supplier>(response.data);
  },

  deleteSupplier: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/suppliers/${id}`);
  },

  // Purchase Orders
  getAllPurchaseOrders: async (): Promise<PurchaseOrder[]> => {
    const response = await apiClient.get<ApiResponse<PurchaseOrder[]>>(
      "/api/purchase-orders"
    );
    return unwrap<PurchaseOrder[]>(response.data);
  },

  getPurchaseOrderById: async (id: number): Promise<PurchaseOrder> => {
    const response = await apiClient.get<ApiResponse<PurchaseOrder>>(
      `/api/purchase-orders/${id}`
    );
    return unwrap<PurchaseOrder>(response.data);
  },

  getPurchaseOrdersByStatus: async (
    status: string
  ): Promise<PurchaseOrder[]> => {
    const response = await apiClient.get<ApiResponse<PurchaseOrder[]>>(
      `/api/purchase-orders/status/${status}`
    );
    return unwrap<PurchaseOrder[]>(response.data);
  },

  createPurchaseOrder: async (
    data: CreatePurchaseOrderDto
  ): Promise<PurchaseOrder> => {
    const response = await apiClient.post<ApiResponse<PurchaseOrder>>(
      "/api/purchase-orders",
      data
    );
    return unwrap<PurchaseOrder>(response.data);
  },

  updatePurchaseOrder: async (
    id: number,
    data: Partial<CreatePurchaseOrderDto>
  ): Promise<PurchaseOrder> => {
    const response = await apiClient.put<ApiResponse<PurchaseOrder>>(
      `/api/purchase-orders/${id}`,
      data
    );
    return unwrap<PurchaseOrder>(response.data);
  },

  approvePurchaseOrder: async (id: number): Promise<void> => {
    await apiClient.put(`/api/purchase-orders/${id}/approve`);
  },

  receivePurchaseOrder: async (
    id: number,
    receivedDate: string
  ): Promise<void> => {
    await apiClient.put(
      `/api/purchase-orders/${id}/receive?receivedDate=${receivedDate}`
    );
  },

  cancelPurchaseOrder: async (id: number): Promise<void> => {
    await apiClient.put(`/api/purchase-orders/${id}/cancel`);
  },

  // Inventory Transactions
  getAllTransactions: async (): Promise<InventoryTransaction[]> => {
    const response = await apiClient.get<ApiResponse<InventoryTransaction[]>>(
      "/api/inventory-transactions"
    );
    return unwrap<InventoryTransaction[]>(response.data);
  },

  getTransactionsByVariant: async (
    variantId: number
  ): Promise<InventoryTransaction[]> => {
    const response = await apiClient.get<ApiResponse<InventoryTransaction[]>>(
      `/api/inventory-transactions/by-variant/${variantId}`
    );
    return unwrap<InventoryTransaction[]>(response.data);
  },

  getTransactionsByType: async (
    type: string
  ): Promise<InventoryTransaction[]> => {
    const response = await apiClient.get<ApiResponse<InventoryTransaction[]>>(
      `/api/inventory-transactions/by-type/${type}`
    );
    return unwrap<InventoryTransaction[]>(response.data);
  },

  createTransaction: async (
    data: CreateInventoryTransactionDto
  ): Promise<InventoryTransaction> => {
    const response = await apiClient.post<ApiResponse<InventoryTransaction>>(
      "/api/inventory-transactions",
      data
    );
    return unwrap<InventoryTransaction>(response.data);
  },

  deleteTransaction: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/inventory-transactions/${id}`);
  },
};
