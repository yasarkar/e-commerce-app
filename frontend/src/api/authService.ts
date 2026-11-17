import axiosClient from './axiosClient';
import type {
  LoginRequest,
  RegisterUserRequest,
  ApiResponse,
  AuthResponse,
  UserResponse,
} from '../types';

export const authService = {
  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await axiosClient.post<ApiResponse<AuthResponse>>('/api/v1/auth/login', data);
    return response.data;
  },

  async register(data: RegisterUserRequest): Promise<ApiResponse<UserResponse>> {
    const response = await axiosClient.post<ApiResponse<UserResponse>>('/api/v1/auth/register', data);
    return response.data;
  },
};
