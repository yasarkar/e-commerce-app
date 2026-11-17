package com.ecommerce.api.service;

import com.ecommerce.api.dto.request.CreateOrderRequest;
import com.ecommerce.api.dto.response.CouponValidationResponse;
import com.ecommerce.api.dto.response.OrderResponse;
import com.ecommerce.api.exception.BadRequestException;
import com.ecommerce.api.exception.ResourceNotFoundException;
import com.ecommerce.api.mapper.OrderMapper;
import com.ecommerce.api.model.Cart;
import com.ecommerce.api.model.CartItem;
import com.ecommerce.api.model.Order;
import com.ecommerce.api.model.OrderItem;
import com.ecommerce.api.model.OrderStatus;
import com.ecommerce.api.model.Product;
import com.ecommerce.api.model.User;
import com.ecommerce.api.model.StockMovementType;
import com.ecommerce.api.repository.CartRepository;
import com.ecommerce.api.repository.OrderRepository;
import com.ecommerce.api.repository.ProductRepository;
import com.ecommerce.api.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final OrderMapper orderMapper;
    private final CouponService couponService;
    private final StockService stockService;

    public OrderServiceImpl(OrderRepository orderRepository, ProductRepository productRepository, UserRepository userRepository, CartRepository cartRepository, OrderMapper orderMapper, CouponService couponService, StockService stockService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.orderMapper = orderMapper;
        this.couponService = couponService;
        this.stockService = stockService;
    }

    @Override
    @Transactional
    public OrderResponse createOrder(String userEmail, CreateOrderRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        // Kullanıcının sepetini oku
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadRequestException("Sepetiniz boş. Lütfen sepete ürün ekleyin."));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BadRequestException("Sepetiniz boş. Lütfen sepete ürün ekleyin.");
        }

        // Stok kontrollerini yap ve sipariş kalemlerini oluştur
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItem cartItem : cart.getItems()) {
            Product product = productRepository.findById(cartItem.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", cartItem.getProductId()));

            // Stok kontrolü + düşüş (StockService tek noktadan yönetir)
            stockService.deductStock(product.getId(), cartItem.getQuantity(),
                    StockMovementType.SALE, "Sipariş oluşturma");

            // Sipariş kalemi oluştur
            OrderItem orderItem = OrderItem.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .price(product.getPrice())
                    .quantity(cartItem.getQuantity())
                    .build();

            orderItems.add(orderItem);
            totalAmount = totalAmount.add(product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        }

        // Kupon entegrasyonu
        BigDecimal discountAmount = BigDecimal.ZERO;
        String couponCode = request.getCouponCode();

        if (couponCode != null && !couponCode.isBlank()) {
            // Kuponu doğrula (kullanıcı bazlı kontrol dahil)
            CouponValidationResponse validation = couponService.validateCoupon(couponCode, totalAmount, user.getId());
            if (!validation.isValid()) {
                throw new BadRequestException(validation.getMessage());
            }
            discountAmount = validation.getCalculatedDiscount();

            // Kullanım sayacını artır
            couponService.applyCoupon(couponCode);
        }

        BigDecimal finalAmount = totalAmount.subtract(discountAmount);

        // Siparişi oluştur
        Order order = Order.builder()
                .userId(user.getId())
                .orderItems(orderItems)
                .shippingAddress(orderMapper.toAddress(request.getShippingAddress()))
                .totalAmount(totalAmount)
                .couponCode(couponCode != null && !couponCode.isBlank() ? couponCode.toUpperCase() : null)
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .status(OrderStatus.PENDING)
                .orderDate(LocalDateTime.now())
                .build();

        Order savedOrder = orderRepository.save(order);

        // Sepeti temizle
        cartRepository.deleteByUserId(user.getId());

        return orderMapper.toResponse(savedOrder);
    }

    @Override
    public OrderResponse getOrderById(String orderId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (!order.getUserId().equals(user.getId())) {
            throw new BadRequestException("Bu siparişe erişim yetkiniz bulunmuyor");
        }

        return orderMapper.toResponse(order);
    }

    @Override
    public Page<OrderResponse> getOrdersByUserId(String userEmail, Pageable pageable) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        return orderRepository.findByUserId(user.getId(), pageable)
                .map(orderMapper::toResponse);
    }

    @Override
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable)
                .map(orderMapper::toResponse);
    }

    @Override
    public OrderResponse updateOrderStatus(String orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        order.setStatus(status);
        Order updatedOrder = orderRepository.save(order);
        return orderMapper.toResponse(updatedOrder);
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(String orderId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (!order.getUserId().equals(user.getId())) {
            throw new BadRequestException("Bu siparişi iptal etme yetkiniz bulunmuyor");
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Yalnızca PENDING durumundaki siparişler iptal edilebilir");
        }

        // Stokları iade et (StockService tek noktadan yönetir)
        for (OrderItem orderItem : order.getOrderItems()) {
            stockService.addStock(orderItem.getProductId(), orderItem.getQuantity(),
                    StockMovementType.CANCEL, "Sipariş iptali");
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order cancelledOrder = orderRepository.save(order);
        return orderMapper.toResponse(cancelledOrder);
    }

    @Override
    public void deleteOrder(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        orderRepository.delete(order);
    }
}