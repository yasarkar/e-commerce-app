package com.ecommerce.api.repository;  
  
import com.ecommerce.api.model.Wishlist;  
import org.springframework.data.mongodb.repository.MongoRepository;  
import org.springframework.stereotype.Repository;  
  
import java.util.Optional;  
  
@Repository  
public interface WishlistRepository extends MongoRepository<Wishlist, String> {  
  
    Optional<Wishlist> findByUserId(String userId);  
  
    void deleteByUserId(String userId);  
}  
