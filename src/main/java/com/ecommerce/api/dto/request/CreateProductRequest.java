package com.ecommerce.api.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateProductRequest {

    @NotBlank(message = "Ürün adı boş olamaz")
    private String name;

    private String description;

    @NotNull(message = "Fiyat alanı zorunludur")
    @DecimalMin(value = "0.01", message = "Fiyat en az 0.01 olmalıdır")
    private BigDecimal price;

    @NotNull(message = "Stok miktarı zorunludur")
    @Min(value = 0, message = "Stok miktarı negatif olamaz")
    private Integer stockQuantity;

    @NotBlank(message = "Kategori ID boş olamaz")
    private String categoryId;
}