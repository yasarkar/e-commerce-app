import axiosClient from './axiosClient';
import type { ApiResponse, Product, CreateProductRequest, UpdateProductRequest } from '../types';

export const adminProductService = {
  async createProduct(data: CreateProductRequest): Promise<ApiResponse<Product>> {
    const response = await axiosClient.post<ApiResponse<Product>>('/api/v1/admin/products', data);
    return response.data;
  },

  async updateProduct(id: string, data: UpdateProductRequest): Promise<ApiResponse<Product>> {
    const response = await axiosClient.put<ApiResponse<Product>>(`/api/v1/admin/products/${id}`, data);
    return response.data;
  },

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    const response = await axiosClient.delete<ApiResponse<void>>(`/api/v1/admin/products/${id}`);
    return response.data;
  },
};
