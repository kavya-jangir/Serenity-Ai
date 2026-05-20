package com.serenity.backend.model;

import java.time.Instant;

public class SessionRecord {
    private String id;
    private String moodId;
    private String exerciseType;
    private int totalSteps;
    private int currentStep;
    private SessionStatus status;
    private Instant startedAt;
    private Instant updatedAt;
    private Instant completedAt;

    public SessionRecord(String id, String moodId, String exerciseType, int totalSteps, int currentStep,
                         SessionStatus status, Instant startedAt, Instant updatedAt, Instant completedAt) {
        this.id = id;
        this.moodId = moodId;
        this.exerciseType = exerciseType;
        this.totalSteps = totalSteps;
        this.currentStep = currentStep;
        this.status = status;
        this.startedAt = startedAt;
        this.updatedAt = updatedAt;
        this.completedAt = completedAt;
    }

    public String getId() {
        return id;
    }

    public String getMoodId() {
        return moodId;
    }

    public String getExerciseType() {
        return exerciseType;
    }

    public int getTotalSteps() {
        return totalSteps;
    }

    public int getCurrentStep() {
        return currentStep;
    }

    public SessionStatus getStatus() {
        return status;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCurrentStep(int currentStep) {
        this.currentStep = currentStep;
    }

    public void setStatus(SessionStatus status) {
        this.status = status;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }
}
