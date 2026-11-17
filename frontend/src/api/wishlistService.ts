import axiosClient from './axiosClient';
import type { ApiResponse, Wishlist } from '../types';

export const wishlistService = {
  async getWishlist(): Promise<ApiResponse<Wishlist>> {
    const response = await axiosClient.get<ApiResponse<Wishlist>>('/api/v1/wishlist');
    return response.data;
  },

  async addItem(productId: string): Promise<ApiResponse<Wishlist>> {
    const response = await axiosClient.post<ApiResponse<Wishlist>>(`/api/v1/wishlist/items/${productId}`);
    return response.data;
  },

  async removeItem(productId: string): Promise<ApiResponse<Wishlist>> {
    const response = await axiosClient.delete<ApiResponse<Wishlist>>(`/api/v1/wishlist/items/${productId}`);
    return response.data;
  },

  async clearWishlist(): Promise<ApiResponse<void>> {
    const response = await axiosClient.delete<ApiResponse<void>>('/api/v1/wishlist');
    return response.data;
  },

  async checkProduct(productId: string): Promise<ApiResponse<{ inWishlist: boolean }>> {
    const response = await axiosClient.get<ApiResponse<{ inWishlist: boolean }>>(`/api/v1/wishlist/check/${productId}`);
    return response.data;
  },
};