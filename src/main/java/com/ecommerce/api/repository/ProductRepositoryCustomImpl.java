package com.ecommerce.api.repository;

import com.ecommerce.api.dto.request.ProductFilterRequest;
import com.ecommerce.api.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Repository
public class ProductRepositoryCustomImpl implements ProductRepositoryCustom {

    private final MongoTemplate mongoTemplate;

    public ProductRepositoryCustomImpl(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public Page<Product> findProductsByCriteria(ProductFilterRequest filter) {
        List<Criteria> criteriaList = new ArrayList<>();

        // searchQuery — name veya description alanında regex (case-insensitive)
        String searchQuery = filter.getSearchQuery();
        if (searchQuery != null && !searchQuery.isBlank()) {
            String escapedQuery = Pattern.quote(searchQuery.trim()); // Boşlukları ve özel karakterleri yok saymak için
            Pattern pattern = Pattern.compile(escapedQuery, Pattern.CASE_INSENSITIVE); // Büyük/küçük harf duyarsız
            Criteria searchCriteria = new Criteria().orOperator(
                    Criteria.where("name").regex(pattern),
                    Criteria.where("description").regex(pattern));
            criteriaList.add(searchCriteria);
        }

        // categoryId
        String categoryId = filter.getCategoryId();
        if (categoryId != null && !categoryId.isBlank()) {
            criteriaList.add(Criteria.where("categoryId").is(categoryId));
        }

        // minPrice — price >= minPrice
        BigDecimal minPrice = filter.getMinPrice();
        if (minPrice != null) {
            criteriaList.add(Criteria.where("price").gte(minPrice));
        }

        // maxPrice — price <= maxPrice
        BigDecimal maxPrice = filter.getMaxPrice();
        if (maxPrice != null) {
            criteriaList.add(Criteria.where("price").lte(maxPrice));
        }

        // inStockOnly — stockQuantity > 0
        if (Boolean.TRUE.equals(filter.getInStockOnly())) {
            criteriaList.add(Criteria.where("stockQuantity").gt(0));
        }

        // active
        Boolean active = filter.getActive();
        if (active != null) {
            criteriaList.add(Criteria.where("active").is(active));
        }

        // Query oluştur
        Query query = new Query();

        // Kriterleri birleştir
        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }

        // Count (kriterler uygulanmış halde)
        long total = mongoTemplate.count(query, Product.class);

        // Sort — Controller'dan varsayılan değerlerle geldiği varsayılır, ancak null-safety için varsayılan değerler tanımlanır
        String sortDirection = filter.getSortDirection();
        Sort.Direction direction = Sort.Direction.ASC;
        if (sortDirection != null && !sortDirection.isBlank()) {
            direction = Sort.Direction.fromString(sortDirection);
        }

        String sortBy = filter.getSortBy();
        if (sortBy == null || sortBy.isBlank()) {
            sortBy = "id";
        }

        Sort sort = Sort.by(direction, sortBy);

        Integer pageParam = filter.getPage();
        int page = pageParam != null ? pageParam : 0;
        Integer sizeParam = filter.getSize();
        int size = sizeParam != null ? sizeParam : 10;
        PageRequest pageable = PageRequest.of(page, size, sort);
        query.with(pageable);

        // Sonuçları getir
        List<Product> products = mongoTemplate.find(query, Product.class);

        return new PageImpl<>(products, pageable, total);
    }
}