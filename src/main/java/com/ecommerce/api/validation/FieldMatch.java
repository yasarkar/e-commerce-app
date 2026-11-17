package com.ecommerce.api.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.TYPE) // Sadece classlar için geçerli olmasını sağlar.
@Retention(RetentionPolicy.RUNTIME) // Runtime'da geçerli olmasını sağlar.
@Constraint(validatedBy = FieldMatchValidator.class) // Hangi validator'ü kullanacağımızı belirtir.
public @interface FieldMatch {

    String message(); // Hata mesajı

    String first(); // İlk alan

    String second(); // İkinci alan

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}