package com.serenity.backend.model;

import java.time.Instant;

public class MoodRecord {
    private String id;
    private String mood;
    private String notes;
    private Instant createdAt;

    public MoodRecord(String id, String mood, String notes, Instant createdAt) {
        this.id = id;
        this.mood = mood;
        this.notes = notes;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public String getMood() {
        return mood;
    }

    public String getNotes() {
        return notes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
