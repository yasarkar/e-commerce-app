package com.ecommerce.api.service;

import com.ecommerce.api.dto.request.CreateCouponRequest;
import com.ecommerce.api.dto.request.UpdateCouponRequest;
import com.ecommerce.api.dto.response.CouponResponse;
import com.ecommerce.api.dto.response.CouponValidationResponse;
import com.ecommerce.api.exception.AlreadyExistsException;
import com.ecommerce.api.exception.BadRequestException;
import com.ecommerce.api.exception.ResourceNotFoundException;
import com.ecommerce.api.mapper.CouponMapper;
import com.ecommerce.api.model.Coupon;
import com.ecommerce.api.model.CouponType;
import com.ecommerce.api.model.OrderStatus;
import com.ecommerce.api.repository.CouponRepository;
import com.ecommerce.api.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;
    private final OrderRepository orderRepository;
    private final CouponMapper couponMapper;

    public CouponServiceImpl(CouponRepository couponRepository, OrderRepository orderRepository, CouponMapper couponMapper) {
        this.couponRepository = couponRepository;
        this.orderRepository = orderRepository;
        this.couponMapper = couponMapper;
    }

    @Override
    @Transactional
    public CouponResponse createCoupon(CreateCouponRequest request) {
        if (couponRepository.existsByCodeIgnoreCase(request.getCode())) {
            throw new AlreadyExistsException("Bu kupon kodu zaten mevcut: " + request.getCode());
        }

        if (request.getValidUntil().isBefore(request.getValidFrom())) {
            throw new BadRequestException("Bitiş tarihi başlangıç tarihinden önce olamaz");
        }

        Coupon coupon = couponMapper.toEntity(request);
        coupon.setCode(request.getCode().toUpperCase());
        coupon.setUsedCount(0);
        coupon.setActive(true);

        Coupon savedCoupon = couponRepository.save(coupon);
        return couponMapper.toResponse(savedCoupon);
    }

    @Override
    @Transactional
    public CouponResponse updateCoupon(String couponId, UpdateCouponRequest request) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", couponId));

        if (request.getValidUntil().isBefore(request.getValidFrom())) {
            throw new BadRequestException("Bitiş tarihi başlangıç tarihinden önce olamaz");
        }

        couponMapper.updateEntity(request, coupon);
        Coupon updatedCoupon = couponRepository.save(coupon);
        return couponMapper.toResponse(updatedCoupon);
    }

    @Override
    @Transactional
    public void deleteCoupon(String couponId) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", couponId));

        couponRepository.delete(coupon);
    }

    @Override
    public List<CouponResponse> getAllCoupons() {
        return couponRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(couponMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CouponResponse getCouponById(String couponId) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", couponId));
        return couponMapper.toResponse(coupon);
    }

    @Override
    @Transactional(readOnly = true)
    public CouponValidationResponse validateCoupon(String couponCode, BigDecimal cartTotal, String userId) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(couponCode)
                .orElseThrow(() -> new BadRequestException("Kupon Bulunamadı"));

        // 1. Aktiflik kontrolü
        if (Boolean.FALSE.equals(coupon.getActive())) {
            throw new BadRequestException("Bu kupon aktif değil");
        }

        // 2. Tarih aralığı kontrolü
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(coupon.getValidFrom())) {
            throw new BadRequestException("Bu kupon henüz kullanılamaz");
        }
        if (now.isAfter(coupon.getValidUntil())) {
            throw new BadRequestException("Bu kuponun geçerlilik süresi dolmuş");
        }

        // 3. Toplam kullanım limiti kontrolü
        if (coupon.getUsageLimit() != null
                && coupon.getUsedCount() != null
                && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new BadRequestException("Bu kupon kullanım limitine ulaşmış");
        }

        // 4. Kullanıcı bazlı kısıtlama: Aynı kullanıcı aynı kuponu birden fazla kez kullanamaz
        if (userId != null && !userId.isBlank()
                && orderRepository.existsByUserIdAndCouponCodeAndStatusNot(
                        userId,
                        coupon.getCode(),
                        OrderStatus.CANCELLED)) {
            throw new BadRequestException("Bu kupoyu daha önce kullandınız");
        }

        // 5. Minimum sepet tutarı kontrolü
        if (coupon.getMinimumOrderAmount() != null
                && cartTotal.compareTo(coupon.getMinimumOrderAmount()) < 0) {
            throw new BadRequestException("Minimum " + coupon.getMinimumOrderAmount()
                    + " TL sipariş tutarı gerekli");
        }

        // 6. İndirim hesaplama
        BigDecimal calculatedDiscount;
        if (coupon.getType() == CouponType.PERCENTAGE) {
            calculatedDiscount = cartTotal
                    .multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            // Maksimum indirim tavanı
            if (coupon.getMaximumDiscountAmount() != null
                    && calculatedDiscount.compareTo(coupon.getMaximumDiscountAmount()) > 0) {
                calculatedDiscount = coupon.getMaximumDiscountAmount();
            }
        } else { // FIXED_AMOUNT
            calculatedDiscount = coupon.getDiscountValue();
            // Sabit tutar indirimi sepet tutarını aşamaz
            if (calculatedDiscount.compareTo(cartTotal) > 0) {
                calculatedDiscount = cartTotal;
            }
        }

        BigDecimal finalAmount = cartTotal.subtract(calculatedDiscount);

        String message;
        if (coupon.getType() == CouponType.PERCENTAGE) {
            message = "%" + coupon.getDiscountValue().stripTrailingZeros().toPlainString()
                    + " indirim uygulandı!";
        } else {
            message = coupon.getDiscountValue().stripTrailingZeros().toPlainString()
                    + " TL indirim uygulandı!";
        }

        return CouponValidationResponse.builder()
                .valid(true)
                .code(coupon.getCode())
                .description(coupon.getDescription())
                .type(coupon.getType())
                .discountValue(coupon.getDiscountValue())
                .maximumDiscountAmount(coupon.getMaximumDiscountAmount())
                .calculatedDiscount(calculatedDiscount)
                .finalAmount(finalAmount)
                .message(message)
                .build();
    }

    @Override
    @Transactional
    public void applyCoupon(String couponCode) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(couponCode)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "code", couponCode));

        int currentCount = coupon.getUsedCount() != null ? coupon.getUsedCount() : 0;
        coupon.setUsedCount(currentCount + 1);
        couponRepository.save(coupon);
    }
}