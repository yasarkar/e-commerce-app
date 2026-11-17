package com.ecommerce.api.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {

    // Adres etiketi: "Ev", "İş" vb.
    private String label;

    private String street;
    private String city;
    private String zipCode;
    private String country;
}