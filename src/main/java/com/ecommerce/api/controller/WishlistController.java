package com.ecommerce.api.controller;

import com.ecommerce.api.dto.response.ApiResponse;
import com.ecommerce.api.dto.response.WishlistResponse;
import com.ecommerce.api.security.UserPrincipal;
import com.ecommerce.api.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/wishlist")
@PreAuthorize("isAuthenticated()")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<WishlistResponse>> getWishlist(
            @AuthenticationPrincipal UserPrincipal principal) {
        WishlistResponse response = wishlistService.getWishlist(principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/items/{productId}")
    public ResponseEntity<ApiResponse<WishlistResponse>> addItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String productId) {
        WishlistResponse response = wishlistService.addItem(principal.getUsername(), productId);
        return ResponseEntity.ok(ApiResponse.success(response, "Ürün favorilere eklendi"));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<ApiResponse<WishlistResponse>> removeItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String productId) {
        WishlistResponse response = wishlistService.removeItem(principal.getUsername(), productId);
        return ResponseEntity.ok(ApiResponse.success(response, "Ürün favorilerden çıkarıldı"));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearWishlist(
            @AuthenticationPrincipal UserPrincipal principal) {
        wishlistService.clearWishlist(principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success(null, "Favoriler temizlendi"));
    }

    @GetMapping("/check/{productId}")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkProduct(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String productId) {
        boolean inWishlist = wishlistService.isProductInWishlist(principal.getUsername(), productId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("inWishlist", inWishlist)));
    }
}