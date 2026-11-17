package com.ecommerce.api.repository;

import com.ecommerce.api.model.Role;
import com.ecommerce.api.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String>, UserRepositoryCustom {

    Optional<User> findByEmail(String email);

    // Girilen Mail'e ait kayıt olup olmadığını kontrol eder.
    boolean existsByEmail(String email);

    // Admin: Son aktif admin koruması
    long countByRoleAndActiveTrue(Role role);
}