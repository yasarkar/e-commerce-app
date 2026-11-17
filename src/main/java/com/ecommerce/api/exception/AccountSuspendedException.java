package com.ecommerce.api.exception;

import lombok.Getter;

@Getter
public class AccountSuspendedException extends RuntimeException {

    public AccountSuspendedException(String message) {
        super(message);
    }
}