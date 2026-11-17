package com.ecommerce.api.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "coupons")
public class Coupon {

    @Id
    private String id;

    @Indexed(unique = true)
    private String code;                

    private String description;         

    private CouponType type;            

    private BigDecimal discountValue;  

    private BigDecimal minimumOrderAmount;  

    private BigDecimal maximumDiscountAmount; 

    private Integer usageLimit;        
    private Integer usedCount;          

    private LocalDateTime validFrom;    
    private LocalDateTime validUntil;   

    private Boolean active;             

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}