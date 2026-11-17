package com.ecommerce.api.service;

import com.ecommerce.api.dto.request.BulkStockUpdateRequest;
import com.ecommerce.api.dto.request.StockMovementFilterParams;
import com.ecommerce.api.dto.response.BulkStockUpdateResult;
import com.ecommerce.api.dto.response.StockMovementResponse;
import com.ecommerce.api.model.StockMovementType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface StockService {

    StockMovementResponse addStock(String productId, int quantity, StockMovementType type, String reason);

    StockMovementResponse deductStock(String productId, int quantity, StockMovementType type, String reason);

    // Sadece stok hareketi kaydı oluşturur stok miktarını değiştirmez
    StockMovementResponse recordMovement(String productId, int quantityChange, StockMovementType type, String reason);

    // Stok miktarını günceller ve hareket kaydı oluşturur
    StockMovementResponse adjustStock(String productId, int newStockQuantity, String reason, String performedBy);

    // Stok miktarını toplu günceller ve hareket kaydı oluşturur
    List<BulkStockUpdateResult> bulkUpdate(BulkStockUpdateRequest request, String performedBy);

    // Stok hareketlerini filtreler ve sayfalara ayırır
    Page<StockMovementResponse> getMovements(StockMovementFilterParams filter);

    // Bir ürüne ait stok hareketlerini filtreler ve sayfalara ayırır
    Page<StockMovementResponse> getMovementsByProduct(String productId, Pageable pageable);

    // Stok miktarını döndürür
    int getStock(String productId);
}