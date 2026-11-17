package com.ecommerce.api.controller;

import com.ecommerce.api.dto.request.UpdateUserRoleRequest;
import com.ecommerce.api.dto.response.ApiResponse;
import com.ecommerce.api.dto.response.UserResponse;
import com.ecommerce.api.model.Role;
import com.ecommerce.api.security.UserPrincipal;
import com.ecommerce.api.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getAllUsers(
            @RequestParam(required = false) String searchName,
            @RequestParam(required = false) String searchEmail,
            @RequestParam(required = false) Role role,
            Pageable pageable) {
        Page<UserResponse> users = userService.getAllUsers(searchName, searchEmail, role, pageable);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable String id) {
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserRole(
            @PathVariable String id,
            @Valid @RequestBody UpdateUserRoleRequest request,
            Authentication authentication) {
        String adminId = ((UserPrincipal) authentication.getPrincipal()).user().getId();
        UserResponse response = userService.updateUserRole(adminId, id, request.getRole());
        return ResponseEntity.ok(ApiResponse.success(response, "Kullanıcı rolü başarıyla güncellendi"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserStatus(
            @PathVariable String id,
            @RequestParam boolean active,
            Authentication authentication) {
        String adminId = ((UserPrincipal) authentication.getPrincipal()).user().getId();
        UserResponse response = userService.updateUserStatus(adminId, id, active);
        String message = active ? "Kullanıcı hesabı yeniden aktifleştirildi" : "Kullanıcı hesabı askıya alındı";
        return ResponseEntity.ok(ApiResponse.success(response, message));
    }
}