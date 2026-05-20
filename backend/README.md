# Serenity Backend

This backend powers the Serenity breathing and mood-flow features. It is a Spring Boot application that exposes REST APIs for:

- recording a user's mood
- starting and tracking an exercise session
- marking breathing steps as started or completed
- looking up a song for a given emotion
- streaming the selected audio file

The codebase is intentionally small, so the easiest way to understand it is to follow the request flow from the controller down into the services and data layer.

## Tech Stack

- Java 17
- Spring Boot 3.4.5
- Spring Web
- Spring Data JPA
- Jakarta Validation
- MySQL
- Maven

## High-Level Architecture

The backend is split into a few simple layers:

- `controller`: receives HTTP requests and returns API responses
- `service`: contains the business logic for sessions, moods, and songs
- `repository`: talks to the database for song lookup
- `model`: represents stored or returned backend data
- `dto`: defines request and response payload shapes
- `config`: application-level setup such as CORS

In practice, there are two different storage styles in this project:

- songs are persisted in MySQL through JPA
- moods and sessions are stored only in memory using `ConcurrentHashMap`

That distinction is important because song data survives restarts if the database remains intact, while moods and sessions are lost whenever the backend restarts.

## Project Structure

```text
backend/
|-- pom.xml
|-- src/main/java/com/serenity/backend
|   |-- SerenityBackendApplication.java
|   |-- config/CorsConfig.java
|   |-- controller/SerenityController.java
|   |-- dto/
|   |-- model/
|   |-- repository/SongRepository.java
|   |-- service/
|-- src/main/resources
|   |-- application.properties
|   |-- music/
```

## How the Backend Works

### 1. Application startup

`SerenityBackendApplication` is the Spring Boot entry point. When the app starts:

- Spring scans the package for controllers, services, repositories, and configuration
- the datasource is created from `application.properties`
- JPA connects to MySQL
- the song repository becomes available for database access
- the session and mood services initialize their in-memory maps

### 2. Request entry point

All API requests come through `SerenityController` under the `/api` base path.

The controller does very little work itself. Its job is to:

- accept request bodies or path variables
- trigger validation with `@Valid`
- call the correct service method
- wrap most responses in a shared `ApiResponse<T>` object

That shared response format looks like this:

```json
{
  "success": true,
  "message": "Session fetched",
  "data": {}
}
```

### 3. Mood flow

The mood flow starts at `POST /api/mood`.

Request DTO:

```json
{
  "mood": "calm",
  "notes": "Feeling better after breathing"
}
```

What happens internally:

1. `MoodSubmitRequest` validates that `mood` is not blank.
2. `SessionService.submitMood()` creates a UUID for the mood.
3. A `MoodRecord` is created with the mood, optional notes, and `createdAt`.
4. The record is stored in the in-memory `moods` map.
5. The saved mood record is returned to the client.

Important behavior:

- this data is not written to MySQL
- if the server restarts, stored moods disappear

### 4. Session lifecycle

The backend tracks a breathing or exercise session across several endpoints.

#### Start a session

`POST /api/session/start`

Example body:

```json
{
  "moodId": "optional-mood-id",
  "exerciseType": "4-7-8 Breathing",
  "totalSteps": 4
}
```

What happens:

1. `SessionStartRequest` validates `exerciseType` and `totalSteps`.
2. If `moodId` is present, `SessionService` verifies that it exists in the in-memory mood map.
3. A new `SessionRecord` is created with:
   - generated UUID
   - `currentStep = 0`
   - `status = STARTED`
   - timestamps for `startedAt` and `updatedAt`
4. The session is stored in the in-memory `sessions` map.

If a provided `moodId` does not exist, the service throws `404 Not Found`.

#### Mark a step as started

`POST /api/step/start`

```json
{
  "sessionId": "session-id",
  "stepNumber": 1
}
```

What happens:

- the request is validated
- the backend looks up the session by ID
- `currentStep` is updated to the provided step number
- `status` becomes `IN_PROGRESS`
- `updatedAt` is refreshed

If the session does not exist, the backend returns `404 Not Found`.

#### Mark a step as completed

`POST /api/step/complete`

```json
{
  "sessionId": "session-id",
  "stepNumber": 1
}
```

This currently behaves almost the same as `step/start`:

- it verifies the session exists
- it updates `currentStep`
- it sets the status to `IN_PROGRESS`
- it updates the timestamp

There is no separate per-step persistence or completion history yet. The backend only keeps the latest session snapshot.

#### Record a breathing phase completion

`POST /api/breathing/complete`

```json
{
  "sessionId": "session-id",
  "phase": "inhale",
  "durationSeconds": 4
}
```

What happens:

- the request is validated
- the session must exist
- the session's `updatedAt` timestamp is refreshed
- the backend returns a payload containing:
  - `sessionId`
  - `phase`
  - `durationSeconds`
  - `recordedAt`

Important behavior:

- this endpoint records the hit in the response only
- phase events are not stored in a database or an in-memory list

#### Complete a session

`POST /api/session/complete`

```json
{
  "sessionId": "session-id"
}
```

What happens:

- the session is loaded from memory
- `status` becomes `COMPLETED`
- `completedAt` is set
- `updatedAt` is refreshed

#### Fetch a session

`GET /api/session/{sessionId}`

This returns the latest `SessionRecord` snapshot held in memory.

### 5. Song recommendation and audio streaming

The song flow is the only part of the backend that uses the database.

#### Get a song by emotion

`GET /api/songs/emotion/{emotion}`

What happens:

1. `SerenityController` forwards the emotion string to `SongService`.
2. `SongService` calls `SongRepository.findFirstByEmotionIgnoreCase(emotion)`.
3. Spring Data JPA queries the `songs` table.
4. If a match is found, the entity is mapped into a `SongResponse`.
5. The response includes a stream URL in the form `/api/songs/{id}/stream`.

Example response data:

```json
{
  "id": 1,
  "title": "Calm Track",
  "emotion": "calm",
  "filePath": "music/calm.mp3",
  "streamUrl": "/api/songs/1/stream",
  "uploadedAt": "2026-05-20T10:00:00Z"
}
```

If no song matches the emotion, the backend returns `404 Not Found`.

#### Stream the audio file

`GET /api/songs/{songId}/stream`

What happens internally:

1. The song is loaded from MySQL using its numeric ID.
2. The backend reads the `filePath` value from the `songs` table.
3. If the path starts with `/`, that leading slash is removed.
4. The code resolves the final file location as:

```text
<project-root>/src/main/resources/<filePath>
```

5. If the file exists, Spring returns it as `audio/mpeg`.
6. If either the song record or file is missing, the backend returns `404`.

This means the database and the resource folder have to stay in sync. A song row can exist in MySQL, but streaming will still fail if the referenced MP3 file is missing from `src/main/resources/music`.

## Data Model

### Persistent entity

#### `Song`

Mapped to the `songs` table with these fields:

- `id`
- `title`
- `emotion`
- `filePath`
- `uploadedAt`

This is a proper JPA entity and is persisted in MySQL.

### In-memory models

#### `MoodRecord`

- `id`
- `mood`
- `notes`
- `createdAt`

#### `SessionRecord`

- `id`
- `moodId`
- `exerciseType`
- `totalSteps`
- `currentStep`
- `status`
- `startedAt`
- `updatedAt`
- `completedAt`

#### `SessionStatus`

- `STARTED`
- `IN_PROGRESS`
- `COMPLETED`

## Validation Rules

The request DTOs use Jakarta Validation:

- `MoodSubmitRequest.mood` must not be blank
- `SessionStartRequest.exerciseType` must not be blank
- `SessionStartRequest.totalSteps` must be at least `1`
- `StepStartRequest.sessionId` must not be blank
- `StepStartRequest.stepNumber` must be at least `1`
- `StepCompleteRequest.sessionId` must not be blank
- `StepCompleteRequest.stepNumber` must be at least `1`
- `BreathingCompleteRequest.sessionId` must not be blank
- `BreathingCompleteRequest.phase` must not be blank
- `BreathingCompleteRequest.durationSeconds` must be at least `1`
- `SessionCompleteRequest.sessionId` must not be blank

If validation fails, Spring Boot returns a `400 Bad Request`.

## Database Configuration

The backend currently uses the following properties:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/music_db
spring.datasource.username=root
spring.datasource.password=kavya29
spring.jpa.hibernate.ddl-auto=update
```

What this means:

- the app expects a local MySQL database named `music_db`
- the `songs` table is managed by JPA
- schema updates can be applied automatically at startup because `ddl-auto=update`

Important note:

- the database password is committed directly in `application.properties`
- for a real deployment, this should be moved to environment variables or a secrets manager

## Audio Assets

The repository already contains mood-based MP3 files under:

```text
src/main/resources/music/
```

Examples:

- `calm.mp3`
- `happy.mp3`
- `sad.mp3`
- `anxious.mp3`
- `stressed.mp3`
- `tired.mp3`

For song streaming to work, the `songs.file_path` value should point to these resource files, for example:

```text
music/calm.mp3
```

## CORS

`CorsConfig` allows the frontend at:

```text
http://localhost:5173
```

Allowed methods:

- `GET`
- `POST`
- `PUT`
- `DELETE`
- `OPTIONS`

All headers are allowed for `/api/**`.

## API Reference

### Health

- `GET /api/health`

Used to confirm the backend is running.

### Mood

- `POST /api/mood`

Stores a mood record in memory.

### Songs

- `GET /api/songs/emotion/{emotion}`
- `GET /api/songs/{songId}/stream`

The first endpoint resolves a song, and the second streams its audio.

### Session tracking

- `POST /api/session/start`
- `POST /api/step/start`
- `POST /api/step/complete`
- `POST /api/breathing/complete`
- `POST /api/session/complete`
- `GET /api/session/{sessionId}`

Together, these endpoints model the exercise lifecycle.

## Running the Backend

### Requirements

- Java 17+
- Maven 3.9+
- MySQL running locally

### Start the app

```powershell
cd Serenity/backend
mvn spring-boot:run
```

The server runs on:

```text
http://localhost:8080
```

Base API URL:

```text
http://localhost:8080/api
```

## End-to-End Example Flow

One typical frontend flow would be:

1. Call `POST /api/mood`
2. Use the returned `moodId` in `POST /api/session/start`
3. Call `POST /api/step/start` as the user begins a step
4. Call `POST /api/step/complete` when the step finishes
5. Optionally call `POST /api/breathing/complete` for inhale/exhale events
6. Call `POST /api/session/complete` at the end
7. Call `GET /api/songs/emotion/{emotion}` to fetch a matching song
8. Play the returned `streamUrl`

## Current Limitations

These are the most important implementation constraints in the current backend:

- moods are not persisted
- sessions are not persisted
- breathing-phase events are not stored
- there is no authentication or user ownership
- there is no global exception handler with custom error formatting
- streaming depends on local resource files rather than object storage or a CDN
- database credentials are hardcoded in configuration

## Suggested Next Improvements

If this backend is going to grow, the most valuable next steps would be:

- move moods and sessions into database-backed entities
- add a breathing event table if per-phase analytics matter
- externalize database credentials
- add seed data or migration scripts for songs
- add tests for controller and service flows
- return a more consistent structured error response
