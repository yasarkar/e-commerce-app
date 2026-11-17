package com.ecommerce.api.dto.request;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateItemQuantityRequest {

    @Min(value = 1, message = "Adet en az 1 olmalıdır")
    private Integer quantity;
}