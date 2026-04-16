import { useEffect, useRef, useState } from 'react';
import { useAnimationFrame } from 'motion/react';

const FPS_THRESHOLD = 30;
const SAMPLE_SIZE = 30;

export function usePerformanceMode() {
  const [isLowPerformance, setIsLowPerformance] = useState(false);
  const frameTimesRef = useRef<number[]>([]);
  const lastTimeRef = useRef<number>(performance.now());
  const sampleCountRef = useRef(0);

  useAnimationFrame((_time, delta) => {
    const now = performance.now();
    const frameTime = now - lastTimeRef.current;
    lastTimeRef.current = now;

    frameTimesRef.current.push(frameTime);
    sampleCountRef.current++;

    if (frameTimesRef.current.length > SAMPLE_SIZE) {
      frameTimesRef.current.shift();
    }

    // Only check every SAMPLE_SIZE frames to avoid jitter
    if (sampleCountRef.current % SAMPLE_SIZE === 0) {
      const avgFrameTime =
        frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
      const avgFps = 1000 / avgFrameTime;

      setIsLowPerformance(avgFps < FPS_THRESHOLD);
    }
  });

  return isLowPerformance;
}
