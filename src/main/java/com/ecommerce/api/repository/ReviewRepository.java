package com.ecommerce.api.repository;

import com.ecommerce.api.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends MongoRepository<Review, String> {

    // Bir ürüne ait tüm yorumları tarihe göre sıralı getir
    List<Review> findByProductIdOrderByCreatedAtDesc(String productId);

    // Kullanıcının belirli bir ürüne daha önce yorum yapıp yapmadığını kontrol
    Optional<Review> findByProductIdAndUserId(String productId, String userId);

    // Bir ürüne ait yorum sayısını getir
    long countByProductId(String productId);

    // Kullanıcının tüm yorumlarını getir
    List<Review> findByUserIdOrderByCreatedAtDesc(String userId);
}