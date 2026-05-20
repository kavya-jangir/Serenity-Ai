import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface BreathingStepProps {
  phase: 'inhale' | 'hold' | 'exhale';
  duration: number;
  onComplete: (phase: string, duration: number) => void;
}

export function BreathingStep({ phase, duration, onComplete }: BreathingStepProps) {
  const [countdown, setCountdown] = useState(duration);

  useEffect(() => {
    setCountdown(duration);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(() => onComplete(phase, duration), 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, duration, onComplete]);

  const getCircleScale = () => {
    switch (phase) {
      case 'inhale':
        return 0.4;
      case 'exhale':
        return 1;
      case 'hold':
        return 0.7;
      default:
        return 0.7;
    }
  };

  const getGradient = () => {
    switch (phase) {
      case 'inhale':
        return 'from-blue-400 via-indigo-500 to-purple-500';
      case 'exhale':
        return 'from-teal-400 via-cyan-500 to-blue-500';
      case 'hold':
        return 'from-amber-400 via-orange-500 to-red-500';
      default:
        return 'from-primary to-accent';
    }
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return 'Breathe In';
      case 'exhale':
        return 'Breathe Out';
      case 'hold':
        return 'Hold';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/10 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.1, 0.3, 0.1],
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
      </div>

      <div className="relative z-10">
        <motion.div
          className="relative"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="relative w-96 h-96 flex items-center justify-center"
            animate={{
              scale: getCircleScale(),
            }}
            transition={{
              duration: duration,
              ease: 'easeInOut',
            }}
          >
            <motion.div
              className={`absolute inset-0 rounded-full bg-gradient-to-br ${getGradient()} shadow-2xl`}
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            <motion.div
              className="absolute inset-4 rounded-full bg-gradient-to-br from-white/20 to-transparent backdrop-blur-sm"
            />

            <div className="relative z-10 text-center">
              <motion.div
                className="text-white text-6xl mb-4 uppercase tracking-wider font-light"
                animate={{
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {getPhaseText()}
              </motion.div>
              <motion.div
                className="text-white text-9xl font-light"
                key={countdown}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {countdown}
              </motion.div>
            </div>

            <motion.div
              className={`absolute -inset-8 rounded-full border-4 border-white/20`}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            <motion.div
              className={`absolute -inset-16 rounded-full border-2 border-white/10`}
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5,
              }}
            />
          </motion.div>

          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full bg-primary/30"
              style={{
                top: '50%',
                left: '50%',
                marginLeft: '-6px',
                marginTop: '-6px',
              }}
              animate={{
                x: [0, Math.cos((i * Math.PI) / 6) * 250],
                y: [0, Math.sin((i * Math.PI) / 6) * 250],
                scale: [1, 0, 1],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeOut',
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
