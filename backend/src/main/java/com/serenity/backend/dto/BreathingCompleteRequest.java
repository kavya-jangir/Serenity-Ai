package com.serenity.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record BreathingCompleteRequest(
        @NotBlank(message = "Session ID is required") String sessionId,
        @NotBlank(message = "Phase name is required") String phase,
        @Min(value = 1, message = "Duration must be at least 1 second") int durationSeconds
) {
}
