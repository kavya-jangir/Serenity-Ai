package com.serenity.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record MoodSubmitRequest(
        @NotBlank(message = "Mood is required") String mood,
        String notes
) {
}
