package com.ecommerce.api.dto.response;  
  
import lombok.AllArgsConstructor;  
import lombok.Builder;  
import lombok.Data;  
import lombok.NoArgsConstructor;  
  
import java.math.BigDecimal;  
import java.time.LocalDateTime;  
  
@Data  
@NoArgsConstructor  
@AllArgsConstructor  
@Builder  
public class WishlistItemResponse {  
  
    private String productId;  
    private String productName;  
    private BigDecimal price;  
    private Integer stockQuantity;  
    private String categoryId;  
    private Boolean active;  
    private LocalDateTime addedAt;  
}  
