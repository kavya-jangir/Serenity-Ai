package com.serenity.backend.dto;

import java.time.Instant;

public record SongResponse(
        Integer id,
        String title,
        String emotion,
        String filePath,
        String streamUrl,
        Instant uploadedAt
) {
}
