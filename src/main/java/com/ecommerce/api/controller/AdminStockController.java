package com.ecommerce.api.controller;

import com.ecommerce.api.dto.request.BulkStockUpdateRequest;
import com.ecommerce.api.dto.request.SingleStockOperationRequest;
import com.ecommerce.api.dto.request.StockMovementFilterParams;
import com.ecommerce.api.dto.response.ApiResponse;
import com.ecommerce.api.dto.response.BulkStockUpdateResult;
import com.ecommerce.api.dto.response.StockMovementResponse;
import com.ecommerce.api.model.StockMovementType;
import com.ecommerce.api.security.UserPrincipal;
import com.ecommerce.api.service.StockService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/stock")
@PreAuthorize("hasRole('ADMIN')")
public class AdminStockController {

    private final StockService stockService;

    public AdminStockController(StockService stockService) {
        this.stockService = stockService;
    }

    @PostMapping("/bulk")
    public ResponseEntity<ApiResponse<List<BulkStockUpdateResult>>> bulkUpdate(
            @Valid @RequestBody BulkStockUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<BulkStockUpdateResult> results =
                stockService.bulkUpdate(request, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success(results, "Toplu stok güncelleme tamamlandı"));
    }

    @PostMapping("/{productId}/add")
    public ResponseEntity<ApiResponse<StockMovementResponse>> addStock(
            @PathVariable String productId,
            @Valid @RequestBody SingleStockOperationRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        StockMovementResponse response = stockService.addStock(
                productId, request.getQuantity(), StockMovementType.RESTOCK, request.getReason());
        return ResponseEntity.ok(ApiResponse.success(response, "Stok başarıyla eklendi"));
    }

    @PostMapping("/{productId}/deduct")
    public ResponseEntity<ApiResponse<StockMovementResponse>> deductStock(
            @PathVariable String productId,
            @Valid @RequestBody SingleStockOperationRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        StockMovementResponse response = stockService.deductStock(
                productId, request.getQuantity(), StockMovementType.ADJUSTMENT, request.getReason());
        return ResponseEntity.ok(ApiResponse.success(response, "Stok başarıyla düşüldü"));
    }

    @PostMapping("/{productId}/adjust")
    public ResponseEntity<ApiResponse<StockMovementResponse>> adjustStock(
            @PathVariable String productId,
            @Valid @RequestBody SingleStockOperationRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        StockMovementResponse response = stockService.adjustStock(
                productId, request.getQuantity(), request.getReason(), principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response, "Stok başarıyla düzeltildi"));
    }

    @GetMapping("/movements")
    public ResponseEntity<ApiResponse<Page<StockMovementResponse>>> getMovements(
            StockMovementFilterParams filter) {
        return ResponseEntity.ok(ApiResponse.success(
                stockService.getMovements(filter), "Stok hareketleri listelendi"));
    }

    @GetMapping("/movements/product/{productId}")
    public ResponseEntity<ApiResponse<Page<StockMovementResponse>>> getMovementsByProduct(
            @PathVariable String productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                stockService.getMovementsByProduct(productId, PageRequest.of(page, size)),
                "Ürün stok hareketleri listelendi"));
    }
}