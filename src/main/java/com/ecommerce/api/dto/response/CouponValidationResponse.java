package com.ecommerce.api.dto.response;

import com.ecommerce.api.model.CouponType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponValidationResponse {

    private boolean valid;
    private String code;
    private String description;
    private CouponType type;
    private BigDecimal discountValue;
    private BigDecimal maximumDiscountAmount;
    private BigDecimal calculatedDiscount;  // Sepet tutarına göre hesaplanan gerçek indirim
    private BigDecimal finalAmount;         // İndirim sonrası ödeme tutarı
    private String message;                 // "20% indirim uygulandı!" gibi mesaj
}