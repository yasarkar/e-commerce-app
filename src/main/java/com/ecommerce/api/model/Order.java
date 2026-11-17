package com.ecommerce.api.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "orders")
public class Order {

    @Id
    private String id;
    private String userId;
    private List<OrderItem> orderItems;
    private Address shippingAddress;
    private BigDecimal totalAmount;
    private String couponCode;           
    private BigDecimal discountAmount;  
    private BigDecimal finalAmount;      
    private OrderStatus status;
    private LocalDateTime orderDate;
}