package com.ecommerce.api.repository;

import com.ecommerce.api.dto.request.ProductFilterRequest;
import com.ecommerce.api.model.Product;
import org.springframework.data.domain.Page;

public interface ProductRepositoryCustom {

    Page<Product> findProductsByCriteria(ProductFilterRequest filter);
}