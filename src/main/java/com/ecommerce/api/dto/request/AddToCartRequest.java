package com.ecommerce.api.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddToCartRequest {

    @NotBlank(message = "Ürün ID boş olamaz")
    private String productId;

    @Min(value = 1, message = "Adet en az 1 olmalıdır")
    private Integer quantity;
}