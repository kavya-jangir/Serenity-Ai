package com.serenity.backend.service;

import com.serenity.backend.dto.BreathingCompleteRequest;
import com.serenity.backend.dto.MoodSubmitRequest;
import com.serenity.backend.dto.SessionStartRequest;
import com.serenity.backend.dto.StepCompleteRequest;
import com.serenity.backend.dto.StepStartRequest;
import com.serenity.backend.model.MoodRecord;
import com.serenity.backend.model.SessionRecord;
import com.serenity.backend.model.SessionStatus;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SessionService {
    private final Map<String, MoodRecord> moods = new ConcurrentHashMap<>();
    private final Map<String, SessionRecord> sessions = new ConcurrentHashMap<>();

    public MoodRecord submitMood(MoodSubmitRequest request) {
        String moodId = UUID.randomUUID().toString();
        MoodRecord record = new MoodRecord(moodId, request.mood(), request.notes(), Instant.now());
        moods.put(moodId, record);
        return record;
    }

    public SessionRecord startSession(SessionStartRequest request) {
        if (request.moodId() != null && !request.moodId().isBlank() && !moods.containsKey(request.moodId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Mood ID not found");
        }

        Instant now = Instant.now();
        SessionRecord session = new SessionRecord(
                UUID.randomUUID().toString(),
                request.moodId(),
                request.exerciseType(),
                request.totalSteps(),
                0,
                SessionStatus.STARTED,
                now,
                now,
                null
        );

        sessions.put(session.getId(), session);
        return session;
    }

    public SessionRecord startStep(StepStartRequest request) {
        SessionRecord session = getSessionOrThrow(request.sessionId());
        session.setCurrentStep(request.stepNumber());
        session.setStatus(SessionStatus.IN_PROGRESS);
        session.setUpdatedAt(Instant.now());
        return session;
    }

    public SessionRecord completeStep(StepCompleteRequest request) {
        SessionRecord session = getSessionOrThrow(request.sessionId());
        session.setCurrentStep(request.stepNumber());
        session.setStatus(SessionStatus.IN_PROGRESS);
        session.setUpdatedAt(Instant.now());
        return session;
    }

    public Map<String, Object> completeBreathingHit(BreathingCompleteRequest request) {
        SessionRecord session = getSessionOrThrow(request.sessionId());
        session.setUpdatedAt(Instant.now());

        Map<String, Object> payload = new HashMap<>();
        payload.put("sessionId", request.sessionId());
        payload.put("phase", request.phase());
        payload.put("durationSeconds", request.durationSeconds());
        payload.put("recordedAt", Instant.now());
        return payload;
    }

    public SessionRecord completeSession(String sessionId) {
        SessionRecord session = getSessionOrThrow(sessionId);
        session.setStatus(SessionStatus.COMPLETED);
        session.setCompletedAt(Instant.now());
        session.setUpdatedAt(Instant.now());
        return session;
    }

    public SessionRecord getSession(String sessionId) {
        return getSessionOrThrow(sessionId);
    }

    private SessionRecord getSessionOrThrow(String sessionId) {
        SessionRecord session = sessions.get(sessionId);
        if (session == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found");
        }
        return session;
    }
}
