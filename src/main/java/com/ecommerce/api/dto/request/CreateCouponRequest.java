package com.ecommerce.api.dto.request;

import com.ecommerce.api.model.CouponType;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCouponRequest {

    @NotBlank(message = "Kupon kodu boş olamaz")
    private String code;

    private String description;

    @NotNull(message = "Kupon tipi zorunludur")
    private CouponType type;

    @NotNull(message = "İndirim değeri zorunludur")
    @DecimalMin(value = "0.01", message = "İndirim değeri en az 0.01 olmalıdır")
    private BigDecimal discountValue;

    private BigDecimal minimumOrderAmount;

    private BigDecimal maximumDiscountAmount;

    private Integer usageLimit;

    @NotNull(message = "Başlangıç tarihi zorunludur")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm[:ss]")
    private LocalDateTime validFrom;

    @NotNull(message = "Bitiş tarihi zorunludur")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm[:ss]")
    private LocalDateTime validUntil;
}