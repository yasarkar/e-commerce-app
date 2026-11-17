import axiosClient from './axiosClient';
import type { ApiResponse, PageResponse, Role, User } from '../types';

export const adminUserService = {
    async getAllUsers(params: {
        searchName?: string;
        searchEmail?: string;
        role?: Role;
        page?: number;
        size?: number;
    }): Promise<ApiResponse<PageResponse<User>>> {
        const queryParams = new URLSearchParams();
        if (params.searchName) queryParams.set('searchName', params.searchName);
        if (params.searchEmail) queryParams.set('searchEmail', params.searchEmail);
        if (params.role) queryParams.set('role', params.role);
        if (params.page !== undefined) queryParams.set('page', String(params.page));
        if (params.size !== undefined) queryParams.set('size', String(params.size));

        const response = await axiosClient.get<ApiResponse<PageResponse<User>>>(
            `/api/v1/admin/users?${queryParams.toString()}`
        );
        return response.data;
    },

    async getUserById(id: string): Promise<ApiResponse<User>> {
        const response = await axiosClient.get<ApiResponse<User>>(`/api/v1/admin/users/${id}`);
        return response.data;
    },

    async updateUserRole(id: string, role: Role): Promise<ApiResponse<User>> {
        const response = await axiosClient.patch<ApiResponse<User>>(
            `/api/v1/admin/users/${id}/role`,
            { role }
        );
        return response.data;
    },

    async updateUserStatus(id: string, active: boolean): Promise<ApiResponse<User>> {
        const response = await axiosClient.patch<ApiResponse<User>>(
            `/api/v1/admin/users/${id}/status?active=${active}`
        );
        return response.data;
    },
};