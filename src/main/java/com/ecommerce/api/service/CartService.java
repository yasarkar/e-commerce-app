package com.ecommerce.api.service;

import com.ecommerce.api.dto.request.AddToCartRequest;
import com.ecommerce.api.dto.request.UpdateItemQuantityRequest;
import com.ecommerce.api.dto.response.CartResponse;

public interface CartService {

    CartResponse getCart(String userEmail);

    CartResponse addItem(String userEmail, AddToCartRequest request);

    CartResponse updateItemQuantity(String userEmail, String productId, UpdateItemQuantityRequest request);

    CartResponse removeItem(String userEmail, String productId);

    void clearCart(String userEmail);
}