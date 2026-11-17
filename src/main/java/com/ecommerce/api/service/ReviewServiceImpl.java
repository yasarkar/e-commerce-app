package com.ecommerce.api.service;

import com.ecommerce.api.dto.request.CreateReviewRequest;
import com.ecommerce.api.dto.request.UpdateReviewRequest;
import com.ecommerce.api.dto.response.ProductRatingResponse;
import com.ecommerce.api.dto.response.ReviewResponse;
import com.ecommerce.api.exception.AlreadyExistsException;
import com.ecommerce.api.exception.BadRequestException;
import com.ecommerce.api.exception.ResourceNotFoundException;
import com.ecommerce.api.mapper.ReviewMapper;
import com.ecommerce.api.model.Product;
import com.ecommerce.api.model.Review;
import com.ecommerce.api.model.User;
import com.ecommerce.api.repository.ProductRepository;
import com.ecommerce.api.repository.ReviewRepository;
import com.ecommerce.api.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ReviewMapper reviewMapper;

    public ReviewServiceImpl(ReviewRepository reviewRepository, ProductRepository productRepository,
            UserRepository userRepository, ReviewMapper reviewMapper) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.reviewMapper = reviewMapper;
    }

    @Override
    public List<ReviewResponse> getProductReviews(String productId, String currentUserEmail) {
        // Ürünün var olduğunu doğrula
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product", "id", productId);
        }

        // İstek yapan kullanıcının ID'sini bul (anonimse null kalır)
        String currentUserId = resolveUserId(currentUserEmail);

        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(review -> reviewMapper.toResponse(review, currentUserId))
                .toList();
    }

    @Override
    public ProductRatingResponse getProductRating(String productId) {
        // Ürünün var olduğunu doğrula
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product", "id", productId);
        }

        List<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);

        // Puan dağılımı: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0} başlangıç
        Map<Integer, Long> distribution = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            distribution.put(i, 0L);
        }

        double total = 0;
        for (Review review : reviews) {
            int rating = review.getRating();
            distribution.put(rating, distribution.getOrDefault(rating, 0L) + 1);
            total += rating;
        }

        long totalReviews = reviews.size();
        double averageRating = totalReviews == 0 ? 0.0 : total / totalReviews;

        // Ortalamayı tek ondalık basamağa yuvarla (ör: 4.3)
        averageRating = Math.round(averageRating * 10.0) / 10.0;

        return ProductRatingResponse.builder()
                .productId(productId)
                .averageRating(averageRating)
                .totalReviews(totalReviews)
                .ratingDistribution(distribution)
                .build();
    }

    @Override
    @Transactional
    public ReviewResponse createReview(String userEmail, CreateReviewRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        // Ürünün var olduğunu doğrula
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        if (!Boolean.TRUE.equals(product.getActive())) {
            throw new BadRequestException("Bu ürün şu anda satışta değil: " + product.getName());
        }

        // Kullanıcı daha önce bu ürüne yorum yapmış mı?
        reviewRepository.findByProductIdAndUserId(request.getProductId(), user.getId())
                .ifPresent(existing -> {
                    throw new AlreadyExistsException("Bu ürüne zaten yorum yaptınız. Yorumunuzu düzenleyebilir veya silebilirsiniz.");
                });

        // Review'u oluştur (userId ve denormalize kullanıcı adları dışarıdan set edilir)
        Review review = reviewMapper.toEntity(request);
        review.setUserId(user.getId());
        review.setUserFirstName(user.getFirstName());
        review.setUserLastName(user.getLastName());

        Review saved = reviewRepository.save(review);
        return reviewMapper.toResponse(saved, user.getId());
    }

    @Override
    @Transactional
    public ReviewResponse updateReview(String userEmail, String reviewId, UpdateReviewRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        // Yorum sahibi mi kontrol et
        if (!review.getUserId().equals(user.getId())) {
            throw new BadRequestException("Başka bir kullanıcının yorumunu düzenleyemezsiniz.");
        }

        review.setRating(request.getRating());
        review.setTitle(request.getTitle());
        review.setComment(request.getComment());

        Review saved = reviewRepository.save(review);
        return reviewMapper.toResponse(saved, user.getId());
    }

    @Override
    @Transactional
    public void deleteReview(String userEmail, String reviewId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        // Yorum sahibi mi kontrol et
        if (!review.getUserId().equals(user.getId())) {
            throw new BadRequestException("Başka bir kullanıcının yorumunu silemezsiniz.");
        }

        reviewRepository.delete(review);
    }

    @Override
    public boolean hasUserReviewed(String userEmail, String productId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        return reviewRepository.findByProductIdAndUserId(productId, user.getId()).isPresent();
    }

    // İstek yapan kullanıcının ID'sini çözer; anonim isteklerde null döner
    private String resolveUserId(String currentUserEmail) {
        if (currentUserEmail == null || currentUserEmail.isBlank()) {
            return null;
        }
        return userRepository.findByEmail(currentUserEmail)
                .map(User::getId)
                .orElse(null);
    }
}