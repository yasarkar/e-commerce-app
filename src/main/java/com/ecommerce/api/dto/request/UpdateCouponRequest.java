package com.ecommerce.api.dto.request;

import com.ecommerce.api.model.CouponType;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
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
public class UpdateCouponRequest {

    private String description;

    @NotNull(message = "Kupon tipi zorunludur")
    private CouponType type;

    @NotNull(message = "İndirim değeri zorunludur")
    @DecimalMin(value = "0.01", message = "İndirim değeri en az 0.01 olmalıdır")
    private BigDecimal discountValue;

    private BigDecimal minimumOrderAmount;

    private BigDecimal maximumDiscountAmount;

    private Integer usageLimit;

    @Future(message = "Başlangıç tarihi geçmiş olamaz")
    @NotNull(message = "Başlangıç tarihi zorunludur")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm[:ss]")
    private LocalDateTime validFrom;

    @Future(message = "Bitiş tarihi geçmiş olamaz")
    @NotNull(message = "Bitiş tarihi zorunludur")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm[:ss]")
    private LocalDateTime validUntil;

    @NotNull(message = "Aktiflik durumu zorunludur")
    private Boolean active;
}