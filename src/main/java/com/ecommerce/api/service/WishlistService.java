package com.ecommerce.api.service;

import com.ecommerce.api.dto.response.WishlistResponse;

public interface WishlistService {

    WishlistResponse getWishlist(String userEmail);

    WishlistResponse addItem(String userEmail, String productId);

    WishlistResponse removeItem(String userEmail, String productId);

    void clearWishlist(String userEmail);

    boolean isProductInWishlist(String userEmail, String productId);
}