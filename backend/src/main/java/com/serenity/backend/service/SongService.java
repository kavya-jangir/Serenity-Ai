
package com.serenity.backend.service;

import com.serenity.backend.dto.SongResponse;
import com.serenity.backend.model.Song;
import com.serenity.backend.repository.SongRepository;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;

@Service
public class SongService {

        private final SongRepository songRepository;

        public SongService(SongRepository songRepository) {
                this.songRepository = songRepository;
        }

        public SongResponse getSongByEmotion(String emotion) {

                Song song = songRepository.findFirstByEmotionIgnoreCase(emotion)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "No song found for emotion: " + emotion));

                return new SongResponse(
                                song.getId(),
                                song.getTitle(),
                                song.getEmotion(),
                                song.getFilePath(),
                                "/api/songs/" + song.getId() + "/stream",
                                song.getUploadedAt());
        }

        public Resource getSongFile(Integer songId) {

                Song song = songRepository.findById(songId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Song not found"));

                String cleanPath = song.getFilePath();

                if (cleanPath.startsWith("/")) {
                        cleanPath = cleanPath.substring(1);
                }

                Resource resource = new ClassPathResource(cleanPath);

                try {
                        if (!resource.exists() || !resource.isReadable()) {
                                throw new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Audio file not found: " + cleanPath);
                        }
                } catch (Exception e) {
                        if (e instanceof ResponseStatusException) {
                                throw (ResponseStatusException) e;
                        }

                        throw new ResponseStatusException(
                                        HttpStatus.INTERNAL_SERVER_ERROR,
                                        "Unable to load audio file",
                                        e);
                }

                return resource;
        }
}
