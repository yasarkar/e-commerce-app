package com.ecommerce.api.mapper;

import com.ecommerce.api.dto.request.RegisterUserRequest;
import com.ecommerce.api.dto.response.UserResponse;
import com.ecommerce.api.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Mapper(componentModel = "spring")
public interface UserMapper {
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "addresses", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    User toEntity(RegisterUserRequest request);

    @Mapping(target = "createdAt", expression = "java(resolveCreatedAt(user))")
    UserResponse toResponse(User user);

    /**
     * createdAt alanını çözer:
     * 1. Kullanıcının gerçek createdAt değeri varsa onu döner (MongoDB auditing ile doldurulur).
     * 2. Yeni auditing'den önce kaydedilmiş kullanıcılarda createdAt null olabilir.
     *    Bu durumda MongoDB ObjectId'nin içindeki timestamp'ten (doküman oluşturulma zamanı)
     *    kayıt tarihi türetilir.
     */
    default LocalDateTime resolveCreatedAt(User user) {
        if (user.getCreatedAt() != null) {
            return user.getCreatedAt();
        }

        String id = user.getId();
        if (id != null && id.length() == 24 && id.matches("[0-9a-fA-F]{24}")) {
            try {
                // ObjectId'nin ilk 4 byte'ı (ilk 8 hex karakter) Unix epoch saniyesidir
                long epochSecond = Long.parseLong(id.substring(0, 8), 16);
                return Instant.ofEpochSecond(epochSecond).atZone(ZoneId.systemDefault()).toLocalDateTime();
            } catch (NumberFormatException ignored) {
                // ObjectId parse edilemezse null döner
            }
        }
        return null;
    }
}
