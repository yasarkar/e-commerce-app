import axiosClient from './axiosClient';
import type { ApiResponse, PageResponse, Product, ProductFilterParams } from '../types';

export const productService = {
  async getProducts(params: ProductFilterParams): Promise<ApiResponse<PageResponse<Product>>> {
    const cleanedParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    const response = await axiosClient.get<ApiResponse<PageResponse<Product>>>('/api/v1/products', {
      params: cleanedParams,
    });
    return response.data;
  },

  async getProductById(id: string): Promise<ApiResponse<Product>> {
    const response = await axiosClient.get<ApiResponse<Product>>(`/api/v1/products/${id}`);
    return response.data;
  },
};
