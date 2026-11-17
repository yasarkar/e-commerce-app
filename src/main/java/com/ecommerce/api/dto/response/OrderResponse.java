package com.ecommerce.api.dto.response;

import com.ecommerce.api.model.Address;
import com.ecommerce.api.model.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {

    private String id;
    private String userId;
    private List<OrderItemResponse> orderItems;
    private Address shippingAddress;
    private BigDecimal totalAmount;
    private String couponCode;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private OrderStatus status;
    private LocalDateTime orderDate;
}