package com.ecommerce.api.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductFilterRequest {

    //Searching and Filtering
    private String searchQuery;

    private String categoryId;

    private BigDecimal minPrice;

    private BigDecimal maxPrice;

    private Boolean inStockOnly;

    private Boolean active;

    //Pagination
    private Integer page;

    private Integer size;

    private String sortBy;

    private String sortDirection;
}