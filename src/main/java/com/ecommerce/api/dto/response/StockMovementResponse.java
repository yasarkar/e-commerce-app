package com.ecommerce.api.dto.response;

import com.ecommerce.api.model.StockMovementType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockMovementResponse {

    private String id;
    private String productId;
    private String productName;
    private Integer quantityChange; 
    private StockMovementType type;
    private String reason;
    private String performedBy;
    private LocalDateTime createdAt;
}