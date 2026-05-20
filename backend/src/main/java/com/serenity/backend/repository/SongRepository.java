package com.serenity.backend.repository;

import com.serenity.backend.model.Song;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SongRepository extends JpaRepository<Song, Integer> {
    Optional<Song> findFirstByEmotionIgnoreCase(String emotion);
}