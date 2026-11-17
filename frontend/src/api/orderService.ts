import axiosClient from './axiosClient';
import type { ApiResponse, PageResponse, Order, CreateOrderRequest } from '../types';

export const orderService = {
  async createOrder(data: CreateOrderRequest): Promise<ApiResponse<Order>> {
    const response = await axiosClient.post<ApiResponse<Order>>('/api/v1/orders', data);
    return response.data;
  },

  async getOrderById(orderId: string): Promise<ApiResponse<Order>> {
    const response = await axiosClient.get<ApiResponse<Order>>(`/api/v1/orders/${orderId}`);
    return response.data;
  },

  async getMyOrders(page = 0, size = 10): Promise<ApiResponse<PageResponse<Order>>> {
    const response = await axiosClient.get<ApiResponse<PageResponse<Order>>>(
      `/api/v1/orders/my-orders?page=${page}&size=${size}`
    );
    return response.data;
  },

  async cancelOrder(orderId: string): Promise<ApiResponse<Order>> {
    const response = await axiosClient.patch<ApiResponse<Order>>(`/api/v1/orders/${orderId}/cancel`);
    return response.data;
  },
};