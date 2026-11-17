package com.ecommerce.api.controller;

import com.ecommerce.api.dto.request.CreateReviewRequest;
import com.ecommerce.api.dto.request.UpdateReviewRequest;
import com.ecommerce.api.dto.response.ApiResponse;
import com.ecommerce.api.dto.response.ProductRatingResponse;
import com.ecommerce.api.dto.response.ReviewResponse;
import com.ecommerce.api.security.UserPrincipal;
import com.ecommerce.api.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    // Herkese açık: Ürüne ait tüm yorumları getir
    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getProductReviews(
            @PathVariable String productId,
            @AuthenticationPrincipal UserPrincipal principal) {
        String currentUserEmail = principal != null ? principal.getUsername() : null;
        List<ReviewResponse> response = reviewService.getProductReviews(productId, currentUserEmail);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // Herkese açık: Ürünün puan özeti
    @GetMapping("/product/{productId}/rating")
    public ResponseEntity<ApiResponse<ProductRatingResponse>> getProductRating(
            @PathVariable String productId) {
        ProductRatingResponse response = reviewService.getProductRating(productId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // Giriş gerekli: Yeni yorum ekle
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateReviewRequest request) {
        ReviewResponse response = reviewService.createReview(principal.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success(response, "Yorumunuz başarıyla eklendi"));
    }

    // Giriş gerekli: Kendi yorumunu güncelle
    @PutMapping("/{reviewId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReview(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String reviewId,
            @Valid @RequestBody UpdateReviewRequest request) {
        ReviewResponse response = reviewService.updateReview(principal.getUsername(), reviewId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Yorumunuz başarıyla güncellendi"));
    }

    // Giriş gerekli: Kendi yorumunu sil
    @DeleteMapping("/{reviewId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String reviewId) {
        reviewService.deleteReview(principal.getUsername(), reviewId);
        return ResponseEntity.ok(ApiResponse.success(null, "Yorumunuz başarıyla silindi"));
    }

    // Giriş gerekli: Bu ürüne yorum yaptım mı? kontrolü
    @GetMapping("/check/{productId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkReviewed(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String productId) {
        boolean reviewed = reviewService.hasUserReviewed(principal.getUsername(), productId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("reviewed", reviewed)));
    }
}