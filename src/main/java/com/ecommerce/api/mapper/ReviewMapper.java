package com.ecommerce.api.mapper;

import com.ecommerce.api.dto.request.CreateReviewRequest;
import com.ecommerce.api.dto.response.ReviewResponse;
import com.ecommerce.api.model.Review;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

    // Review → ReviewResponse (userFullName ve isOwner custom hesaplanır)
    default ReviewResponse toResponse(Review review, String currentUserId) {
        if (review == null) return null;

        String fullName = (review.getUserFirstName() != null ? review.getUserFirstName() : "")
                + (review.getUserLastName() != null && !review.getUserLastName().isBlank()
                    ? " " + review.getUserLastName()
                    : "");

        return ReviewResponse.builder()
                .id(review.getId())
                .productId(review.getProductId())
                .userId(review.getUserId())
                .userFullName(fullName)
                .rating(review.getRating())
                .title(review.getTitle())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .isOwner(currentUserId != null && currentUserId.equals(review.getUserId()))
                .build();
    }

    // CreateReviewRequest → Review (productId, userId, userFirstName, userLastName dışarıdan set edilir)
    default Review toEntity(CreateReviewRequest request) {
        if (request == null) return null;

        return Review.builder()
                .productId(request.getProductId())
                .rating(request.getRating())
                .title(request.getTitle())
                .comment(request.getComment())
                .build();
    }
}