import axiosClient from './axiosClient';
import type { ApiResponse, CouponValidation } from '../types';

export const couponService = {
  async validateCoupon(couponCode: string, cartTotal: number): Promise<ApiResponse<CouponValidation>> {
    const response = await axiosClient.post<ApiResponse<CouponValidation>>(
      '/api/v1/coupons/validate',
      { couponCode },
      { params: { cartTotal } }
    );
    return response.data;
  },
};