package com.serenity.backend.service;

import com.serenity.backend.dto.SongResponse;
import com.serenity.backend.model.Song;
import com.serenity.backend.repository.SongRepository;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class SongService {

    private final SongRepository songRepository;

    public SongService(SongRepository songRepository) {
        this.songRepository = songRepository;
    }

    // 🎵 GET SONG BY EMOTION
    public SongResponse getSongByEmotion(String emotion) {

        Song song = songRepository.findFirstByEmotionIgnoreCase(emotion)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No song found for emotion: " + emotion
                ));

        return new SongResponse(
                song.getId(),
                song.getTitle(),
                song.getEmotion(),
                song.getFilePath(),
                "/api/songs/" + song.getId() + "/stream",
                song.getUploadedAt()
        );
    }

    // 🎧 STREAM SONG FILE
    public Resource getSongFile(Integer songId) {

        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Song not found"
                ));

        String cleanPath = song.getFilePath();

        // Remove starting "/" if present
        if (cleanPath.startsWith("/")) {
            cleanPath = cleanPath.substring(1);
        }

        Path path = Paths.get(
                System.getProperty("user.dir"),
                "src",
                "main",
                "resources",
                cleanPath
        );

        if (!Files.exists(path)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Audio file not found at: " + path.toString()
            );
        }

        return new FileSystemResource(path.toFile());
    }
}