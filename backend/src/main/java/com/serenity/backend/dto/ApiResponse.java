package com.serenity.backend.dto;

public record ApiResponse<T>(
        boolean success,
        String message,
        T data
) {
}
