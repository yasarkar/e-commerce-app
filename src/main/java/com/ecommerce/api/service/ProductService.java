package com.ecommerce.api.service;

import com.ecommerce.api.dto.request.CreateProductRequest;
import com.ecommerce.api.dto.request.ProductFilterRequest;
import com.ecommerce.api.dto.request.UpdateProductRequest;
import com.ecommerce.api.dto.response.ProductResponse;
import org.springframework.data.domain.Page;

public interface ProductService {

    ProductResponse createProduct(CreateProductRequest request);

    ProductResponse updateProduct(String id, UpdateProductRequest request);

    ProductResponse getProductById(String id);

    Page<ProductResponse> getProductsByFilter(ProductFilterRequest filter);

    void deleteProduct(String id);
}