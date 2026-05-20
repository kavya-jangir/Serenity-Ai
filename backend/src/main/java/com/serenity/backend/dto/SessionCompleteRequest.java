package com.serenity.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record SessionCompleteRequest(
        @NotBlank(message = "Session ID is required") String sessionId
) {
}
