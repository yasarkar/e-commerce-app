package com.ecommerce.api.service;

import com.ecommerce.api.dto.request.CreateProductRequest;
import com.ecommerce.api.dto.request.ProductFilterRequest;
import com.ecommerce.api.dto.request.UpdateProductRequest;
import com.ecommerce.api.dto.response.ProductResponse;
import com.ecommerce.api.exception.ResourceNotFoundException;
import com.ecommerce.api.mapper.ProductMapper;
import com.ecommerce.api.model.Product;
import com.ecommerce.api.model.StockMovementType;
import com.ecommerce.api.repository.CategoryRepository;
import com.ecommerce.api.repository.ProductRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;
    private final StockService stockService;
    
    public ProductServiceImpl(ProductRepository productRepository, CategoryRepository categoryRepository, ProductMapper productMapper, StockService stockService) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productMapper = productMapper;
        this.stockService = stockService;
    }

    @Override
    @CacheEvict(value = "products", key = "#result.id", condition = "#result != null")
    public ProductResponse createProduct(CreateProductRequest request) {
        if (!categoryRepository.existsById(request.getCategoryId())) {
            throw new ResourceNotFoundException("Category", "id", request.getCategoryId());
        }

        Product product = productMapper.toEntity(request);
        product.setActive(true);
        Product savedProduct = productRepository.save(product);

        // Başlangıç stoğunu RESTOCK hareketi olarak kaydet
        // Not: Stok zaten save() ile kaydedildi — yalnızca hareket kaydı eklenir
        if (savedProduct.getStockQuantity() != null && savedProduct.getStockQuantity() > 0) {
            stockService.recordMovement(savedProduct.getId(), savedProduct.getStockQuantity(),
                    StockMovementType.RESTOCK, "Yeni ürün oluşturuldu");
        }

        return productMapper.toResponse(savedProduct);
    }

    @Override
    @CacheEvict(value = "products", key = "#id")
    public ProductResponse updateProduct(String id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        Integer oldStock = product.getStockQuantity();
        productMapper.updateEntity(request, product);
        Product updatedProduct = productRepository.save(product);

        // Stok değişmişse ADJUSTMENT hareketi kaydet
        // Not: Stok zaten yeni değere save() ile güncellendi — yalnızca kayıt eklenir
        if (!Objects.equals(oldStock, updatedProduct.getStockQuantity())) {
            int change = (updatedProduct.getStockQuantity() != null ? updatedProduct.getStockQuantity() : 0)
                    - (oldStock != null ? oldStock : 0);
            if (change != 0) {
                stockService.recordMovement(updatedProduct.getId(), change,
                        StockMovementType.ADJUSTMENT, "Ürün düzenlendi");
            }
        }

        return productMapper.toResponse(updatedProduct);
    }

    @Override
    public ProductResponse getProductById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return productMapper.toResponse(product);
    }

    @Override
    public Page<ProductResponse> getProductsByFilter(ProductFilterRequest filter) {
        // Filtreleme/sayfalama sonuçları dinamik olduğu için cache'lenmez
        return productRepository.findProductsByCriteria(filter)
                .map(productMapper::toResponse);
    }

    @Override
    @CacheEvict(value = "products", key = "#id")
    public void deleteProduct(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        product.setActive(false);
        productRepository.save(product);
    }
}