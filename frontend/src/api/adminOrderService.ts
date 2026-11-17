import axiosClient from './axiosClient';
import type { ApiResponse, PageResponse, Order, OrderStatus } from '../types';

export const adminOrderService = {
  async getAllOrders(page = 0, size = 10): Promise<ApiResponse<PageResponse<Order>>> {
    const response = await axiosClient.get<ApiResponse<PageResponse<Order>>>(
      `/api/v1/admin/orders?page=${page}&size=${size}`
    );
    return response.data;
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<ApiResponse<Order>> {
    const response = await axiosClient.patch<ApiResponse<Order>>(
      `/api/v1/admin/orders/${id}/status?status=${status}`
    );
    return response.data;
  },

  async deleteOrder(id: string): Promise<ApiResponse<void>> {
    const response = await axiosClient.delete<ApiResponse<void>>(`/api/v1/admin/orders/${id}`);
    return response.data;
  },
};
