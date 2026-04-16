import React, { useEffect } from 'react';
import { motion } from 'motion/react';

interface IntroProps {
  onStart: () => void;
}

export default function Intro({ onStart }: IntroProps) {
  // Listen for Enter key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        onStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStart]);

  return (
    <div className="w-full h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-black flex flex-col items-center justify-center relative overflow-hidden bg-stars">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5 }}
        className="text-center z-10"
      >
        <p className="text-pink-300 text-sm tracking-[0.3em] mb-4 drop-shadow-md">代码书心意</p>
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-wider drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
          LOVE_BY_CODE
        </h1>
        
        <motion.div 
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="mt-16"
        >
          <button 
            onClick={onStart}
            className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded text-white tracking-widest transition-all backdrop-blur-sm shadow-[0_0_10px_rgba(255,255,255,0.1)]"
          >
            [ 按 Enter 开始这段心意 ]
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
