package com.ecommerce.api.model;

public enum StockMovementType {
    SALE,        // Sipariş nedeniyle stok düşüşü
    CANCEL,      // Sipariş iptali nedeniyle stok iadesi
    RESTOCK,     // Yeni ürün veya yeniden stoklama
    ADJUSTMENT   // Sayım/fire/manuel düzeltme
}