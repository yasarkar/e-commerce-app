package com.ecommerce.api.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProductRequest {

    private String name;

    private String description;

    @DecimalMin(value = "1", message = "Fiyat en az 1 olmalıdır")
    private BigDecimal price;

    @Min(value = 0, message = "Stok miktarı negatif olamaz")
    private Integer stockQuantity;

    private String categoryId;

    private Boolean active;
}