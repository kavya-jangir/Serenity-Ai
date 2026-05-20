# Serenity Frontend

This frontend is a single-page React application that guides a user through a calm, mood-based wellness flow:

- choose how they feel
- optionally write a short note
- receive a matching exercise
- play calming music tied to that mood
- move through timed exercise steps

The app is visually expressive and animation-heavy, but the underlying structure is quite simple. The best way to understand it is to follow the user journey from the root app component down into the mood screen and exercise session components.

## Tech Stack

- React 18
- TypeScript
- Vite 6
- Tailwind CSS 4
- Motion
- Lucide React

There are also many Radix and shadcn-style UI utilities in the repo, but the current Serenity flow uses only a small part of that broader component library.

## Where the Frontend Lives

The frontend now lives inside a dedicated `frontend/` folder under the `Serenity/` repository root.

Key files:

```text
Serenity/
|-- frontend/
|   |-- package.json
|   |-- vite.config.ts
|   |-- src/
|   |   |-- main.tsx
|   |   |-- app/
|   |   |   |-- App.tsx
|   |   |   |-- api.ts
|   |   |   |-- components/
|   |   |   |   |-- MoodInput.tsx
|   |   |   |   |-- ExerciseSession.tsx
|   |   |   |   |-- BreathingStep.tsx
|   |   |   |   |-- RegularStep.tsx
|   |   |   |   |-- ui/
|   |   |-- styles/
|   |   |   |-- index.css
|   |   |   |-- tailwind.css
|   |   |   |-- theme.css
```

## High-Level Architecture

The frontend is organized around a very small app flow:

- `frontend/src/main.tsx` mounts the React application
- `frontend/src/app/App.tsx` controls which screen is currently visible
- `frontend/src/app/components/MoodInput.tsx` handles the first screen where the user selects a mood
- `frontend/src/app/components/ExerciseSession.tsx` runs the guided exercise experience
- `frontend/src/app/components/BreathingStep.tsx` renders animated inhale/hold/exhale screens
- `frontend/src/app/components/RegularStep.tsx` renders instruction-based timed steps
- `frontend/src/app/api.ts` wraps backend HTTP requests

This is not a multi-page routed app. It behaves more like a state-driven experience where the visible screen changes based on local React state.

## Application Startup

The frontend entry point is `frontend/src/main.tsx`.

What happens there:

1. React creates a root from the `#root` element in `frontend/index.html`
2. `App.tsx` is rendered
3. `frontend/src/styles/index.css` is loaded, which imports:
   - `fonts.css`
   - `tailwind.css`
   - `theme.css`

This means the visual system is ready before the main app renders.

## Main App Flow

`App.tsx` is the root orchestrator for the experience.

It owns four pieces of state:

- `step`: whether the app is showing the mood screen or the exercise screen
- `userData`: the selected mood and optional note
- `moodId`: the backend-generated ID returned after mood submission
- `sessionId`: the backend-generated ID returned after session creation

The app has two major UI states:

- `'input'`: shows the mood selection form
- `'exercise'`: shows the guided session

`AnimatePresence` and `motion.div` are used to fade smoothly between those two states.

### What happens when a user submits a mood

When the user submits the form:

1. `App.tsx` calls `api.submitMood({ mood, notes })`
2. if the request succeeds, the returned mood ID is saved in state
3. the selected mood and notes are stored in `userData`
4. the app transitions from the input screen to the exercise screen

There is an important fallback here:

- if the API call fails, the app still moves to the exercise screen
- the error is only logged to the console

So the frontend is designed to keep the experience moving even when mood persistence fails.

### What happens when a session starts

Once the exercise screen is loaded and the user presses `Start`:

1. `App.tsx` calls `api.startSession(...)` through the `onSessionStart` callback
2. the session is created using the saved `moodId`, exercise type, and total step count
3. the returned session ID is stored in React state

If session creation fails:

- the error is logged
- no fallback session ID is generated on the frontend

## Screen 1: Mood Input

`MoodInput.tsx` is the first screen a user sees.

Its job is to collect:

- one mood selection
- an optional free-text note

### Available moods

The component defines six moods in a local array:

- `happy`
- `stressed`
- `anxious`
- `tired`
- `sad`
- `calm`

Each mood contains:

- a `value`
- a visible label
- a Lucide icon
- a gradient used for the selected card state
- a matching shadow style

### How the mood screen works

The user experience is:

1. the page opens with animated background particles
2. the `Serenity` heading animates with a gradient shimmer
3. the user clicks a mood card
4. the selected card becomes highlighted with a stronger gradient treatment
5. the user may add notes in the textarea
6. the `Find My Exercise` button becomes active once a mood is selected

### Local component state

`MoodInput.tsx` manages:

- `selectedMood`
- `notes`

When the form is submitted, it passes both values upward to `App.tsx`.

### Design behavior

This component leans heavily on motion and visual feedback:

- cards scale and lift on hover
- selected cards animate the icon
- the call-to-action button has a moving light sweep
- the background uses floating dots to make the page feel calmer and less static

## Screen 2: Exercise Session

`ExerciseSession.tsx` is the core interactive experience after mood selection.

This component decides:

- which exercise corresponds to the selected mood
- which step is currently active
- whether the session is in its pre-start state or in-progress state
- what music should play

## Exercise Mapping

The app stores all exercise definitions in a local `exercises` object.

Each mood maps to:

- an exercise type
- a display duration string
- a gradient theme
- a fallback music label
- a `steps` array

Current mappings:

- `happy` -> `Gratitude Meditation`
- `stressed` -> `Box Breathing`
- `anxious` -> `4-7-8 Breathing`
- `tired` -> `Energizing Flow`
- `sad` -> `Heart Meditation`
- `calm` -> `Mindfulness`

If the mood is not recognized, the component falls back to the `calm` exercise.

## Step Model

The session supports two step types:

### Regular steps

Regular steps contain:

- `instruction`
- `duration`

These are used for prompts like sitting comfortably, relaxing the body, or focusing attention.

### Breathing steps

Breathing steps contain:

- `phase`: `inhale`, `hold`, or `exhale`
- `duration`

These are used in the `stressed` and `anxious` flows, which are the only exercises with animated breath-cycle guidance.

## Exercise Session Lifecycle

### Pre-start state

Before the user presses `Start`, `ExerciseSession.tsx` shows:

- a back button
- the chosen exercise title
- the loaded song title, or a fallback music name
- a `Start` button

This is effectively a lightweight intro screen for the chosen exercise.

### Music loading

When `ExerciseSession` mounts, it tries to fetch a song from the backend:

1. `api.getSongByEmotion(mood)` is called
2. if successful, the song title is displayed
3. the stream URL is converted into a full backend URL
4. the audio element is pointed at `http://localhost:8080/...`

If that request fails:

- the UI falls back to the local hardcoded exercise music label
- no frontend fallback audio file is loaded

So the label can appear even when no real audio stream is available.

### Starting the session

When the user clicks `Start`:

1. the frontend asks the backend to create a session
2. `isPlaying` becomes `true`
3. if an audio URL is available, the browser attempts to start playback
4. `isAudioPlaying` is set to `true`

At that point, the intro screen is replaced by the active step UI.

### Moving through steps

The session keeps track of `currentStepIndex`.

When the user advances:

- if more steps remain, the index increments
- if the last step has been reached, playback stops and the session UI exits the playing state

There is also a visible `Next` button that allows the user to advance manually.

## Step Rendering

`ExerciseSession.tsx` chooses the visual component based on the current step type:

- `breathing` steps render `BreathingStep`
- `regular` steps render `RegularStep`

This separation keeps the exercise logic readable while allowing each screen type to have a very different visual treatment.

## BreathingStep Component

`BreathingStep.tsx` is responsible for the immersive breath cycle screen.

### Props it receives

- `phase`
- `duration`
- `onComplete`

### How it behaves

When the component mounts or the phase changes:

1. the countdown is reset to the full duration
2. a one-second interval starts
3. the countdown decreases every second
4. when the count reaches zero, `onComplete(phase, duration)` is called

### Visual behavior

The component changes its presentation based on the breathing phase:

- `inhale` uses a blue-indigo-purple gradient
- `hold` uses an amber-orange-red gradient
- `exhale` uses a teal-cyan-blue gradient

The circle animation also changes by phase:

- inhale shrinks toward a smaller scale target
- hold sits at a middle scale
- exhale expands to a larger scale target

This creates a visual rhythm that acts as the breathing guide.

### Extra motion effects

The screen also includes:

- floating background particles
- a rotating gradient orb
- pulsing concentric rings
- radial particle bursts around the circle
- animated phase text and countdown transitions

## RegularStep Component

`RegularStep.tsx` renders the non-breathing exercise steps.

### Props it receives

- `stepNumber`
- `totalSteps`
- `instruction`
- `gradient`
- `duration`

### How it behaves

When the step loads:

1. the local timer is initialized with `duration`
2. a one-second interval counts down the remaining time
3. the displayed timer updates each second

The timer reaching zero does not automatically advance the step. The user still depends on the `Next` button in `ExerciseSession.tsx` for navigation.

### What the user sees

The screen displays:

- a large circular step badge
- the current instruction text
- the remaining time in seconds
- a progress strip showing completed, current, and upcoming steps
- a soft gradient glow in the background

This component is more instruction-focused than `BreathingStep`, but it still uses motion heavily to keep the experience feeling alive.

## State Management Strategy

The app uses plain React state throughout. There is no Redux, Zustand, Context-based state store, or router-managed flow.

State is split by responsibility:

- `App.tsx` owns app-level screen flow and backend IDs
- `MoodInput.tsx` owns temporary form input state
- `ExerciseSession.tsx` owns playback and step state
- `BreathingStep.tsx` and `RegularStep.tsx` each own their own timers

For the current size of the app, this is enough and keeps the architecture easy to follow.

## Animation System

The app uses `motion/react` for nearly every visible transition.

Animation is used in four main ways:

- page transitions between the mood and exercise screens
- hover and selection feedback on controls
- immersive background particle motion
- timed breathing and pulse guidance during exercises

This is one of the defining traits of the frontend. The UI is not just form-driven; it is meant to feel guided and soothing.

## Styling System

The frontend styling is built from three layers.

### 1. Tailwind setup

`frontend/src/styles/tailwind.css` imports Tailwind CSS and defines the source scan path for project files.

### 2. Theme tokens

`frontend/src/styles/theme.css` defines CSS custom properties for:

- background colors
- foreground colors
- borders
- primary, secondary, and accent colors
- radii
- chart and sidebar values

The default palette is soft and wellness-oriented, centered on:

- pale mint backgrounds
- muted teal primary tones
- light accent surfaces

### 3. Base element styles

`theme.css` also sets default styling behavior for:

- `body`
- headings
- labels
- buttons
- inputs

This gives the app a consistent baseline even before utility classes are layered on top.

## API Integration

All backend communication is centralized in `src/app/api.ts`.

### Base URL

The frontend uses:

```ts
const API_BASE_URL = 'http://localhost:8080/api';
```

This means the frontend assumes the Spring Boot backend is running locally on port `8080`.

### Implemented API client methods

The client contains wrappers for:

- `health()`
- `submitMood()`
- `getSongByEmotion()`
- `startSession()`
- `startStep()`
- `completeStep()`
- `completeBreathing()`
- `completeSession()`
- `getSession()`

### How requests work

The `ApiClient.request()` helper:

- builds the full URL
- sends JSON requests with `Content-Type: application/json`
- throws an error if the response status is not OK
- returns parsed JSON for success responses

This keeps the rest of the app from duplicating `fetch` logic.

## What the Frontend Actually Uses Today

Even though the API client supports many backend endpoints, the current UI only uses a subset of them:

- `submitMood()`
- `startSession()`
- `getSongByEmotion()`

The following backend endpoints are defined in the client but are not currently called by the active UI:

- `startStep()`
- `completeStep()`
- `completeBreathing()`
- `completeSession()`
- `getSession()`
- `health()`

That means the frontend currently does not fully record session progress back to the backend, even though the backend has endpoints for that purpose.

## Important Runtime Behavior

There are a few implementation details that are worth knowing if you are onboarding to this frontend.

### 1. Mood submission is resilient

If mood submission fails, the user still moves into the exercise experience.

### 2. Session tracking is only partially integrated

A session is created at the moment the user starts the exercise, but individual steps and breathing completions are not sent back to the backend.

### 3. Regular steps do not auto-advance

Their timer counts down visually, but the user must still press `Next`.

### 4. Breathing steps do auto-complete

`BreathingStep.tsx` calls its completion callback when the countdown ends.

### 5. Audio is backend-dependent

Music only plays if the backend successfully returns a song and stream URL that the browser can load.

## Known Gaps Between Frontend Types and Backend Reality

A few frontend interfaces do not exactly match the backend models described by the current Spring Boot code.

Examples:

- `MoodRecord` in the frontend expects `timestamp`, but the backend returns `createdAt`
- `SessionRecord` in the frontend expects `completedSteps` and `createdAt`, while the backend uses `currentStep` and `startedAt`

The current UI avoids breaking mainly because it only reads `response.data.id` from those responses in the places it uses them. But these type mismatches would matter more once richer session history is displayed on screen.

## Development Workflow

### Install dependencies

```powershell
cd Serenity
npm install
```

### Start the dev server

```powershell
npm run dev
```

Vite serves the app locally, typically at:

```text
http://localhost:5173
```

That matches the backend CORS configuration.

## Typical End-to-End User Journey

Here is the actual front-to-back experience in order:

1. The app loads and shows the mood selection screen.
2. The user picks one of six moods.
3. The user optionally adds a short note.
4. The frontend sends the mood to `POST /api/mood`.
5. The app transitions to the exercise intro screen.
6. The frontend fetches a song using `GET /api/songs/emotion/{mood}`.
7. The user presses `Start`.
8. The frontend creates a session with `POST /api/session/start`.
9. The app begins showing either regular steps or breathing steps.
10. The user moves through the sequence until the session ends or exits.

## Current Limitations

The frontend is already pleasant to use, but it has a few important limitations:

- there is no route-based navigation
- there is no persistence if the page reloads
- step progress is not synchronized back to the backend
- session completion is not reported to the backend
- some local state such as `isAudioPlaying`, `isMuted`, and `showControls` is only partially used
- several imported icons for playback controls are currently unused
- audio fallback is only textual, not functional
- frontend TypeScript interfaces do not fully match backend response models

## Suggested Next Improvements

The highest-value next steps would be:

- call `startStep`, `completeStep`, `completeBreathing`, and `completeSession` during the real session flow
- align frontend interfaces with backend DTOs and models
- auto-advance regular steps when their timer reaches zero
- surface user-friendly error states instead of only logging to the console
- add persistent resume behavior for in-progress sessions
- extract exercise definitions into separate config files for easier maintenance
- clean up unused state and unused imports in `ExerciseSession.tsx`
