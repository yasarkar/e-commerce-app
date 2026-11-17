package com.ecommerce.api.service;

import com.ecommerce.api.dto.request.CreateCouponRequest;
import com.ecommerce.api.dto.request.UpdateCouponRequest;
import com.ecommerce.api.dto.response.CouponResponse;
import com.ecommerce.api.dto.response.CouponValidationResponse;

import java.math.BigDecimal;
import java.util.List;

public interface CouponService {

    // Admin CRUD
    CouponResponse createCoupon(CreateCouponRequest request);
    CouponResponse updateCoupon(String couponId, UpdateCouponRequest request);
    void deleteCoupon(String couponId);
    List<CouponResponse> getAllCoupons();
    CouponResponse getCouponById(String couponId);

    // Müşteri: kupon doğrulama (sepet tutarına göre indirim hesaplama)
    CouponValidationResponse validateCoupon(String couponCode, BigDecimal cartTotal, String userId);

    // Sipariş tamamlanırken: kupon kullanımını kaydet (usedCount++)
    void applyCoupon(String couponCode);
}