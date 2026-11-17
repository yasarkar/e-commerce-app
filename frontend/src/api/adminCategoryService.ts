import axiosClient from './axiosClient';
import type { ApiResponse, Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types';

export const adminCategoryService = {
  async createCategory(data: CreateCategoryRequest): Promise<ApiResponse<Category>> {
    const response = await axiosClient.post<ApiResponse<Category>>('/api/v1/admin/categories', data);
    return response.data;
  },

  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<ApiResponse<Category>> {
    const response = await axiosClient.put<ApiResponse<Category>>(`/api/v1/admin/categories/${id}`, data);
    return response.data;
  },

  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    const response = await axiosClient.delete<ApiResponse<void>>(`/api/v1/admin/categories/${id}`);
    return response.data;
  },
};
