package com.ecommerce.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRatingResponse {

    private String productId;
    private Double averageRating;   
    private Long totalReviews;     
    private Map<Integer, Long> ratingDistribution;
}