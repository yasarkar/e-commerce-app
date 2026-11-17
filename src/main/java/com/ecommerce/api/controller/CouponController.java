package com.ecommerce.api.controller;

import com.ecommerce.api.dto.request.ApplyCouponRequest;
import com.ecommerce.api.dto.response.ApiResponse;
import com.ecommerce.api.dto.response.CouponValidationResponse;
import com.ecommerce.api.exception.ResourceNotFoundException;
import com.ecommerce.api.model.User;
import com.ecommerce.api.repository.UserRepository;
import com.ecommerce.api.security.UserPrincipal;
import com.ecommerce.api.service.CouponService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/coupons")
@PreAuthorize("isAuthenticated()")
public class CouponController {

    private final CouponService couponService;
    private final UserRepository userRepository;

    public CouponController(CouponService couponService, UserRepository userRepository) {
        this.couponService = couponService;
        this.userRepository = userRepository;
    }

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<CouponValidationResponse>> validateCoupon(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ApplyCouponRequest request,
            @RequestParam BigDecimal cartTotal) {

        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", principal.getUsername()));

        CouponValidationResponse validation =
                couponService.validateCoupon(request.getCouponCode(), cartTotal, user.getId());
        return ResponseEntity.ok(ApiResponse.success(validation));
    }
}