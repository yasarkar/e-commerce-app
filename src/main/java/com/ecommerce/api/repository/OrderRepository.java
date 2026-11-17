package com.ecommerce.api.repository;

import com.ecommerce.api.model.Order;
import com.ecommerce.api.model.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {

    Page<Order> findByUserId(String userId, Pageable pageable);

    boolean existsByUserIdAndCouponCodeAndStatusNot(String userId, String couponCode, OrderStatus status);
}