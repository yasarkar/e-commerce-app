package com.ecommerce.api.dto.request;

import com.ecommerce.api.validation.FieldMatch;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
//Custom Field Validation
@FieldMatch(first = "password", second = "confirmPassword", message = "Şifreler birbiriyle eşleşmiyor")
public class RegisterUserRequest {

    @NotBlank(message = "Ad alanı boş olamaz")
    private String firstName;

    @NotBlank(message = "Soyad alanı boş olamaz")
    private String lastName;

    @NotBlank(message = "E-posta adresi boş olamaz")
    @Email(message = "Geçerli bir e-posta adresi giriniz")
    private String email;

    @NotBlank(message = "Şifre alanı boş olamaz")
    @Size(min = 6, message = "Şifre en az 6 karakter olmalıdır")
    private String password;

    @NotBlank(message = "Şifre tekrar alanı boş olamaz")
    private String confirmPassword;
}