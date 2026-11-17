package com.ecommerce.api.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SingleStockOperationRequest {

    @NotNull(message = "Miktar zorunludur")
    @Positive(message = "Miktar pozitif olmalıdır")
    private int quantity;

    // opsiyonel
    private String reason;
}