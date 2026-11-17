package com.ecommerce.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkStockUpdateResult {

    private String productId;
    private String productName;
    private boolean success;
    private Integer oldStockQuantity;   // success=true ise
    private Integer newStockQuantity;   // success=true ise
    private String message;            

    public static BulkStockUpdateResult success(String productId, String productName,
                                                Integer oldStock, Integer newStock) {
        return BulkStockUpdateResult.builder()
                .productId(productId)
                .productName(productName)
                .success(true)
                .oldStockQuantity(oldStock)
                .newStockQuantity(newStock)
                .build();
    }

    public static BulkStockUpdateResult failure(String productId, String message) {
        return BulkStockUpdateResult.builder()
                .productId(productId)
                .success(false)
                .message(message)
                .build();
    }
}