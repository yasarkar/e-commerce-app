package com.ecommerce.api.service;

import com.ecommerce.api.dto.request.CreateOrderRequest;
import com.ecommerce.api.dto.response.OrderResponse;
import com.ecommerce.api.model.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {

    OrderResponse createOrder(String userId, CreateOrderRequest request);

    OrderResponse getOrderById(String orderId, String userEmail);

    Page<OrderResponse> getOrdersByUserId(String userId, Pageable pageable);

    Page<OrderResponse> getAllOrders(Pageable pageable);

    OrderResponse updateOrderStatus(String orderId, OrderStatus status);

    OrderResponse cancelOrder(String orderId, String userEmail);

    void deleteOrder(String orderId);
}