package com.ecommerce.api.mapper;

import com.ecommerce.api.dto.response.WishlistItemResponse;
import com.ecommerce.api.dto.response.WishlistResponse;
import com.ecommerce.api.model.Product;
import com.ecommerce.api.model.Wishlist;
import com.ecommerce.api.model.WishlistItem;
import org.mapstruct.Mapper;

import java.util.ArrayList;
import java.util.List;

@Mapper(componentModel = "spring")
public interface WishlistMapper {

    // Wishlist + Product bilgilerini kullanarak WishlistResponse oluşturur.
    // Ürün detayları (ad, fiyat, stok, kategori) Product tablosundan çekilir.
    default WishlistResponse toResponse(Wishlist wishlist, List<Product> products) {
        if (wishlist == null) return null;

        List<WishlistItemResponse> items = new ArrayList<>();
        if (wishlist.getItems() != null) {
            for (WishlistItem item : wishlist.getItems()) {
                Product product = products.stream()
                        .filter(p -> p.getId().equals(item.getProductId()))
                        .findFirst()
                        .orElse(null);

                if (product != null) {
                    items.add(toItemResponse(item, product));
                }
            }
        }

        return WishlistResponse.builder()
                .id(wishlist.getId())
                .userId(wishlist.getUserId())
                .items(items)
                .totalItems(items.size())
                .updatedAt(wishlist.getUpdatedAt())
                .build();
    }

    default WishlistItemResponse toItemResponse(WishlistItem wishlistItem, Product product) {
        if (wishlistItem == null || product == null) return null;

        return WishlistItemResponse.builder()
                .productId(product.getId())
                .productName(product.getName())
                .price(product.getPrice())
                .stockQuantity(product.getStockQuantity())
                .categoryId(product.getCategoryId())
                .active(product.getActive())
                .addedAt(wishlistItem.getAddedAt())
                .build();
    }
}