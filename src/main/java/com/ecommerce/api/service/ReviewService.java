package com.ecommerce.api.service;

import com.ecommerce.api.dto.request.CreateReviewRequest;
import com.ecommerce.api.dto.request.UpdateReviewRequest;
import com.ecommerce.api.dto.response.ProductRatingResponse;
import com.ecommerce.api.dto.response.ReviewResponse;

import java.util.List;

public interface ReviewService {

    // Bir ürüne ait tüm yorumları getir
    List<ReviewResponse> getProductReviews(String productId, String currentUserEmail);

    // Bir ürünün puan özetini getir (ortalama, dağılım)
    ProductRatingResponse getProductRating(String productId);

    // Yeni yorum ekle (bir kullanıcı aynı ürüne yalnızca 1 yorum)
    ReviewResponse createReview(String userEmail, CreateReviewRequest request);

    // Kendi yorumunu güncelle
    ReviewResponse updateReview(String userEmail, String reviewId, UpdateReviewRequest request);

    // Kendi yorumunu sil
    void deleteReview(String userEmail, String reviewId);

    // Kullanıcının bu ürüne yorum yapıp yapmadığını kontrol
    boolean hasUserReviewed(String userEmail, String productId);
}