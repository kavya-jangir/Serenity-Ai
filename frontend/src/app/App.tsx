import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MoodInput } from './components/MoodInput';
import { ExerciseSession } from './components/ExerciseSession';
import { api } from './api';

export default function App() {
  const [step, setStep] = useState<'input' | 'exercise'>('input');
  const [userData, setUserData] = useState({ mood: '', notes: '' });
  const [moodId, setMoodId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handleMoodSubmit = async (mood: string, notes: string) => {
    try {
      const response = await api.submitMood({ mood, notes });
      setMoodId(response.data.id);
      setUserData({ mood, notes });
      setStep('exercise');
    } catch (error) {
      console.error('Failed to submit mood:', error);
      // For now, continue without API call
      setUserData({ mood, notes });
      setStep('exercise');
    }
  };

  const handleSessionStart = async (exerciseType: string, totalSteps: number) => {
    if (!moodId) return;
    try {
      const response = await api.startSession({
        moodId,
        exerciseType,
        totalSteps,
      });
      setSessionId(response.data.id);
      return response.data.id;
    } catch (error) {
      console.error('Failed to start session:', error);
      return null;
    }
  };

  const handleReset = () => {
    setStep('input');
    setUserData({ mood: '', notes: '' });
    setMoodId(null);
    setSessionId(null);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {step === 'input' ? (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen flex items-center justify-center py-12 bg-gradient-to-br from-background via-secondary/30 to-background relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 opacity-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
            >
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-primary/20 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    opacity: [0.2, 0.5, 0.2],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </motion.div>

            <div className="relative z-10 w-full">
              <MoodInput onSubmit={handleMoodSubmit} />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="exercise"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ExerciseSession
              mood={userData.mood}
              onExit={handleReset}
              onSessionStart={handleSessionStart}
              sessionId={sessionId}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}