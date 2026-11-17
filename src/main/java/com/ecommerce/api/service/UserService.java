package com.ecommerce.api.service;

import com.ecommerce.api.dto.request.AddressRequest;
import com.ecommerce.api.dto.request.LoginRequest;
import com.ecommerce.api.dto.request.RegisterUserRequest;
import com.ecommerce.api.dto.response.AuthResponse;
import com.ecommerce.api.dto.response.UserResponse;
import com.ecommerce.api.model.Address;
import com.ecommerce.api.model.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserService {

    UserResponse registerUser(RegisterUserRequest request);

    AuthResponse login(LoginRequest request);

    UserResponse getUserById(String id);

    // Admin: Kullanıcı Yönetimi
    Page<UserResponse> getAllUsers(String searchName, String searchEmail, Role role, Pageable pageable);

    UserResponse updateUserRole(String adminId, String targetUserId, Role newRole);

    UserResponse updateUserStatus(String adminId, String targetUserId, boolean active);

    // Kullanıcı adres yönetimi
    List<Address> getUserAddresses(String userId);

    Address addUserAddress(String userId, AddressRequest request);

    Address updateUserAddress(String userId, int addressIndex, AddressRequest request);

    void deleteUserAddress(String userId, int addressIndex);
}