package com.ecommerce.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressRequest {

    // Adres etiketi: "Ev", "İş" vb. (opsiyonel)
    private String label;

    @NotBlank(message = "Sokak adı boş olamaz")
    private String street;

    @NotBlank(message = "Şehir adı boş olamaz")
    private String city;

    @NotBlank(message = "Posta kodu boş olamaz")
    private String zipCode;

    @NotBlank(message = "Ülke adı boş olamaz")
    private String country;
}