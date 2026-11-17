package com.ecommerce.api.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "wishlists") // MongoDB'de bağımsız bir koleksiyona karşılık gelir
public class Wishlist {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    // Her kullanıcı için tek bir Wishlist belgesi olacak.
    // Cart'taki List<CartItem> yapısına paralel olarak favori ürünleri tutar.
    private List<WishlistItem> items;

    private LocalDateTime updatedAt;
}