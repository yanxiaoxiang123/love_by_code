import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';

interface StarConfig {
  width: number;
  height: number;
  top: number;
  left: number;
  opacity: number;
  animationDuration: number;
  animationDelay: number;
}

interface OutroProps {
  onRestart: () => void;
  onLetterRevealChange?: (isRevealed: boolean) => void;
}

export default function Outro({ onRestart, onLetterRevealChange }: OutroProps) {
  const [step, setStep] = useState(0);

  // Memoized star positions to avoid re-randomizing on every render
  const outroStars = useMemo<StarConfig[]>(() => (
    Array.from({ length: 100 }).map(() => ({
      width: Math.random() * 2 + 1,
      height: Math.random() * 2 + 1,
      top: Math.random() * 100,
      left: Math.random() * 100,
      opacity: Math.random() * 0.7 + 0.1,
      animationDuration: Math.random() * 4 + 2,
      animationDelay: Math.random() * 2,
    }))
  ), []);

  useEffect(() => {
    onLetterRevealChange?.(step >= 1);
  }, [onLetterRevealChange, step]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (step < 2) {
          setStep(s => s + 1);
        } else {
          onRestart();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, onRestart]);

  return (
    <div className="w-full h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden px-6 bg-stars">
      {/* Starry night background */}
      <div className="absolute inset-0 pointer-events-none">
        {outroStars.map((star, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse will-change-transform"
            style={{
              width: star.width + 'px',
              height: star.height + 'px',
              top: star.top + '%',
              left: star.left + '%',
              opacity: star.opacity,
              animationDuration: star.animationDuration + 's',
              animationDelay: star.animationDelay + 's',
            }}
          />
        ))}
      </div>

      <div className="z-10 max-w-2xl w-full text-center">
        {step === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="flex flex-col items-center"
          >
            <div className="w-20 h-14 bg-white/10 border-2 border-white/30 rounded flex items-center justify-center mb-10 cursor-pointer hover:bg-white/20 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                 onClick={() => setStep(1)}>
              <div className="w-10 h-0 border-t-2 border-white/50 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-pink-400 rotate-45 transform origin-center scale-75 shadow-[0_0_8px_rgba(244,114,182,0.8)]" />
              </div>
            </div>
            <p className="text-xl md:text-2xl text-white/90 tracking-widest leading-loose drop-shadow-md">
              “如果可以，想和你一起走过更长的夜路。”
            </p>
            <p className="mt-16 text-sm text-white/40 animate-pulse tracking-widest">
              [ 点击信封 或 按 Enter 展开 ]
            </p>
          </motion.div>
        )}

        {step >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5 }}
            className="flex flex-col items-center"
          >
            <div className="pixel-heart mb-16 shadow-[0_0_30px_rgba(244,114,182,0.6)]" />
            
            <div className="space-y-8 text-lg md:text-xl text-white/90 tracking-widest leading-loose text-left inline-block">
              <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 1 }}>
                如果心意也能像代码一样被认真编译，
              </motion.p>
              <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2.0, duration: 1 }}>
                那我想把所有没说出口的话，
              </motion.p>
              <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 3.5, duration: 1 }}>
                都运行成一句最简单的结果：
              </motion.p>
              <motion.p 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ delay: 5.5, duration: 1.5 }}
                className="text-3xl md:text-4xl font-bold text-center mt-12 text-pink-300 drop-shadow-[0_0_15px_rgba(244,114,182,0.5)]"
              >
                我喜欢你。
              </motion.p>
            </div>

            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 8, duration: 1 }}
              className="mt-24 text-sm text-white/40 cursor-pointer hover:text-white/80 tracking-widest"
              onClick={onRestart}
            >
              [ 按 Enter 重新回忆 ]
            </motion.p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
