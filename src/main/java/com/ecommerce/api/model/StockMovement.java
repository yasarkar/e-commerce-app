package com.ecommerce.api.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "stock_movements")
public class StockMovement {

    @Id
    private String id;

    private String productId;

    private String productName;

    // Negatif = düşüş, pozitif = artış
    private Integer quantityChange; 

    private StockMovementType type;

    // Opsiyonel açıklama (örn. "Sayım farkı: 5 fire")
    private String reason;        

    // Opsiyonel — admin email (JWT'den)
    private String performedBy;   

    @CreatedDate
    private LocalDateTime createdAt;
}