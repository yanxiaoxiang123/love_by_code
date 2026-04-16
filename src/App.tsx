import React, { useEffect, useMemo, useRef, useState } from 'react';
import Intro from './components/Intro';
import GameLevel from './components/GameLevel';
import Outro from './components/Outro';
import { LEVELS } from './data/levels';

const openingMusicUrl = new URL('../demo/music/开幕.mp3', import.meta.url).href;
const letterMusicUrl = new URL('../demo/music/情书展示.mp3', import.meta.url).href;
const levelMusicUrls = [
  new URL('../demo/music/demo1.mp3', import.meta.url).href,
  new URL('../demo/music/demo2.mp3', import.meta.url).href,
  new URL('../demo/music/demo3.mp3', import.meta.url).href,
  new URL('../demo/music/demo4.mp3', import.meta.url).href,
];

const TARGET_VOLUME = 0.45;
const FADE_DURATION_MS = 900;
const FADE_INTERVAL_MS = 50;

export default function App() {
  const [sceneIndex, setSceneIndex] = useState(-1); // -1: Intro, 0-3: Levels, 4: Outro
  const [isLetterRevealed, setIsLetterRevealed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<number | null>(null);
  const queuedTrackRef = useRef<string | null>(null);

  const handleNextScene = () => {
    setSceneIndex(prev => prev + 1);
  };

  const handleRestart = () => {
    setSceneIndex(-1);
    setIsLetterRevealed(false);
  };

  const activeTrackUrl = useMemo(() => {
    if (sceneIndex === -1) {
      return openingMusicUrl;
    }

    if (sceneIndex >= 0 && sceneIndex < LEVELS.length) {
      return levelMusicUrls[sceneIndex] ?? levelMusicUrls[levelMusicUrls.length - 1];
    }

    if (sceneIndex === LEVELS.length) {
      return isLetterRevealed ? letterMusicUrl : levelMusicUrls[levelMusicUrls.length - 1];
    }

    return null;
  }, [isLetterRevealed, sceneIndex]);

  useEffect(() => {
    return () => {
      if (fadeIntervalRef.current !== null) {
        window.clearInterval(fadeIntervalRef.current);
      }

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!activeTrackUrl) {
      return;
    }

    const clearFade = () => {
      if (fadeIntervalRef.current !== null) {
        window.clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }
    };

    const fadeTo = (
      audio: HTMLAudioElement,
      nextVolume: number,
      onComplete?: () => void,
    ) => {
      clearFade();

      const startVolume = audio.volume;
      const volumeDelta = nextVolume - startVolume;
      const stepCount = Math.max(1, Math.round(FADE_DURATION_MS / FADE_INTERVAL_MS));
      let currentStep = 0;

      fadeIntervalRef.current = window.setInterval(() => {
        currentStep += 1;
        const progress = Math.min(1, currentStep / stepCount);
        audio.volume = Math.max(0, Math.min(1, startVolume + volumeDelta * progress));

        if (progress >= 1) {
          clearFade();
          onComplete?.();
        }
      }, FADE_INTERVAL_MS);
    };

    const startTrack = (trackUrl: string) => {
      const nextAudio = new Audio(trackUrl);
      nextAudio.loop = true;
      nextAudio.volume = 0;
      nextAudio.preload = 'auto';
      audioRef.current = nextAudio;
      queuedTrackRef.current = trackUrl;

      nextAudio.play().catch(() => {
        // Playback may require a user gesture; retry handlers are attached separately.
      });
      fadeTo(nextAudio, TARGET_VOLUME);
    };

    const currentAudio = audioRef.current;
    if (!currentAudio) {
      startTrack(activeTrackUrl);
      return;
    }

    if (queuedTrackRef.current === activeTrackUrl) {
      if (currentAudio.paused) {
        currentAudio.play().catch(() => {
          // Playback may require a user gesture.
        });
      }
      fadeTo(currentAudio, TARGET_VOLUME);
      return;
    }

    fadeTo(currentAudio, 0, () => {
      currentAudio.pause();
      startTrack(activeTrackUrl);
    });
  }, [activeTrackUrl]);

  useEffect(() => {
    if (!activeTrackUrl) {
      return;
    }

    const retryPlayback = () => {
      const audio = audioRef.current;
      if (!audio) {
        return;
      }

      audio.play().catch(() => {
        // Wait for the next user gesture if autoplay is blocked again.
      });
    };

    window.addEventListener('pointerdown', retryPlayback, { once: true });
    window.addEventListener('keydown', retryPlayback, { once: true });

    return () => {
      window.removeEventListener('pointerdown', retryPlayback);
      window.removeEventListener('keydown', retryPlayback);
    };
  }, [activeTrackUrl]);

  return (
    <div className="w-full h-screen bg-black overflow-hidden">
      <div className="scanlines" />
      <div className="crt-flicker w-full h-full">
        {sceneIndex === -1 && <Intro onStart={handleNextScene} />}
        
        {sceneIndex >= 0 && sceneIndex < LEVELS.length && (
          <GameLevel 
            level={LEVELS[sceneIndex]} 
            onComplete={handleNextScene} 
          />
        )}

        {sceneIndex === LEVELS.length && (
          <Outro
            onRestart={handleRestart}
            onLetterRevealChange={setIsLetterRevealed}
          />
        )}
      </div>
    </div>
  );
}
