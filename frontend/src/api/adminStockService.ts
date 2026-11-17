import axiosClient from './axiosClient';
import type {
  ApiResponse,
  BulkStockUpdateItem,
  BulkStockUpdateResult,
  PageResponse,
  StockMovement,
  StockMovementFilterParams,
} from '../types';

export const adminStockService = {
  async bulkUpdateStock(
    items: BulkStockUpdateItem[]
  ): Promise<ApiResponse<BulkStockUpdateResult[]>> {
    const response = await axiosClient.post<ApiResponse<BulkStockUpdateResult[]>>(
      '/api/v1/admin/stock/bulk',
      { items }
    );
    return response.data;
  },

  async addStock(
    productId: string,
    quantity: number,
    reason?: string
  ): Promise<ApiResponse<StockMovement>> {
    const response = await axiosClient.post<ApiResponse<StockMovement>>(
      `/api/v1/admin/stock/${productId}/add`,
      { quantity, reason }
    );
    return response.data;
  },

  async deductStock(
    productId: string,
    quantity: number,
    reason?: string
  ): Promise<ApiResponse<StockMovement>> {
    const response = await axiosClient.post<ApiResponse<StockMovement>>(
      `/api/v1/admin/stock/${productId}/deduct`,
      { quantity, reason }
    );
    return response.data;
  },

  async adjustStock(
    productId: string,
    newStockQuantity: number,
    reason?: string
  ): Promise<ApiResponse<StockMovement>> {
    const response = await axiosClient.post<ApiResponse<StockMovement>>(
      `/api/v1/admin/stock/${productId}/adjust`,
      { quantity: newStockQuantity, reason }
    );
    return response.data;
  },

  async getMovements(
    params: StockMovementFilterParams
  ): Promise<ApiResponse<PageResponse<StockMovement>>> {
    const response = await axiosClient.get<ApiResponse<PageResponse<StockMovement>>>(
      '/api/v1/admin/stock/movements',
      { params }
    );
    return response.data;
  },

  async getProductMovements(
    productId: string,
    page = 0,
    size = 20
  ): Promise<ApiResponse<PageResponse<StockMovement>>> {
    const response = await axiosClient.get<ApiResponse<PageResponse<StockMovement>>>(
      `/api/v1/admin/stock/movements/product/${productId}`,
      { params: { page, size } }
    );
    return response.data;
  },
};