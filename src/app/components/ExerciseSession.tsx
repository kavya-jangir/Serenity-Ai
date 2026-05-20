import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BreathingStep } from './BreathingStep';
import { RegularStep } from './RegularStep';
import { Play, Pause, RotateCcw, X, Volume2, VolumeX } from 'lucide-react';
import { api } from '../api';

interface ExerciseSessionProps {
  mood: string;
  onExit: () => void;
  onSessionStart: (exerciseType: string, totalSteps: number) => Promise<string | null>;
  sessionId: string | null;
}

type Step =
  | { type: 'regular'; instruction: string; duration: number }
  | { type: 'breathing'; phase: 'inhale' | 'hold' | 'exhale'; duration: number };

const exercises: Record<string, { type: string; duration: string; gradient: string; music: string; steps: Step[] }> = {
  happy: {
    type: 'Gratitude Meditation',
    duration: '5 minutes',
    gradient: 'from-emerald-500 to-teal-600',
    music: 'Uplifting Piano',
    steps: [
      {
        type: 'regular',
        instruction: 'Sit comfortably and close your eyes',
        duration: 60
      },

      {
        type: 'regular',
        instruction: 'Take 3 deep breaths',
        duration: 60
      },

      {
        type: 'regular',
        instruction: "Think of 3 things you're grateful for today",
        duration: 60
      },

      {
        type: 'regular',
        instruction: 'Hold each happy thought in your heart and smile gently',
        duration: 60
      },

      {
        type: 'regular',
        instruction: 'Feel the warmth spreading through your body',
        duration: 60
      },
    ],
  },

  stressed: {
    type: 'Box Breathing',
    duration: '5 minutes',
    gradient: 'from-orange-500 to-red-600',
    music: 'Ocean Waves',
    steps: [
      { type: 'regular', instruction: 'Find a quiet space and sit upright', duration: 30 },

      { type: 'regular', instruction: 'Relax your shoulders and jaw', duration: 30 },

      // Round 1
      { type: 'breathing', phase: 'inhale', duration: 4 },
      { type: 'breathing', phase: 'hold', duration: 4 },
      { type: 'breathing', phase: 'exhale', duration: 4 },

      // Round 2
      { type: 'breathing', phase: 'inhale', duration: 4 },
      { type: 'breathing', phase: 'hold', duration: 4 },
      { type: 'breathing', phase: 'exhale', duration: 4 },

      // Round 3
      { type: 'breathing', phase: 'inhale', duration: 4 },
      { type: 'breathing', phase: 'hold', duration: 4 },
      { type: 'breathing', phase: 'exhale', duration: 4 },

      // Round 4
      { type: 'breathing', phase: 'inhale', duration: 4 },
      { type: 'breathing', phase: 'hold', duration: 4 },
      { type: 'breathing', phase: 'exhale', duration: 4 },

      // Final Relaxation
      { type: 'regular', instruction: 'Feel your mind becoming calm and relaxed', duration: 192 },
    ],
  },


  anxious: {
    type: '4-7-8 Breathing',
    duration: '5 minutes',
    gradient: 'from-blue-500 to-indigo-600',
    music: 'Gentle Rain',
    steps: [
      { type: 'regular', instruction: 'Sit comfortably and relax your shoulders', duration: 30 },

      { type: 'regular', instruction: 'Exhale completely and clear your mind', duration: 30 },

      // Round 1
      { type: 'breathing', phase: 'inhale', duration: 4 },
      { type: 'breathing', phase: 'hold', duration: 7 },
      { type: 'breathing', phase: 'exhale', duration: 8 },

      // Round 2
      { type: 'breathing', phase: 'inhale', duration: 4 },
      { type: 'breathing', phase: 'hold', duration: 7 },
      { type: 'breathing', phase: 'exhale', duration: 8 },

      // Round 3
      { type: 'breathing', phase: 'inhale', duration: 4 },
      { type: 'breathing', phase: 'hold', duration: 7 },
      { type: 'breathing', phase: 'exhale', duration: 8 },

      // Round 4
      { type: 'breathing', phase: 'inhale', duration: 4 },
      { type: 'breathing', phase: 'hold', duration: 7 },
      { type: 'breathing', phase: 'exhale', duration: 8 },

      // Final Relaxation
      { type: 'regular', instruction: 'Feel your body becoming calm and relaxed', duration: 140 },
    ],
  },

  tired: {
    type: 'Energizing Flow',
    duration: '5 minutes',
    gradient: 'from-purple-500 to-pink-600',
    music: 'Morning Nature',
    steps: [
      { type: 'regular', instruction: 'Stand tall in Mountain Pose', duration: 60 },

      { type: 'regular', instruction: 'Stretch your arms and shoulders gently', duration: 60 },

      { type: 'regular', instruction: 'Take deep energizing breaths', duration: 60 },

      { type: 'regular', instruction: 'Roll your neck and relax your muscles', duration: 60 },

      { type: 'regular', instruction: 'Feel fresh energy flowing through your body', duration: 60 },
    ],
  },
  sad: {
    type: 'Heart Meditation',
    duration: '5 minutes',
    gradient: 'from-rose-500 to-pink-600',
    music: 'Soft Strings',
    steps: [
      { type: 'regular', instruction: 'Place your hand gently on your heart', duration: 60 },

      { type: 'regular', instruction: 'Take slow and calming breaths', duration: 60 },

      { type: 'regular', instruction: 'Breathe deeply into your heart space', duration: 60 },

      { type: 'regular', instruction: 'Repeat softly: I am safe and loved', duration: 60 },

      { type: 'regular', instruction: 'Let go of sadness and feel inner peace', duration: 60 },
    ],
  },

  calm: {
    type: 'Mindfulness',
    duration: '5 minutes',
    gradient: 'from-teal-500 to-cyan-600',
    music: 'Tibetan Bowls',
    steps: [
      { type: 'regular', instruction: 'Sit comfortably and relax your body', duration: 60 },

      { type: 'regular', instruction: 'Take slow deep breaths', duration: 60 },

      { type: 'regular', instruction: 'Observe your breath carefully', duration: 60 },

      { type: 'regular', instruction: 'Notice thoughts without judgment', duration: 60 },

      { type: 'regular', instruction: 'Focus on the present moment and stay calm', duration: 60 },
    ],
  },
}

export function ExerciseSession({
  mood,
  onExit,
  onSessionStart,
  sessionId,
}: ExerciseSessionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [songTitle, setSongTitle] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const exercise = exercises[mood] || exercises.calm;
  const currentStep = exercise.steps[currentStepIndex];

  useEffect(() => {
    const timeout = setTimeout(() => setShowControls(false), 3000);
    return () => clearTimeout(timeout);
  }, [showControls]);

  useEffect(() => {
    const loadSong = async () => {
      try {
        const response = await api.getSongByEmotion(mood);
        setSongTitle(response.data.title);
        setAudioUrl(`http://localhost:8080${response.data.streamUrl}`);
      } catch (e) {
        setSongTitle(exercise.music);
      }
    };

    loadSong();
  }, [mood]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const startSession = async () => {
    await onSessionStart(exercise.type, exercise.steps.length);
  };

  const handleStart = async () => {
    await startSession();
    setIsPlaying(true);

    if (audioRef.current && audioUrl) {
      await audioRef.current.play();
      setIsAudioPlaying(true);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < exercise.steps.length - 1) {
      setCurrentStepIndex((p) => p + 1);
    } else {
      setIsPlaying(false);
      audioRef.current?.pause();
    }
  };

  const handleExit = () => {
    audioRef.current?.pause();
    onExit();
  };

  return (
    <div onMouseMove={() => setShowControls(true)}>
      <audio ref={audioRef} src={audioUrl ?? undefined} loop />

      <AnimatePresence mode="wait">
        {!isPlaying ? (
          <motion.div
            className="fixed inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* BACK BUTTON */}
            <button
              onClick={handleExit}
              className="fixed top-6 left-6 z-50 px-4 py-2 bg-white text-black rounded-xl shadow-lg hover:bg-gray-100 transition"
            >
              ← Back
            </button>

            <div className="text-center">
              <h1 className="text-4xl mb-4">{exercise.type}</h1>
              <p className="mb-4">{songTitle}</p>

              <button
                onClick={handleStart}
                className="px-8 py-3 bg-green-500 text-white rounded-xl"
              >
                Start
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key={currentStepIndex}>
            {/* BACK BUTTON */}
            <button
              onClick={handleExit}
              className="fixed top-6 left-6 z-50 px-4 py-2 bg-white text-black rounded-xl shadow-lg hover:bg-gray-100 transition"
            >
              ← Back
            </button>

            {currentStep.type === 'breathing' ? (
              <BreathingStep
                phase={currentStep.phase}
                duration={currentStep.duration}
                onComplete={handleNext}
              />
            ) : (
              <RegularStep
                stepNumber={currentStepIndex + 1}
                totalSteps={exercise.steps.length}
                instruction={currentStep.instruction}
                gradient={exercise.gradient}
                duration={currentStep.duration}
              />
            )}

            <button
              onClick={handleNext}
              className="fixed bottom-10 right-10 bg-black text-white px-5 py-3 rounded-xl"
            >
              Next
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}