package com.ecommerce.api.dto.response;

import com.ecommerce.api.model.Address;
import com.ecommerce.api.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private Role role;
    private List<Address> addresses;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}