import axiosClient from './axiosClient';
import type { ApiResponse, Category } from '../types';

export const categoryService = {
  async getAllCategories(): Promise<ApiResponse<Category[]>> {
    const response = await axiosClient.get<ApiResponse<Category[]>>('/api/v1/categories');
    return response.data;
  },

  async getCategoryById(id: string): Promise<ApiResponse<Category>> {
    const response = await axiosClient.get<ApiResponse<Category>>(`/api/v1/categories/${id}`);
    return response.data;
  },
};
