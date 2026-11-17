package com.ecommerce.api.mapper;

import com.ecommerce.api.dto.request.AddressRequest;
import com.ecommerce.api.dto.request.CreateOrderRequest;
import com.ecommerce.api.dto.request.OrderItemRequest;
import com.ecommerce.api.dto.response.OrderItemResponse;
import com.ecommerce.api.dto.response.OrderResponse;
import com.ecommerce.api.model.Address;
import com.ecommerce.api.model.Order;
import com.ecommerce.api.model.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "totalAmount", ignore = true)
    @Mapping(target = "couponCode", ignore = true)
    @Mapping(target = "discountAmount", ignore = true)
    @Mapping(target = "finalAmount", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "orderDate", ignore = true)
    @Mapping(source = "items", target = "orderItems")
    @Mapping(source = "shippingAddress", target = "shippingAddress")
    Order toEntity(CreateOrderRequest request);

    Address toAddress(AddressRequest addressRequest);

    @Mapping(target = "price", ignore = true)
    @Mapping(target = "productName", ignore = true)
    OrderItem toOrderItem(OrderItemRequest orderItemRequest);

    OrderItemResponse toOrderItemResponse(OrderItem orderItem);

    OrderResponse toResponse(Order order);
}