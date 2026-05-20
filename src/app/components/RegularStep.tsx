import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface RegularStepProps {
  stepNumber: number;
  totalSteps: number;
  instruction: string;
  gradient: string;
  duration: number;
}

export function RegularStep({
  stepNumber,
  totalSteps,
  instruction,
  gradient,
  duration,
}: RegularStepProps) {

  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [duration]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background p-8">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/10 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.4, 0.1],
              scale: [1, 2, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br ${gradient} shadow-2xl mb-12`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: 'spring', bounce: 0.5 }}
          >
            <motion.div
              className="text-white text-6xl font-light"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {stepNumber}
            </motion.div>

            <motion.div
              className="absolute -inset-4 rounded-full border-4 border-white/20"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <motion.h2
              className="text-5xl md:text-6xl text-foreground mb-8 px-8 leading-tight"
              animate={{
                opacity: [0.9, 1, 0.9],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {instruction}
            </motion.h2>

            {/* TIMER */}
            <motion.div
              className="text-7xl font-bold text-primary mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {timeLeft}s
            </motion.div>

            <div className="flex items-center justify-center gap-3 mt-12">
              {[...Array(totalSteps)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`h-2 rounded-full ${i + 1 === stepNumber
                      ? `bg-gradient-to-r ${gradient} w-16`
                      : i + 1 < stepNumber
                        ? 'bg-primary/50 w-12'
                        : 'bg-border w-8'
                    }`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.6 + i * 0.1, duration: 0.3 }}
                />
              ))}
            </div>

            <motion.p
              className="text-muted-foreground mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              Step {stepNumber} of {totalSteps}
            </motion.p>
          </motion.div>

          <motion.div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br ${gradient} opacity-5 rounded-full blur-3xl -z-10`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.05, 0.1, 0.05],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}