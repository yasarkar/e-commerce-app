import axiosClient from './axiosClient';
import type { ApiResponse, Coupon, CreateCouponRequest, UpdateCouponRequest } from '../types';

export const adminCouponService = {
  async getAllCoupons(): Promise<ApiResponse<Coupon[]>> {
    const response = await axiosClient.get<ApiResponse<Coupon[]>>('/api/v1/admin/coupons');
    return response.data;
  },

  async getCouponById(id: string): Promise<ApiResponse<Coupon>> {
    const response = await axiosClient.get<ApiResponse<Coupon>>(`/api/v1/admin/coupons/${id}`);
    return response.data;
  },

  async createCoupon(data: CreateCouponRequest): Promise<ApiResponse<Coupon>> {
    const response = await axiosClient.post<ApiResponse<Coupon>>('/api/v1/admin/coupons', data);
    return response.data;
  },

  async updateCoupon(id: string, data: UpdateCouponRequest): Promise<ApiResponse<Coupon>> {
    const response = await axiosClient.put<ApiResponse<Coupon>>(`/api/v1/admin/coupons/${id}`, data);
    return response.data;
  },

  async deleteCoupon(id: string): Promise<ApiResponse<void>> {
    const response = await axiosClient.delete<ApiResponse<void>>(`/api/v1/admin/coupons/${id}`);
    return response.data;
  },
};