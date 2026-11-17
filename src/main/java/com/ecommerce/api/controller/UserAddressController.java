package com.ecommerce.api.controller;

import com.ecommerce.api.dto.request.AddressRequest;
import com.ecommerce.api.dto.response.ApiResponse;
import com.ecommerce.api.model.Address;
import com.ecommerce.api.security.UserPrincipal;
import com.ecommerce.api.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users/me/addresses")
public class UserAddressController {

    private final UserService userService;

    public UserAddressController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Address>>> getAddresses(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<Address> addresses = userService.getUserAddresses(principal.user().getId());
        return ResponseEntity.ok(ApiResponse.success(addresses, "Adresler listelendi"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Address>> addAddress(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AddressRequest request) {
        Address address = userService.addUserAddress(principal.user().getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(address, "Adres başarıyla eklendi"));
    }

    @PutMapping("/{addressIndex}")
    public ResponseEntity<ApiResponse<Address>> updateAddress(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable int addressIndex,
            @Valid @RequestBody AddressRequest request) {
        Address address = userService.updateUserAddress(principal.user().getId(), addressIndex, request);
        return ResponseEntity.ok(ApiResponse.success(address, "Adres başarıyla güncellendi"));
    }

    @DeleteMapping("/{addressIndex}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable int addressIndex) {
        userService.deleteUserAddress(principal.user().getId(), addressIndex);
        return ResponseEntity.ok(ApiResponse.success(null, "Adres başarıyla silindi"));
    }
}