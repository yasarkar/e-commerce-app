package com.ecommerce.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistResponse {

    private String id;
    private String userId;
    private List<WishlistItemResponse> items;
    private int totalItems;
    private LocalDateTime updatedAt;
}