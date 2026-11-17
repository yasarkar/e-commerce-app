package com.ecommerce.api.repository;

import com.ecommerce.api.model.StockMovement;
import com.ecommerce.api.model.StockMovementType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockMovementRepository extends MongoRepository<StockMovement, String> {

    Page<StockMovement> findByProductId(String productId, Pageable pageable);

    Page<StockMovement> findByProductIdIn(List<String> productIds, Pageable pageable);

    Page<StockMovement> findByType(StockMovementType type, Pageable pageable);

    Page<StockMovement> findByTypeAndCreatedAtBetween(
            StockMovementType type, LocalDateTime from, LocalDateTime to, Pageable pageable);

    Page<StockMovement> findByCreatedAtBetween(
            LocalDateTime from, LocalDateTime to, Pageable pageable);

    Page<StockMovement> findByProductNameContainingIgnoreCase(String productName, Pageable pageable);

    Page<StockMovement> findByProductNameContainingIgnoreCaseAndType(
            String productName, StockMovementType type, Pageable pageable);

    Page<StockMovement> findByProductNameContainingIgnoreCaseAndCreatedAtBetween(
            String productName, LocalDateTime from, LocalDateTime to, Pageable pageable);

    Page<StockMovement> findByProductNameContainingIgnoreCaseAndTypeAndCreatedAtBetween(
            String productName, StockMovementType type, LocalDateTime from, LocalDateTime to, Pageable pageable);

    Page<StockMovement> findByProductIdInAndType(List<String> productIds, StockMovementType type, Pageable pageable);

    Page<StockMovement> findByProductIdInAndCreatedAtBetween(
            List<String> productIds, LocalDateTime from, LocalDateTime to, Pageable pageable);

    Page<StockMovement> findByProductIdInAndTypeAndCreatedAtBetween(
            List<String> productIds, StockMovementType type, LocalDateTime from, LocalDateTime to, Pageable pageable);

    Page<StockMovement> findByProductIdAndType(String productId, StockMovementType type, Pageable pageable);

    Page<StockMovement> findByProductIdAndCreatedAtBetween(
            String productId, LocalDateTime from, LocalDateTime to, Pageable pageable);

    Page<StockMovement> findByProductIdAndTypeAndCreatedAtBetween(
            String productId, StockMovementType type, LocalDateTime from, LocalDateTime to, Pageable pageable);

    List<StockMovement> findByProductIdOrderByCreatedAtDesc(String productId);
}