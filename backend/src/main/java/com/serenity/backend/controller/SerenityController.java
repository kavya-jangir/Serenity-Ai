package com.serenity.backend.controller;

import com.serenity.backend.dto.ApiResponse;
import com.serenity.backend.dto.BreathingCompleteRequest;
import com.serenity.backend.dto.MoodSubmitRequest;
import com.serenity.backend.dto.SongResponse;
import com.serenity.backend.dto.SessionCompleteRequest;
import com.serenity.backend.dto.SessionStartRequest;
import com.serenity.backend.dto.StepCompleteRequest;
import com.serenity.backend.dto.StepStartRequest;
import com.serenity.backend.model.MoodRecord;
import com.serenity.backend.model.SessionRecord;
import com.serenity.backend.service.SessionService;
import com.serenity.backend.service.SongService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class SerenityController {
    private final SessionService sessionService;
    private final SongService songService;

    public SerenityController(SessionService sessionService, SongService songService) {
        this.sessionService = sessionService;
        this.songService = songService;
    }

    @GetMapping("/health")
    public ApiResponse<Map<String, String>> health() {
        return new ApiResponse<>(true, "Backend is running", Map.of("status", "UP"));
    }

    @PostMapping("/mood")
    public ApiResponse<MoodRecord> submitMood(@Valid @RequestBody MoodSubmitRequest request) {
        MoodRecord mood = sessionService.submitMood(request);
        return new ApiResponse<>(true, "Mood hit recorded", mood);
    }

    @GetMapping("/songs/emotion/{emotion}")
    public ApiResponse<SongResponse> getSongByEmotion(@PathVariable String emotion) {
        SongResponse song = songService.getSongByEmotion(emotion);
        return new ApiResponse<>(true, "Song fetched", song);
    }

    @GetMapping(value = "/songs/{songId}/stream", produces = "audio/mpeg")
    public ResponseEntity<Resource> streamSong(@PathVariable Integer songId) {
        Resource resource = songService.getSongFile(songId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .contentType(MediaType.parseMediaType("audio/mpeg"))
                .body(resource);
    }

    @PostMapping("/session/start")
    public ApiResponse<SessionRecord> startSession(@Valid @RequestBody SessionStartRequest request) {
        SessionRecord session = sessionService.startSession(request);
        return new ApiResponse<>(true, "Session start hit recorded", session);
    }

    @PostMapping("/step/start")
    public ApiResponse<SessionRecord> startStep(@Valid @RequestBody StepStartRequest request) {
        SessionRecord session = sessionService.startStep(request);
        return new ApiResponse<>(true, "Step start hit recorded", session);
    }

    @PostMapping("/step/complete")
    public ApiResponse<SessionRecord> completeStep(@Valid @RequestBody StepCompleteRequest request) {
        SessionRecord session = sessionService.completeStep(request);
        return new ApiResponse<>(true, "Step complete hit recorded", session);
    }

    @PostMapping("/breathing/complete")
    public ApiResponse<Map<String, Object>> completeBreathing(@Valid @RequestBody BreathingCompleteRequest request) {
        Map<String, Object> payload = sessionService.completeBreathingHit(request);
        return new ApiResponse<>(true, "Breathing hit recorded", payload);
    }

    @PostMapping("/session/complete")
    public ApiResponse<SessionRecord> completeSession(@Valid @RequestBody SessionCompleteRequest request) {
        SessionRecord session = sessionService.completeSession(request.sessionId());
        return new ApiResponse<>(true, "Session complete hit recorded", session);
    }

    @GetMapping("/session/{sessionId}")
    public ApiResponse<SessionRecord> getSession(@PathVariable String sessionId) {
        SessionRecord session = sessionService.getSession(sessionId);
        return new ApiResponse<>(true, "Session fetched", session);
    }
}
