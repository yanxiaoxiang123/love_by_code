import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useAnimationFrame, useMotionValue, useTransform } from 'motion/react';
import { LevelConfig } from '../data/levels';
import HeroSpineSprite, { HERO_SPINE_ASPECT_RATIO } from './HeroSpineSprite';
import FemaleLeadSprite from './FemaleLeadSprite';
import { usePerformanceMode } from '../hooks/usePerformanceMode';

const streetLampSprite = new URL('../../demo/img/street_lamp_identical.svg', import.meta.url).href;
const benchSprite = new URL('../../demo/img/bench_true_vector.svg', import.meta.url).href;

interface StarConfig {
  width: number;
  height: number;
  top: number;
  left: number;
  animationDuration: number;
  animationDelay: number;
}

interface GameLevelProps {
  level: LevelConfig;
  onComplete: () => void;
}

function appendUnique(items: string[], nextItem: string) {
  return items.includes(nextItem) ? items : [...items, nextItem];
}

export default function GameLevel({ level, onComplete }: GameLevelProps) {
  const [collected, setCollected] = useState<string[]>([]);
  const [interacted, setInteracted] = useState<string[]>([]);
  const [nearbyItem, setNearbyItem] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [isPlayerMoving, setIsPlayerMoving] = useState(false);
  const [hasStartedAct1Arrival, setHasStartedAct1Arrival] = useState(false);
  const [hasCompletedAct1Arrival, setHasCompletedAct1Arrival] = useState(false);
  const [typedSentence, setTypedSentence] = useState('');

  const playerX = useMotionValue(100);

  const keys = useRef({ left: false, right: false, action: false });
  const actionHandled = useRef(false);
  const messageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const syncMovementState = () => {
    setIsPlayerMoving(keys.current.left || keys.current.right);
  };

  const orderedPuzzle = level.puzzle?.mode === 'ordered-interactions' ? level.puzzle : null;
  const isAct1 = level.id === 'act1';
  const isRooftopScene = level.theme === 'rooftop';
  const objectiveItems = level.items.filter((item) => item.type !== 'npc');
  const totalObjectives = objectiveItems.length;
  const completedObjectives = objectiveItems.filter(
    (item) => collected.includes(item.id) || interacted.includes(item.id),
  ).length;
  const completedSequenceCount = orderedPuzzle
    ? orderedPuzzle.sequence.filter((itemId) => interacted.includes(itemId)).length
    : 0;
  const nextSequenceId = orderedPuzzle ? orderedPuzzle.sequence[completedSequenceCount] : null;
  const isLevelComplete = objectiveItems.every((item) => {
    if (item.type === 'collect') {
      return collected.includes(item.id);
    }

    if (item.type === 'interact') {
      return interacted.includes(item.id);
    }

    return true;
  });
  const canAdvanceToNextScene = isLevelComplete && (!isAct1 || hasCompletedAct1Arrival);
  const isRooftopReveal = isRooftopScene && interacted.includes('bench');
  const narrativeBeats = level.narrativeBeats?.length ? level.narrativeBeats : [level.baseSentence];
  const visibleBeatCount = Math.min(narrativeBeats.length, completedObjectives + 1);
  const targetSentence = narrativeBeats.slice(0, visibleBeatCount).join(' ');
  const shouldShowEllipsis = !isRooftopReveal && visibleBeatCount < narrativeBeats.length;
  const shouldHideBottomNarrative = isRooftopReveal;
  const sequenceCompletionProgress = orderedPuzzle
    ? completedSequenceCount / orderedPuzzle.sequence.length
    : 0;
  const nightAmbientOpacity = level.theme === 'night' ? 0.12 + sequenceCompletionProgress * 0.18 : 0;
  const codeAmbientOpacity = level.theme === 'code' ? 0.1 + sequenceCompletionProgress * 0.24 : 0;

  // FPS monitoring for adaptive performance
  const isLowPerformance = usePerformanceMode();
  const shouldReduceRooftopEffects = isRooftopScene && isLowPerformance;
  const rooftopAmbientOpacity = isRooftopReveal
    ? shouldReduceRooftopEffects ? 0.22 : 0.42
    : 0;

  // Memoized star positions to avoid re-randomizing on every render
  // Reduce star count on low-performance devices
  const starCount = isRooftopScene
    ? isLowPerformance ? 10 : 24
    : isLowPerformance ? 20 : 50;
  const rooftopStars = useMemo<StarConfig[]>(() => (
    Array.from({ length: starCount }).map(() => ({
      width: Math.random() * 3 + 1,
      height: Math.random() * 3 + 1,
      top: Math.random() * 70,
      left: Math.random() * 100,
      animationDuration: Math.random() * 3 + 2,
      animationDelay: Math.random() * 2,
    }))
  ), [starCount]);

  // Camera follows player, clamped to world bounds
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }

      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setCollected([]);
    setInteracted([]);
    setNearbyItem(null);
    setShowMessage(null);
    setShowToast(null);
    setIsPlayerMoving(false);
    setHasStartedAct1Arrival(false);
    setHasCompletedAct1Arrival(false);
    setTypedSentence('');
    playerX.set(100);
    keys.current = { left: false, right: false, action: false };
    actionHandled.current = false;

    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
      messageTimeoutRef.current = null;
    }

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
  }, [level.id, playerX]);

  useEffect(() => {
    if (!isAct1 || !isLevelComplete || hasStartedAct1Arrival) {
      return;
    }

    setHasStartedAct1Arrival(true);
  }, [hasStartedAct1Arrival, isAct1, isLevelComplete]);

  const cameraX = useTransform(playerX, (x) => {
    const maxScroll = Math.max(0, level.worldWidth - windowWidth);
    const targetX = x - windowWidth / 2;
    return -Math.max(0, Math.min(targetX, maxScroll));
  });

  const queueMessage = (message: string, duration = 3000) => {
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }

    setShowMessage(message);
    messageTimeoutRef.current = setTimeout(() => {
      setShowMessage(null);
      messageTimeoutRef.current = null;
    }, duration);
  };

  const queueToast = (message: string, duration = 2000) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    setShowToast(message);
    toastTimeoutRef.current = setTimeout(() => {
      setShowToast(null);
      toastTimeoutRef.current = null;
    }, duration);
  };

  // Input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        keys.current.left = true;
        syncMovementState();
      }
      if (e.key === 'ArrowRight') {
        keys.current.right = true;
        syncMovementState();
      }
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault(); // Prevent scrolling
        keys.current.action = true;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        keys.current.left = false;
        syncMovementState();
      }
      if (e.key === 'ArrowRight') {
        keys.current.right = false;
        syncMovementState();
      }
      if (e.key === ' ' || e.key === 'Enter') {
        keys.current.action = false;
        actionHandled.current = false;
      }
    };
    const handleBlur = () => {
      keys.current = { left: false, right: false, action: false };
      actionHandled.current = false;
      setIsPlayerMoving(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Game Loop
  useAnimationFrame((_time, delta) => {
    const canControlPlayer = !isRooftopReveal;
    const speed = 0.3 * delta;
    let currentX = playerX.get();

    // Movement
    if (canControlPlayer && keys.current.left) {
      currentX -= speed;
    }
    if (canControlPlayer && keys.current.right) {
      currentX += speed;
    }

    // Bounds
    currentX = Math.max(20, Math.min(currentX, level.worldWidth - 40));
    playerX.set(currentX);

    // Check level completion boundary
    if (canAdvanceToNextScene && currentX > level.worldWidth - 100 && level.theme !== 'rooftop') {
      onComplete();
    }

    // Interaction & Collision logic
    let foundNearby: string | null = null;
    
    level.items.forEach(item => {
      const dist = Math.abs(currentX - item.x);

      if (item.type === 'collect') {
        if (dist < 40 && !collected.includes(item.id)) {
          setCollected((prev) => appendUnique(prev, item.id));
        }
      } else if (item.type === 'interact') {
        if (dist < 60) {
          foundNearby = item.id;
          if (keys.current.action && !actionHandled.current && !interacted.includes(item.id)) {
            actionHandled.current = true;

            if (orderedPuzzle && item.id !== nextSequenceId) {
              queueToast(orderedPuzzle.wrongAttemptMessage);
              return;
            }

            if (toastTimeoutRef.current) {
              clearTimeout(toastTimeoutRef.current);
              toastTimeoutRef.current = null;
            }

            setShowToast(null);
            setInteracted((prev) => appendUnique(prev, item.id));

            if (item.message) {
              queueMessage(item.message);
            }
          }
        }
      }
    });

    if (nearbyItem !== foundNearby) {
      setNearbyItem(foundNearby);
    }
  });

  // Calculate progress for the sentence
  const typeDelayMs = (() => {
    const baseSpeed = level.typeSpeedMs ?? 28;

    if (level.theme !== 'code') {
      return baseSpeed;
    }

    return baseSpeed + (typedSentence.length % 4 === 0 ? 24 : typedSentence.length % 2 === 0 ? 10 : 0);
  })();

  useEffect(() => {
    if (shouldHideBottomNarrative) {
      return;
    }

    if (typedSentence === targetSentence) {
      return;
    }

    if (!targetSentence.startsWith(typedSentence)) {
      setTypedSentence('');
      return;
    }

    const timer = window.setTimeout(() => {
      setTypedSentence(targetSentence.slice(0, typedSentence.length + 1));
    }, typeDelayMs);

    return () => window.clearTimeout(timer);
  }, [shouldHideBottomNarrative, targetSentence, typedSentence, typeDelayMs]);

  // Auto-complete Act 4 after interacting with the bench
  useEffect(() => {
    if (isLevelComplete && level.theme === 'rooftop') {
      const timer = setTimeout(() => {
        onComplete();
      }, 5200);
      return () => clearTimeout(timer);
    }
  }, [isLevelComplete, level.theme, onComplete]);

  // Helper to render the NPC character
  const renderNPC = (isMemory = false, facingLeft = true) =>
    (
      <FemaleLeadSprite
        isMemory={isMemory}
        facingLeft={facingLeft}
        className="h-[4.95rem]"
        shadowClass={
          isMemory
            ? 'drop-shadow-[0_0_12px_rgba(147,197,253,0.75)]'
            : 'drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]'
        }
      />
    );

  const memoryEntrance = (itemId: string) => {
    if (itemId === 'mem2') {
      return {
        initial: { opacity: 0, y: 18, x: -10, scale: 0.82, filter: 'blur(6px)' },
        animate: {
          opacity: 1,
          y: [18, 6, 0],
          x: [-10, -4, 0],
          scale: [0.82, 0.94, 1],
          filter: 'blur(0px)',
        },
      };
    }

    if (itemId === 'mem1') {
      return {
        initial: { opacity: 0, y: 10, x: 8, scale: 0.88, filter: 'blur(4px)' },
        animate: {
          opacity: 1,
          y: [10, 3, 0],
          x: [8, 3, 0],
          scale: [0.88, 0.98, 1],
          filter: 'blur(0px)',
        },
      };
    }

    return {
      initial: { opacity: 0, y: 22, x: -4, scale: 0.8, filter: 'blur(7px)' },
      animate: {
        opacity: 1,
        y: [22, 8, 0],
        x: [-4, -1, 0],
        scale: [0.8, 0.95, 1],
        filter: 'blur(0px)',
      },
    };
  };

  return (
    <div className={`relative w-full h-screen overflow-hidden ${level.bgClass}`}>
      {/* Background Elements based on theme */}
      {level.theme === 'rooftop' && (
        <div className="absolute inset-0 pointer-events-none">
          {rooftopStars.map((star, i) => (
            <div
              key={i}
              className={`absolute bg-white rounded-full opacity-50 will-change-transform ${
                shouldReduceRooftopEffects ? '' : 'animate-pulse'
              }`}
              style={{
                width: star.width + 'px',
                height: star.height + 'px',
                top: star.top + '%',
                left: star.left + '%',
                animationDuration: shouldReduceRooftopEffects ? undefined : star.animationDuration + 's',
                animationDelay: shouldReduceRooftopEffects ? undefined : star.animationDelay + 's',
              }}
            />
          ))}
        </div>
      )}

      {level.theme === 'code' && (
        <div className="absolute inset-0 pointer-events-none opacity-20" 
             style={{ backgroundImage: 'radial-gradient(#4ade80 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>
      )}

      {level.theme === 'night' && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: nightAmbientOpacity }}
          transition={{ duration: 0.9 }}
          style={{ background: 'radial-gradient(circle at 50% 62%, rgba(253,224,71,0.28) 0%, rgba(253,224,71,0.08) 30%, transparent 65%)' }}
        />
      )}

      {level.theme === 'code' && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: codeAmbientOpacity }}
          transition={{ duration: 0.7 }}
          style={{ background: 'radial-gradient(circle at 50% 70%, rgba(52,211,153,0.28) 0%, rgba(16,185,129,0.08) 34%, transparent 65%)' }}
        />
      )}

      {isRooftopScene && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-10"
          animate={{ opacity: rooftopAmbientOpacity }}
          transition={{ duration: 1.1 }}
          style={{ background: 'radial-gradient(circle at 50% 72%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 28%, rgba(0,0,0,0.42) 70%)' }}
        />
      )}

      {/* World Container */}
      <motion.div 
        className="absolute top-0 left-0 h-full"
        style={{ x: cameraX, width: level.worldWidth }}
      >
        {/* Ground */}
        <div className={`absolute bottom-0 left-0 w-full h-32 ${level.groundClass} z-0`}>
          <div className="w-full h-full opacity-20 bg-grid" />
        </div>

        {/* Items */}
        {level.items.map(item => {
          const isCollected = collected.includes(item.id);
          const isInteracted = interacted.includes(item.id);
          const isNearby = nearbyItem === item.id;

          if (item.type === 'collect' && isCollected) return null;

          return (
            <div 
              key={item.id}
              className="absolute bottom-32 flex flex-col items-center justify-end pb-4"
              style={{ left: item.x, transform: 'translateX(-50%)' }}
            >
              {item.type === 'interact' && !isInteracted && isNearby && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 px-3 py-2 bg-white text-black text-xs rounded shadow-lg pixel-art whitespace-nowrap text-center"
                >
                  <p>按 空格 互动</p>
                  {item.clue && (
                    <p className="mt-1 text-[10px] tracking-[0.25em] text-black/65">
                      {item.clue}
                    </p>
                  )}
                </motion.div>
              )}

              {/* Render specific item visuals */}
              {item.type === 'collect' && (
                <motion.div
                  animate={{ y: [0, -10, 0], textShadow: ["0px 0px 5px rgba(255,255,255,0.5)", "0px 0px 15px rgba(255,255,255,1)", "0px 0px 5px rgba(255,255,255,0.5)"] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-3xl font-bold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] flex items-center justify-center will-change-transform"
                >
                  {item.label === '❤️' ? (
                    <div className="pixel-heart scale-75 shadow-[0_0_15px_rgba(244,114,182,0.8)]" />
                  ) : (
                    item.label
                  )}
                </motion.div>
              )}

              {item.type === 'interact' && level.theme === 'night' && (
                <div className="relative flex h-56 w-44 translate-y-5 items-end justify-center">
                  {/* Light Cone */}
                  {isInteracted && (
                    <motion.div
                      initial={{ opacity: 0, scaleY: 0.9 }}
                      animate={{ opacity: [0.18, 0.95, 0.82], scaleY: [0.92, 1.03, 1] }}
                      transition={{ duration: item.id === 'mem3' ? 1.25 : 0.95, times: [0, 0.42, 1] }}
                      className="absolute left-[34%] top-16 h-44 w-32 -translate-x-1/2 bg-gradient-to-b from-yellow-200/55 via-yellow-200/18 to-transparent pointer-events-none z-0"
                      style={{ clipPath: 'polygon(47% 0, 53% 0, 100% 100%, 0 100%)' }}
                    />
                  )}

                  {isInteracted && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: [0.12, 0.28, 0.16], scale: [0.84, 1.06, 1] }}
                      transition={{ duration: item.id === 'mem1' ? 2.2 : 2.8, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute left-[34%] top-10 h-20 w-20 -translate-x-1/2 rounded-full bg-yellow-200/20 blur-xl pointer-events-none z-0"
                    />
                  )}

                  <motion.img
                    src={streetLampSprite}
                    alt=""
                    draggable={false}
                    initial={false}
                    animate={{
                      filter: isInteracted
                        ? 'brightness(1.18) drop-shadow(0 0 18px rgba(253,224,71,0.55))'
                        : 'brightness(0.92)',
                    }}
                    transition={{ duration: 0.8 }}
                    className="absolute -bottom-4 left-1/2 z-10 h-56 w-auto max-w-none -translate-x-1/2 pixel-art select-none"
                    style={{ imageRendering: 'pixelated' }}
                  />

                  {/* NPC Memory */}
                  {isInteracted && item.showNpcOnInteract && (
                    <motion.div
                      className="absolute bottom-0 left-[34%] z-20 -translate-x-1/2"
                      initial={memoryEntrance(item.id).initial}
                      animate={memoryEntrance(item.id).animate}
                      transition={{ duration: 1.1, ease: 'easeOut', times: [0, 0.68, 1] }}
                    >
                      <motion.div
                        animate={{ opacity: [0.16, 0.35, 0.16] }}
                        transition={{ repeat: Infinity, duration: item.id === 'mem3' ? 2.7 : 3.2 }}
                        className="absolute inset-x-2 bottom-1 h-8 rounded-full bg-sky-200/15 blur-lg"
                      />
                      {renderNPC(true, true)}
                    </motion.div>
                  )}
                </div>
              )}

              {item.type === 'interact' && level.theme === 'code' && !isInteracted && (
                <motion.div
                  animate={{ y: [0, -5, 0], opacity: [0.8, 1, 0.8] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-red-500 font-mono text-lg border border-red-500 bg-red-500/10 px-3 py-1 rounded whitespace-nowrap will-change-transform"
                >
                  {item.label}
                </motion.div>
              )}

              {item.type === 'interact' && level.theme === 'code' && isInteracted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, filter: 'blur(8px)' }}
                  animate={{
                    opacity: [0.2, 1, 0.92, 1],
                    scale: [0.96, 1.02, 0.99, 1],
                    x: [0, -4, 4, -2, 0],
                    filter: ['blur(8px)', 'blur(3px)', 'blur(0px)', 'blur(0px)'],
                  }}
                  transition={{ duration: 0.7, times: [0, 0.24, 0.45, 1] }}
                  className="text-emerald-300 font-mono text-sm border border-emerald-400/60 bg-emerald-500/10 px-3 py-2 rounded whitespace-nowrap shadow-[0_0_18px_rgba(52,211,153,0.25)]"
                >
                  <div className="relative overflow-hidden">
                    <motion.span
                      initial={{ scaleX: 0, opacity: 0.7 }}
                      animate={{ scaleX: 1, opacity: 0 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-emerald-200/80 origin-left"
                    />
                    已修复：{item.clue ?? '心绪'}
                  </div>
                </motion.div>
              )}

              {item.type === 'interact' && level.theme === 'rooftop' && (
                <div className="relative flex h-20 w-40 items-end justify-center">
                  <img
                    src={benchSprite}
                    alt=""
                    draggable={false}
                    className="absolute -bottom-7 left-1/2 z-10 h-20 w-auto max-w-none -translate-x-1/2 pixel-art select-none"
                    style={{ imageRendering: 'pixelated' }}
                  />
                  {isInteracted && (
                    <>
                      <motion.div 
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1, y: -40 }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        className="absolute -top-12 left-1/2 -translate-x-1/2"
                      >
                        <div className="pixel-heart" />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={shouldReduceRooftopEffects ? { opacity: 0.12 } : { opacity: [0.1, 0.28, 0.14] }}
                        transition={shouldReduceRooftopEffects ? { duration: 0.3 } : { duration: 2.6, repeat: Infinity }}
                        className={`absolute bottom-0 left-1/2 h-10 w-32 -translate-x-1/2 rounded-full bg-pink-300/10 ${
                          shouldReduceRooftopEffects ? 'blur-lg' : 'blur-2xl'
                        }`}
                      />
                    </>
                  )}
                </div>
              )}

              {item.type === 'npc' && (
                <motion.div
                  className="relative translate-y-4"
                  animate={
                    isAct1
                      ? { y: 0 }
                      : level.theme === 'rooftop' && interacted.includes('bench')
                        ? shouldReduceRooftopEffects
                          ? { y: -2, x: 0 }
                          : { y: [0, -6, -2], x: [0, -3, 0] }
                        : { y: 0 }
                  }
                  transition={
                    level.theme === 'rooftop' && interacted.includes('bench')
                      ? shouldReduceRooftopEffects
                        ? { duration: 0.35, ease: 'easeOut' }
                        : { duration: 1.2, times: [0, 0.42, 1], ease: 'easeOut' }
                      : { duration: 0.2 }
                  }
                >
                  {isAct1 ? (
                    hasStartedAct1Arrival ? (
                      <motion.div
                        initial={{ x: 320, y: 20, opacity: 0.1, scale: 0.72 }}
                        animate={{
                          x: [320, 48, 0],
                          y: [20, 6, 0],
                          opacity: [0.1, 0.92, 1],
                          scale: [0.72, 1.03, 1],
                        }}
                        transition={{ duration: 3.2, ease: 'easeOut', times: [0, 0.82, 1] }}
                        onAnimationComplete={() => setHasCompletedAct1Arrival(true)}
                      >
                        {renderNPC(false, true)}
                      </motion.div>
                    ) : null
                  ) : (
                    renderNPC(level.theme === 'code', true)
                  )}
                  {level.theme === 'rooftop' && interacted.includes('bench') && (
                    <motion.div 
                      initial={{ opacity: 0, y: 8, scale: 0.8 }}
                      animate={{ opacity: 1, y: -18, scale: 1 }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="absolute -top-12 -right-3 text-pink-200 text-lg font-semibold tracking-[0.2em]"
                    >
                      ...
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>
          );
        })}

        {/* Exit Indicator */}
        {canAdvanceToNextScene && level.theme !== 'rooftop' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-40 text-white text-xl font-bold flex items-center gap-2"
            style={{ left: level.worldWidth - 150 }}
          >
            继续前进 <motion.span animate={{ x: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="will-change-transform">→</motion.span>
          </motion.div>
        )}

        {/* Player */}
        <motion.div 
          className="absolute bottom-32 z-10 h-[4.95rem]"
          style={{
            x: playerX,
            transformOrigin: 'bottom center',
            aspectRatio: HERO_SPINE_ASPECT_RATIO,
          }}
        >
          <motion.div 
            className="w-full h-full relative"
            animate={
              isRooftopReveal
                ? shouldReduceRooftopEffects
                  ? { y: -3, scale: 1 }
                  : { y: [0, -7, -3], scale: [1, 1.02, 1] }
                : { y: 0, scale: 1 }
            }
            transition={
              isRooftopReveal
                ? shouldReduceRooftopEffects
                  ? { duration: 0.35, ease: 'easeOut' }
                  : { duration: 0.9, ease: 'easeOut', times: [0, 0.45, 1] }
                : { duration: 0.2 }
            }
          >
            <HeroSpineSprite isMoving={isPlayerMoving} />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-6 pointer-events-none flex flex-col items-start">
        <h2 className="text-2xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] bg-black/40 px-4 py-1 rounded-full backdrop-blur-sm border border-white/10">{level.title}</h2>
        <p className="text-sm text-white/90 mt-2 bg-black/40 px-4 py-1 rounded-full backdrop-blur-sm border border-white/10 drop-shadow-md">{level.instruction}</p>
        {orderedPuzzle && (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <p className="max-w-2xl text-xs md:text-sm text-white/80 bg-black/35 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm">
              {orderedPuzzle.hintText}
            </p>
            <div className="flex items-center gap-2 rounded-full bg-black/35 px-4 py-2 border border-white/10 backdrop-blur-sm">
              {orderedPuzzle.sequence.map((itemId, index) => (
                <React.Fragment key={itemId}>
                  <motion.span
                    animate={{
                      scale: index < completedSequenceCount ? [1, 1.18, 1] : 1,
                      opacity: index <= completedSequenceCount ? 1 : 0.65,
                    }}
                    transition={{ duration: 0.5 }}
                    className={`h-2.5 w-2.5 rounded-full border ${
                      index < completedSequenceCount
                        ? 'border-pink-300 bg-pink-300 shadow-[0_0_10px_rgba(249,168,212,0.8)]'
                        : index === completedSequenceCount
                          ? 'border-white bg-white/30 shadow-[0_0_8px_rgba(255,255,255,0.35)]'
                          : 'border-white/40 bg-transparent'
                    }`}
                  />
                  {index < orderedPuzzle.sequence.length - 1 && (
                    <motion.span
                      animate={{ opacity: index < completedSequenceCount ? 0.6 : 0.2 }}
                      className="h-px w-5 bg-white/20"
                    />
                  )}
                </React.Fragment>
              ))}
              <span className="ml-1 text-[11px] tracking-[0.25em] text-white/60">
                {completedSequenceCount}/{orderedPuzzle.sequence.length}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Message Popup */}
      {showMessage && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 bg-black/80 border border-white/20 px-6 py-4 rounded-lg text-white text-center max-w-md shadow-2xl backdrop-blur-sm"
        >
          {showMessage}
        </motion.div>
      )}

      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-28 left-1/2 -translate-x-1/2 bg-black/75 border border-pink-300/30 px-5 py-3 rounded-full text-white/90 text-sm text-center shadow-xl backdrop-blur-sm pointer-events-none z-30"
        >
          {showToast}
        </motion.div>
      )}

      {/* Bottom Text Bar */}
      {!shouldHideBottomNarrative && (
        <div className="absolute bottom-0 left-0 w-full h-32 md:h-40 bg-gradient-to-t from-black via-black/80 to-transparent flex items-end justify-center pb-6 md:pb-8 pointer-events-none z-20">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-base md:text-lg text-white/90 tracking-widest drop-shadow-lg text-center px-8 max-w-4xl leading-relaxed"
          >
            {typedSentence}
            {shouldShowEllipsis && <span>...</span>}
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 0.9 }}
              className="ml-1 inline-block text-white/70 will-change-opacity"
            >
              |
            </motion.span>
          </motion.p>
        </div>
      )}

      {/* Mobile Controls (Visible only on small screens) */}
      <div className="absolute bottom-24 left-4 flex gap-4 md:hidden">
        <button 
          className="w-14 h-14 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white active:bg-white/40"
          onTouchStart={() => {
            keys.current.left = true;
            syncMovementState();
          }}
          onTouchEnd={() => {
            keys.current.left = false;
            syncMovementState();
          }}
        >
          ←
        </button>
        <button 
          className="w-14 h-14 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white active:bg-white/40"
          onTouchStart={() => {
            keys.current.right = true;
            syncMovementState();
          }}
          onTouchEnd={() => {
            keys.current.right = false;
            syncMovementState();
          }}
        >
          →
        </button>
      </div>
      <div className="absolute bottom-24 right-4 md:hidden">
        <button 
          className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white active:bg-white/40 font-bold"
          onTouchStart={() => keys.current.action = true}
          onTouchEnd={() => { keys.current.action = false; actionHandled.current = false; }}
        >
          互动
        </button>
      </div>
    </div>
  );
}
