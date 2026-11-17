package com.ecommerce.api.mapper;

import com.ecommerce.api.dto.request.CreateCouponRequest;
import com.ecommerce.api.dto.request.UpdateCouponRequest;
import com.ecommerce.api.dto.response.CouponResponse;
import com.ecommerce.api.model.Coupon;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CouponMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usedCount", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Coupon toEntity(CreateCouponRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "code", ignore = true)
    @Mapping(target = "usedCount", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(UpdateCouponRequest request, @MappingTarget Coupon coupon);

    CouponResponse toResponse(Coupon coupon);
}