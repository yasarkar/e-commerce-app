package com.ecommerce.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
// Login işleminden sonra kullanıcıya döneceğimiz response'un yapısını belirler.
public class AuthResponse {

    // JWT token
    private String accessToken;

    // Kullanıcı bilgileri
    private UserResponse user;
}