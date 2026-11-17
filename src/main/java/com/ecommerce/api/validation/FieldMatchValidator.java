package com.ecommerce.api.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import com.ecommerce.api.dto.request.RegisterUserRequest;

//Custom Validator
public class FieldMatchValidator implements ConstraintValidator<FieldMatch, RegisterUserRequest> {

    private String message;

    @Override
    public boolean isValid(RegisterUserRequest RegisterUserRequest, ConstraintValidatorContext context) {
        //Null kontrolü DTO seviyesinde @NotNull ile de yapılabilir
        if (RegisterUserRequest.getPassword() == null || RegisterUserRequest.getConfirmPassword() == null) {
            return true;
        }

        String firstValue = RegisterUserRequest.getPassword();
        String secondValue = RegisterUserRequest.getConfirmPassword();

        //True gelmesi beklenir.
        boolean valid = firstValue == null ? secondValue == null : firstValue.equals(secondValue);

        //False gelmesi halinde hali hazırda Spring de yer alan ConstraintViolation hatasını bastırmak, kendi zöel hatamızı döndürmek adına
        if (!valid) {
            context.disableDefaultConstraintViolation(); //Devre dışı bırakılır
            context.buildConstraintViolationWithTemplate(message) //Kendi mesajımız hata mesajındaki template'e eklenir
                    .addPropertyNode(secondValue) //Bütün ihale ikinci girilen alana bırakılır :)
                    //Yani kullanıcıya ikinci girdiğin değer eşleşmiyor mantığı gösterilir.
                    .addConstraintViolation(); //Özel doğrulamamız eklenir
        }
        return valid;
    }
}