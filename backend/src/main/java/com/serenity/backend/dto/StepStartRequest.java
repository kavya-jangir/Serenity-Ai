package com.serenity.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record StepStartRequest(
        @NotBlank(message = "Session ID is required") String sessionId,
        @Min(value = 1, message = "Step number must be at least 1") int stepNumber
) {
}
