package com.ecommerce.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
// Kullanıcıya standart bir başarılı işlem API yanıtı dönmemiz sağlar. 
// Sadece başarılı işlemler için kullanıyoruz. Hata response'ları ErrorResponse ile dönülecek.
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data; // Hangi veriyi döndüreceğimiz belli değil. String, Integer veya başka bir değişlken gelebilme ihtimaline karşılık generic <T> kullandık.
    private LocalDateTime timestamp; // İşlemin ne zaman gerçekleştiği bilgisini tutar.

    // Başarılı bir işlemin sonucunu ve detaylarını döndürmek için kullanılır.
    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    // Daha kısa bir kullanım için(sadece data parametresi alıp mesajı default atar)
    public static <T> ApiResponse<T> success(T data) {
        return success(data, "İşlem başarılı");
    }
}