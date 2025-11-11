import { apiClient } from './client'
import { unwrap } from './helpers'

export interface DashboardReport {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  additionalData?: Record<string, unknown>
}

export interface SalesReport {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers?: number;
  totalProducts?: number;
  dailySales?: { date: string; revenue: number }[];
  additionalData?: {
    startDate: string;
    endDate: string;
    averageOrderValue: number;
    [key: string]: unknown;
  };
}

export interface InventoryReport {
  totalVariants: number
  lowStockCount: number
  lowStockItems: Array<{
    variantId: number
    sku: string
    currentStock: number
    minThreshold: number
  }>
}

export interface OrderStatusReport {
  [status: string]: number
}

/**
 * Lấy dữ liệu dashboard tổng quan
 */
export const getDashboardReport = async (): Promise<DashboardReport> => {
  const response = await apiClient.get('/api/reports/dashboard')
  return unwrap<DashboardReport>(response.data)
}

/**
 * Lấy báo cáo doanh thu theo thời gian
 */
export const getSalesReport = async (
  startDate: string,
  endDate: string
): Promise<SalesReport> => {
  const response = await apiClient.get('/api/reports/sales', {
    params: { startDate, endDate, _: new Date().getTime() }
  })
  return unwrap<SalesReport>(response.data)
}

/**
 * Lấy báo cáo tồn kho
 */
export const getInventoryReport = async (): Promise<InventoryReport> => {
  const response = await apiClient.get('/api/reports/inventory')
  return unwrap<InventoryReport>(response.data)
}

/**
 * Lấy báo cáo trạng thái đơn hàng
 */
export const getOrderStatusReport = async (): Promise<OrderStatusReport> => {
  const response = await apiClient.get('/api/reports/order-status')
  return unwrap<OrderStatusReport>(response.data)
}