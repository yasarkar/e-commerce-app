package com.ecommerce.api.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "reviews") // MongoDB'de bağımsız bir koleksiyona karşılık gelir
public class Review {

    @Id
    private String id;

    @Indexed
    private String productId;    

    @Indexed
    private String userId;       

    private String userFirstName;  
    private String userLastName;
    private Integer rating;      
    private String title;       
    private String comment;     

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}