
package com.serenity.backend.config;

import com.serenity.backend.model.Song;
import com.serenity.backend.repository.SongRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SongDataInitializer {

    @Bean
    CommandLineRunner initializeSongs(SongRepository songRepository) {
        return args -> {

            addSong(songRepository, "Happy Music", "happy", "music/happy.mp3");
            addSong(songRepository, "Sad Music", "sad", "music/sad.mp3");
            addSong(songRepository, "Calm Music", "calm", "music/calm.mp3");
            addSong(songRepository, "Stress Relief Music", "stressed", "music/stressed.mp3");
            addSong(songRepository, "Anxiety Relief Music", "anxious", "music/anxious.mp3");
            addSong(songRepository, "Energy Music", "tired", "music/tired.mp3");

        };
    }

    private void addSong(
            SongRepository repository,
            String title,
            String emotion,
            String filePath) {

        if (repository.findFirstByEmotionIgnoreCase(emotion).isEmpty()) {
            Song song = new Song();
            song.setTitle(title);
            song.setEmotion(emotion);
            song.setFilePath(filePath);
            repository.save(song);
        }
    }
}
