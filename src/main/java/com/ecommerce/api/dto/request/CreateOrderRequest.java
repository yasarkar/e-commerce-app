package com.ecommerce.api.dto.request;

import jakarta.validation.Valid;
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
public class CreateOrderRequest {

    private List<OrderItemRequest> items;

    private String couponCode;    
    
    @NotNull(message = "Teslimat adresi zorunludur")
    @Valid
    private AddressRequest shippingAddress;
}