package com.ecommerce.api.mapper;

import com.ecommerce.api.dto.response.CartItemResponse;
import com.ecommerce.api.dto.response.CartResponse;
import com.ecommerce.api.model.Cart;
import com.ecommerce.api.model.CartItem;
import org.mapstruct.Mapper;

import java.math.BigDecimal;

@Mapper(componentModel = "spring")
public interface CartMapper {

    CartResponse toResponse(Cart cart);

    // subTotal veritabanı CartItem modelinde bulunmadığı için burada hesaplanıyor
    // default sayesinde, dönüşümü otomatik yapma, benim yazdığım bu özel hesaplama mantığını kullan diyoruz
    default CartItemResponse toItemResponse(CartItem cartItem) {
        if (cartItem == null) return null;
        
        // subTotal: ürün birim fiyatı * adet miktarı
        BigDecimal subTotal = cartItem.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
        return CartItemResponse.builder()
                .productId(cartItem.getProductId())
                .productName(cartItem.getProductName())
                .price(cartItem.getPrice())
                .quantity(cartItem.getQuantity())
                .subTotal(subTotal)
                .build();
    }
}