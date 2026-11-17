package com.ecommerce.api.repository;

import com.ecommerce.api.model.Role;
import com.ecommerce.api.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserRepositoryCustom {

    // Admin kullanıcı listesi için dinamik filtreleme:
    Page<User> findUsersByCriteria(String searchName, String searchEmail, Role role, Pageable pageable);
}