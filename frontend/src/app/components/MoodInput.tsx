import { useState } from 'react';
import { Smile, Frown, Zap, Cloud, Battery, Heart } from 'lucide-react';
import { motion } from 'motion/react';

interface MoodInputProps {
  onSubmit: (mood: string, notes: string) => void;
}

const moods = [
  { value: 'happy', label: 'Happy', icon: Smile, gradient: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-500/50' },
  { value: 'stressed', label: 'Stressed', icon: Zap, gradient: 'from-orange-400 to-red-500', shadow: 'shadow-orange-500/50' },
  { value: 'anxious', label: 'Anxious', icon: Cloud, gradient: 'from-blue-400 to-indigo-500', shadow: 'shadow-blue-500/50' },
  { value: 'tired', label: 'Tired', icon: Battery, gradient: 'from-purple-400 to-pink-500', shadow: 'shadow-purple-500/50' },
  { value: 'sad', label: 'Sad', icon: Frown, gradient: 'from-gray-400 to-slate-500', shadow: 'shadow-gray-500/50' },
  { value: 'calm', label: 'Calm', icon: Heart, gradient: 'from-teal-400 to-cyan-500', shadow: 'shadow-teal-500/50' },
];

export function MoodInput({ onSubmit }: MoodInputProps) {
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMood) {
      onSubmit(selectedMood, notes);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-6">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <motion.h1
          className="mb-3 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            backgroundSize: '200% 200%',
          }}
        >
          Serenity
        </motion.h1>
        <motion.p
          className="text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Find your peace, one breath at a time
        </motion.p>

        <div className="relative h-1 w-32 mx-auto mt-4 bg-gradient-to-r from-transparent via-primary/50 to-transparent rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary to-accent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <label className="block mb-6 text-center text-foreground/80">
            How are you feeling today?
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {moods.map((mood, index) => {
              const Icon = mood.icon;
              const isSelected = selectedMood === mood.value;
              return (
                <motion.button
                  key={mood.value}
                  type="button"
                  onClick={() => setSelectedMood(mood.value)}
                  className="relative group"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div
                    className={`relative p-6 rounded-2xl backdrop-blur-sm transition-all overflow-hidden ${
                      isSelected
                        ? `bg-gradient-to-br ${mood.gradient} shadow-xl ${mood.shadow} text-white`
                        : 'bg-white/80 border-2 border-border hover:border-primary/50 text-foreground'
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}

                    <motion.div
                      animate={isSelected ? {
                        rotate: [0, -10, 10, -10, 0],
                        scale: [1, 1.1, 1],
                      } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className="w-10 h-10 mx-auto mb-3 stroke-current" strokeWidth={isSelected ? 2.5 : 2} />
                    </motion.div>
                    <span className="block relative z-10">{mood.label}</span>

                    {!isSelected && (
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-br ${mood.gradient} opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl`}
                      />
                    )}
                  </div>

                  {isSelected && (
                    <motion.div
                      className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-accent/50 rounded-2xl blur-lg -z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <label className="block mb-3 text-foreground/80">
            Anything else on your mind? (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Brief note about what you're experiencing..."
            rows={3}
            className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </motion.div>

        <motion.button
          type="submit"
          disabled={!selectedMood}
          className="relative w-full py-4 bg-gradient-to-r from-primary to-accent text-white rounded-xl overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          whileHover={selectedMood ? { scale: 1.02, y: -2 } : {}}
          whileTap={selectedMood ? { scale: 0.98 } : {}}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity"
          />
          <span className="relative z-10">Find My Exercise</span>

          {selectedMood && (
            <motion.div
              className="absolute inset-0 bg-white/20"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
        </motion.button>
      </form>
    </div>
  );
}
