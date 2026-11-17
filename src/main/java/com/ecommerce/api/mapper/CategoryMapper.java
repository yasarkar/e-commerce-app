package com.ecommerce.api.mapper;

import com.ecommerce.api.dto.request.CreateCategoryRequest;
import com.ecommerce.api.dto.request.UpdateCategoryRequest;
import com.ecommerce.api.dto.response.CategoryResponse;
import com.ecommerce.api.model.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    @Mapping(target = "id", ignore = true)
    Category toEntity(CreateCategoryRequest request);

    @Mapping(target = "id", ignore = true)
    void updateEntity(UpdateCategoryRequest request, @MappingTarget Category category);

    CategoryResponse toResponse(Category category);
}