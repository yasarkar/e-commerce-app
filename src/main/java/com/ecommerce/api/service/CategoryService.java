package com.ecommerce.api.service;

import com.ecommerce.api.dto.request.CreateCategoryRequest;
import com.ecommerce.api.dto.request.UpdateCategoryRequest;
import com.ecommerce.api.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {

    CategoryResponse createCategory(CreateCategoryRequest request);

    CategoryResponse updateCategory(String id, UpdateCategoryRequest request);

    List<CategoryResponse> getAllCategories();

    CategoryResponse getCategoryById(String id);

    void deleteCategory(String id);
}