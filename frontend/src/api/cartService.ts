import axiosClient from './axiosClient';
import type { ApiResponse, Cart } from '../types';

export const cartService = {
  async getCart(): Promise<ApiResponse<Cart>> {
    const response = await axiosClient.get<ApiResponse<Cart>>('/api/v1/cart');
    return response.data;
  },

  async addItem(productId: string, quantity: number): Promise<ApiResponse<Cart>> {
    const response = await axiosClient.post<ApiResponse<Cart>>('/api/v1/cart/items', {
      productId,
      quantity,
    });
    return response.data;
  },

  async updateItemQuantity(productId: string, quantity: number): Promise<ApiResponse<Cart>> {
    const response = await axiosClient.put<ApiResponse<Cart>>(`/api/v1/cart/items/${productId}`, {
      quantity,
    });
    return response.data;
  },

  async removeItem(productId: string): Promise<ApiResponse<Cart>> {
    const response = await axiosClient.delete<ApiResponse<Cart>>(`/api/v1/cart/items/${productId}`);
    return response.data;
  },

  async clearCart(): Promise<ApiResponse<void>> {
    const response = await axiosClient.delete<ApiResponse<void>>('/api/v1/cart');
    return response.data;
  },
};
