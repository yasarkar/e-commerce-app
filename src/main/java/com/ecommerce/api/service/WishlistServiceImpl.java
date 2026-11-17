package com.ecommerce.api.service;

import com.ecommerce.api.dto.response.WishlistResponse;
import com.ecommerce.api.exception.AlreadyExistsException;
import com.ecommerce.api.exception.BadRequestException;
import com.ecommerce.api.exception.ResourceNotFoundException;
import com.ecommerce.api.mapper.WishlistMapper;
import com.ecommerce.api.model.Product;
import com.ecommerce.api.model.User;
import com.ecommerce.api.model.Wishlist;
import com.ecommerce.api.model.WishlistItem;
import com.ecommerce.api.repository.ProductRepository;
import com.ecommerce.api.repository.UserRepository;
import com.ecommerce.api.repository.WishlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final WishlistMapper wishlistMapper;

    public WishlistServiceImpl(WishlistRepository wishlistRepository, ProductRepository productRepository,
            UserRepository userRepository, WishlistMapper wishlistMapper) {
        this.wishlistRepository = wishlistRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.wishlistMapper = wishlistMapper;
    }

    @Override
    public WishlistResponse getWishlist(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Wishlist wishlist = wishlistRepository.findByUserId(user.getId())
                .orElse(null);

        if (wishlist == null) {
            return WishlistResponse.builder()
                    .userId(user.getId())
                    .items(List.of())
                    .totalItems(0)
                    .build();
        }

        return mapWishlistWithProducts(wishlist);
    }

    @Override
    @Transactional
    public WishlistResponse addItem(String userEmail, String productId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        // Ürünü kontrol et
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (!Boolean.TRUE.equals(product.getActive())) {
            throw new BadRequestException("Bu ürün şu anda satışta değil: " + product.getName());
        }

        // Wishlist'i bul veya yeni oluştur
        Wishlist wishlist = wishlistRepository.findByUserId(user.getId())
                .orElse(Wishlist.builder()
                        .userId(user.getId())
                        .items(new ArrayList<>())
                        .updatedAt(LocalDateTime.now())
                        .build());

        // Ürün zaten favorilerde var mı kontrol et
        boolean exists = wishlist.getItems().stream()
                .anyMatch(item -> item.getProductId().equals(productId));

        if (exists) {
            throw new AlreadyExistsException("Bu ürün zaten favorilerinizde: " + product.getName());
        }

        // Yeni favori ekle
        WishlistItem newItem = WishlistItem.builder()
                .productId(productId)
                .addedAt(LocalDateTime.now())
                .build();
        wishlist.getItems().add(newItem);
        wishlist.setUpdatedAt(LocalDateTime.now());

        Wishlist savedWishlist = wishlistRepository.save(wishlist);
        return mapWishlistWithProducts(savedWishlist);
    }

    @Override
    @Transactional
    public WishlistResponse removeItem(String userEmail, String productId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Wishlist wishlist = wishlistRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist", "userId", user.getId()));

        boolean removed = wishlist.getItems().removeIf(item -> item.getProductId().equals(productId));
        if (!removed) {
            throw new ResourceNotFoundException("WishlistItem", "productId", productId);
        }

        wishlist.setUpdatedAt(LocalDateTime.now());

        Wishlist savedWishlist = wishlistRepository.save(wishlist);
        return mapWishlistWithProducts(savedWishlist);
    }

    @Override
    @Transactional
    public void clearWishlist(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        wishlistRepository.deleteByUserId(user.getId());
    }

    @Override
    public boolean isProductInWishlist(String userEmail, String productId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Wishlist wishlist = wishlistRepository.findByUserId(user.getId())
                .orElse(null);

        if (wishlist == null || wishlist.getItems() == null) {
            return false;
        }

        return wishlist.getItems().stream()
                .anyMatch(item -> item.getProductId().equals(productId));
    }

    // Wishlist'teki her productId için Product bilgisini çeker ve WishlistResponse'a dönüştürür
    private WishlistResponse mapWishlistWithProducts(Wishlist wishlist) {
        List<String> productIds = wishlist.getItems().stream()
                .map(WishlistItem::getProductId)
                .toList();

        List<Product> products = productRepository.findAllById(productIds);
        return wishlistMapper.toResponse(wishlist, products);
    }
}