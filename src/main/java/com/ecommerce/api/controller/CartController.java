package com.ecommerce.api.controller;

import com.ecommerce.api.dto.request.AddToCartRequest;
import com.ecommerce.api.dto.request.UpdateItemQuantityRequest;
import com.ecommerce.api.dto.response.ApiResponse;
import com.ecommerce.api.dto.response.CartResponse;
import com.ecommerce.api.security.UserPrincipal;
import com.ecommerce.api.service.CartService;
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

@RestController
@RequestMapping("/api/v1/cart")
@PreAuthorize("isAuthenticated()") //Giriş yapmış kullanıcılar erişebilir
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService){
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(
            @AuthenticationPrincipal UserPrincipal principal) {
        CartResponse response = cartService.getCart(principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AddToCartRequest request) {
        CartResponse response = cartService.addItem(principal.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success(response, "Ürün sepete eklendi"));
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateItemQuantity(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String productId,
            @Valid @RequestBody UpdateItemQuantityRequest request) {
        CartResponse response = cartService.updateItemQuantity(principal.getUsername(), productId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Ürün miktarı güncellendi"));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String productId) {
        CartResponse response = cartService.removeItem(principal.getUsername(), productId);
        return ResponseEntity.ok(ApiResponse.success(response, "Ürün sepetten çıkarıldı"));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(
            @AuthenticationPrincipal UserPrincipal principal) {
        cartService.clearCart(principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success(null, "Sepet temizlendi"));
    }
}