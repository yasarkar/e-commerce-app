package com.ecommerce.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplyCouponRequest {

    @NotBlank(message = "Kupon kodu boş olamaz")
    private String couponCode;
}