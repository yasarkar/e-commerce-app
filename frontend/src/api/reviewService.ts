import axiosClient from './axiosClient';
import type { ApiResponse, CreateReviewRequest, ProductRating, Review, UpdateReviewRequest } from '../types';

export const reviewService = {
    // Herkese açık: Ürüne ait tüm yorumları getir
    async getProductReviews(productId: string): Promise<ApiResponse<Review[]>> {
        const response = await axiosClient.get<ApiResponse<Review[]>>(`/api/v1/reviews/product/${productId}`);
        return response.data;
    },

    // Herkese açık: Ürünün puan özeti
    async getProductRating(productId: string): Promise<ApiResponse<ProductRating>> {
        const response = await axiosClient.get<ApiResponse<ProductRating>>(`/api/v1/reviews/product/${productId}/rating`);
        return response.data;
    },

    // Giriş gerekli: Yeni yorum ekle
    async createReview(data: CreateReviewRequest): Promise<ApiResponse<Review>> {
        const response = await axiosClient.post<ApiResponse<Review>>('/api/v1/reviews', data);
        return response.data;
    },

    // Giriş gerekli: Kendi yorumunu güncelle
    async updateReview(reviewId: string, data: UpdateReviewRequest): Promise<ApiResponse<Review>> {
        const response = await axiosClient.put<ApiResponse<Review>>(`/api/v1/reviews/${reviewId}`, data);
        return response.data;
    },

    // Giriş gerekli: Kendi yorumunu sil
    async deleteReview(reviewId: string): Promise<ApiResponse<void>> {
        const response = await axiosClient.delete<ApiResponse<void>>(`/api/v1/reviews/${reviewId}`);
        return response.data;
    },

    // Giriş gerekli: Bu ürüne yorum yaptım mı? kontrolü
    async checkReviewed(productId: string): Promise<ApiResponse<{ reviewed: boolean }>> {
        const response = await axiosClient.get<ApiResponse<{ reviewed: boolean }>>(`/api/v1/reviews/check/${productId}`);
        return response.data;
    },
};