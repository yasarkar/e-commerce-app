import axiosClient from './axiosClient';
import type { Address, ApiResponse } from '../types';

export const addressService = {
  async getAddresses(): Promise<ApiResponse<Address[]>> {
    const response = await axiosClient.get<ApiResponse<Address[]>>(
      '/api/v1/users/me/addresses'
    );
    return response.data;
  },

  async addAddress(address: Address): Promise<ApiResponse<Address>> {
    const response = await axiosClient.post<ApiResponse<Address>>(
      '/api/v1/users/me/addresses',
      address
    );
    return response.data;
  },

  async updateAddress(
    addressIndex: number,
    address: Address
  ): Promise<ApiResponse<Address>> {
    const response = await axiosClient.put<ApiResponse<Address>>(
      `/api/v1/users/me/addresses/${addressIndex}`,
      address
    );
    return response.data;
  },

  async deleteAddress(addressIndex: number): Promise<ApiResponse<void>> {
    const response = await axiosClient.delete<ApiResponse<void>>(
      `/api/v1/users/me/addresses/${addressIndex}`
    );
    return response.data;
  },
};