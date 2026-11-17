package com.ecommerce.api.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkStockUpdateRequest {

    @NotEmpty(message = "En az bir ürün gönderilmelidir")
    private List<BulkStockUpdateItem> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BulkStockUpdateItem {

        @NotBlank(message = "Ürün ID boş olamaz")
        private String productId;

        @NotNull(message = "Yeni stok miktarı zorunludur")
        @Min(value = 0, message = "Stok miktarı negatif olamaz")
        private Integer newStockQuantity;

        // opsiyonel
        private String reason;  
    }
}