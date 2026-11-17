package com.ecommerce.api.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateReviewRequest {

    @NotNull(message = "Puan zorunludur")
    @Min(value = 1, message = "Puan en az 1 olmalıdır")
    @Max(value = 5, message = "Puan en fazla 5 olabilir")
    private Integer rating;

    private String title;

    @NotBlank(message = "Yorum metni boş olamaz")
    @Size(min = 10, max = 1000, message = "Yorum 10-1000 karakter arasında olmalıdır")
    private String comment;
}