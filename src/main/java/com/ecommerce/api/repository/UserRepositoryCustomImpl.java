package com.ecommerce.api.repository;

import com.ecommerce.api.model.Role;
import com.ecommerce.api.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Repository
public class UserRepositoryCustomImpl implements UserRepositoryCustom {

    private final MongoTemplate mongoTemplate;

    public UserRepositoryCustomImpl(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public Page<User> findUsersByCriteria(String searchName, String searchEmail, Role role, Pageable pageable) {
        List<Criteria> criteriaList = new ArrayList<>();

        // searchName — firstName veya lastName alanında regex (case-insensitive)
        if (searchName != null && !searchName.isBlank()) {
            String escapedQuery = Pattern.quote(searchName.trim());
            Pattern pattern = Pattern.compile(escapedQuery, Pattern.CASE_INSENSITIVE);
            criteriaList.add(new Criteria().orOperator(
                    Criteria.where("firstName").regex(pattern),
                    Criteria.where("lastName").regex(pattern)));
        }

        // searchEmail — email alanında regex (case-insensitive)
        if (searchEmail != null && !searchEmail.isBlank()) {
            String escapedQuery = Pattern.quote(searchEmail.trim());
            Pattern pattern = Pattern.compile(escapedQuery, Pattern.CASE_INSENSITIVE);
            criteriaList.add(Criteria.where("email").regex(pattern));
        }

        // role — tam eşleşme
        if (role != null) {
            criteriaList.add(Criteria.where("role").is(role));
        }

        Query query = new Query();

        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }

        // Count (kriterler uygulanmış halde)
        long total = mongoTemplate.count(query, User.class);

        // Sıralama: Admin kullanıcılar her zaman en üstte, aynı rolde en yeni kayıtlar önce
        // (ROLE_ADMIN < ROLE_USER alfabetik sırada olduğundan ascending sıralama adminleri öne çeker)
        Sort sort = Sort.by(new Sort.Order(Sort.Direction.ASC, "role"))
                .and(Sort.by(Sort.Direction.DESC, "createdAt"));

        PageRequest pageRequest = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
        query.with(pageRequest);

        List<User> users = mongoTemplate.find(query, User.class);

        return new PageImpl<>(users, pageRequest, total);
    }
}