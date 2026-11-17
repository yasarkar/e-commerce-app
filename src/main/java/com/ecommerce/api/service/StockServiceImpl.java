package com.ecommerce.api.service;

import com.ecommerce.api.dto.request.BulkStockUpdateRequest;
import com.ecommerce.api.dto.request.StockMovementFilterParams;
import com.ecommerce.api.dto.response.BulkStockUpdateResult;
import com.ecommerce.api.dto.response.StockMovementResponse;
import com.ecommerce.api.exception.BadRequestException;
import com.ecommerce.api.exception.ResourceNotFoundException;
import com.ecommerce.api.model.Product;
import com.ecommerce.api.model.StockMovement;
import com.ecommerce.api.model.StockMovementType;
import com.ecommerce.api.repository.ProductRepository;
import com.ecommerce.api.repository.StockMovementRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class StockServiceImpl implements StockService {

    private static final LocalDateTime DEFAULT_START = LocalDateTime.of(1970, 1, 1, 0, 0);
    private static final LocalDateTime DEFAULT_END = LocalDateTime.of(2100, 1, 1, 0, 0);

    private final ProductRepository productRepository;
    private final StockMovementRepository stockMovementRepository;

    public StockServiceImpl(ProductRepository productRepository, StockMovementRepository stockMovementRepository) {
        this.productRepository = productRepository;
        this.stockMovementRepository = stockMovementRepository;
    }

    @Override
    @Transactional
    @CacheEvict(value = "products", key = "#productId")
    public StockMovementResponse addStock(String productId, int quantity, StockMovementType type, String reason) {
        if (quantity <= 0) {
            throw new BadRequestException("Eklenecek stok miktarı pozitif olmalıdır");
        }

        Product product = getProduct(productId);

        int newStock = product.getStockQuantity() + quantity;
        product.setStockQuantity(newStock);
        productRepository.save(product);

        StockMovement movement = buildMovement(product, quantity, type, reason, null);
        StockMovement saved = stockMovementRepository.save(movement);
        return toResponse(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "products", key = "#productId")
    public StockMovementResponse deductStock(String productId, int quantity, StockMovementType type, String reason) {
        if (quantity <= 0) {
            throw new BadRequestException("Düşülecek stok miktarı pozitif olmalıdır");
        }

        Product product = getProduct(productId);

        if (product.getStockQuantity() < quantity) {
            throw new BadRequestException("Yetersiz stok: " + product.getName()
                    + " (mevcut: " + product.getStockQuantity()
                    + ", talep: " + quantity + ")");
        }

        int newStock = product.getStockQuantity() - quantity;
        product.setStockQuantity(newStock);
        productRepository.save(product);

        StockMovement movement = buildMovement(product, -quantity, type, reason, null);
        StockMovement saved = stockMovementRepository.save(movement);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public StockMovementResponse recordMovement(String productId, int quantityChange,
                                                StockMovementType type, String reason) {
        Product product = getProduct(productId);

        StockMovement movement = buildMovement(product, quantityChange, type, reason, null);
        StockMovement saved = stockMovementRepository.save(movement);
        return toResponse(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "products", key = "#productId")
    public StockMovementResponse adjustStock(String productId, int newStockQuantity,
                                             String reason, String performedBy) {
        Product product = getProduct(productId);

        int change = newStockQuantity - product.getStockQuantity();

        product.setStockQuantity(newStockQuantity);
        productRepository.save(product);

        StockMovement movement = buildMovement(product, change, StockMovementType.ADJUSTMENT, reason, performedBy);
        StockMovement saved = stockMovementRepository.save(movement);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public List<BulkStockUpdateResult> bulkUpdate(BulkStockUpdateRequest request, String performedBy) {
        List<BulkStockUpdateResult> results = new ArrayList<>();

        for (BulkStockUpdateRequest.BulkStockUpdateItem item : request.getItems()) {
            try {
                Product product = getProduct(item.getProductId());
                int oldStock = product.getStockQuantity();

                StockMovementResponse movement = adjustStock(
                        item.getProductId(), item.getNewStockQuantity(), item.getReason(), performedBy);

                results.add(BulkStockUpdateResult.success(
                        item.getProductId(), product.getName(), oldStock, movement.getQuantityChange() != null
                                ? oldStock + movement.getQuantityChange()
                                : item.getNewStockQuantity()));
            } catch (Exception e) {
                results.add(BulkStockUpdateResult.failure(item.getProductId(), e.getMessage()));
            }
        }
        return results;
    }

    @Override
    public Page<StockMovementResponse> getMovements(StockMovementFilterParams filter) {
        int page = Math.max(0, filter.getPage());
        int size = (filter.getSize() <= 0) ? 20 : filter.getSize();
        Pageable pageable = PageRequest.of(page, size);

        LocalDateTime from = (filter.getStartDate() != null) ? filter.getStartDate() : DEFAULT_START;
        LocalDateTime to = (filter.getEndDate() != null) ? filter.getEndDate() : DEFAULT_END;

        Page<StockMovement> movements;

        if (filter.getProductId() != null && !filter.getProductId().isBlank()) {
            if (filter.getType() != null) {
                movements = stockMovementRepository.findByProductIdAndTypeAndCreatedAtBetween(
                        filter.getProductId(), filter.getType(), from, to, pageable);
            } else {
                movements = stockMovementRepository.findByProductIdAndCreatedAtBetween(
                        filter.getProductId(), from, to, pageable);
            }
        } else if (filter.getProductSearch() != null && !filter.getProductSearch().isBlank()) {
            if (filter.getType() != null) {
                movements = stockMovementRepository.findByProductNameContainingIgnoreCaseAndTypeAndCreatedAtBetween(
                        filter.getProductSearch(), filter.getType(), from, to, pageable);
            } else {
                movements = stockMovementRepository.findByProductNameContainingIgnoreCaseAndCreatedAtBetween(
                        filter.getProductSearch(), from, to, pageable);
            }
        } else {
            if (filter.getType() != null) {
                movements = stockMovementRepository.findByTypeAndCreatedAtBetween(
                        filter.getType(), from, to, pageable);
            } else {
                movements = stockMovementRepository.findByCreatedAtBetween(from, to, pageable);
            }
        }

        return movements.map(this::toResponse);
    }

    @Override
    public Page<StockMovementResponse> getMovementsByProduct(String productId, Pageable pageable) {
        return stockMovementRepository.findByProductId(productId, pageable)
                .map(this::toResponse);
    }

    @Override
    public int getStock(String productId) {
        return getProduct(productId).getStockQuantity();
    }

    private Product getProduct(String productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
    }

    private StockMovement buildMovement(Product product, int quantityChange,
                                        StockMovementType type, String reason, String performedBy) {
        return StockMovement.builder()
                .productId(product.getId())
                .productName(product.getName())
                .quantityChange(quantityChange)
                .type(type)
                .reason(reason)
                .performedBy(performedBy)
                .build();
    }

    private StockMovementResponse toResponse(StockMovement movement) {
        return StockMovementResponse.builder()
                .id(movement.getId())
                .productId(movement.getProductId())
                .productName(movement.getProductName())
                .quantityChange(movement.getQuantityChange())
                .type(movement.getType())
                .reason(movement.getReason())
                .performedBy(movement.getPerformedBy())
                .createdAt(movement.getCreatedAt())
                .build();
    }
}