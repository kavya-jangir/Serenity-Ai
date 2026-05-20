package com.serenity.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record SessionStartRequest(
        String moodId,
        @NotBlank(message = "Exercise type is required") String exerciseType,
        @Min(value = 1, message = "Total steps must be at least 1") int totalSteps
) {
}
