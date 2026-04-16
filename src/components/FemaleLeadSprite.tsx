import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

const femaleFrameModules = import.meta.glob(
  '../../demo/女主-固定镜头-看书动作-身体不要动-frames/*.png',
  {
    eager: true,
    import: 'default',
  },
);

const DEFAULT_FRAME_DURATION_MS = 85;
export const FEMALE_LEAD_ASPECT_RATIO = 364 / 672;

type FemaleLeadSpriteProps = {
  isMemory?: boolean;
  facingLeft?: boolean;
  className?: string;
  shadowClass?: string;
};

type FemaleFrame = {
  durationMs: number;
  src: string;
  timestampMs: number;
};

function parseFrameTimestampMs(path: string) {
  const fileName = path.split('/').pop() ?? '';
  const match = fileName.match(/-(\d{2})-(\d{2})-(\d{3})\.png$/i);

  if (!match) {
    return Number.MAX_SAFE_INTEGER;
  }

  const [, minutesText, secondsText, millisecondsText] = match;
  const minutes = Number(minutesText);
  const seconds = Number(secondsText);
  const milliseconds = Number(millisecondsText);

  return minutes * 60_000 + seconds * 1000 + milliseconds;
}

const femaleFrames: FemaleFrame[] = Object.entries(femaleFrameModules)
  .map(([path, src]) => ({
    src: src as string,
    timestampMs: parseFrameTimestampMs(path),
  }))
  .sort((left, right) => left.timestampMs - right.timestampMs)
  .map((frame, index, frames) => {
    const nextTimestampMs = frames[index + 1]?.timestampMs;
    const durationMs =
      typeof nextTimestampMs === 'number' && Number.isFinite(nextTimestampMs)
        ? Math.max(50, nextTimestampMs - frame.timestampMs)
        : DEFAULT_FRAME_DURATION_MS;

    return {
      ...frame,
      durationMs,
    };
  });

export default function FemaleLeadSprite({
  isMemory = false,
  facingLeft = true,
  className = 'h-[4.5rem]',
  shadowClass = 'drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]',
}: FemaleLeadSpriteProps) {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    if (femaleFrames.length <= 1) {
      setFrameIndex(0);
      return;
    }

    const timer = window.setTimeout(() => {
      setFrameIndex((prev) => (prev + 1) % femaleFrames.length);
    }, femaleFrames[frameIndex]?.durationMs ?? DEFAULT_FRAME_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [frameIndex]);

  const currentFrame = femaleFrames[frameIndex] ?? femaleFrames[0];

  if (!currentFrame?.src) {
    return null;
  }

  return (
    <motion.div
      initial={isMemory ? { opacity: 0, filter: 'blur(4px)' } : { opacity: 1 }}
      animate={isMemory ? { opacity: 0.68, filter: 'blur(0px)' } : { opacity: 1 }}
      className={`relative ${className}`}
      style={{
        scaleX: facingLeft ? -1 : 1,
        aspectRatio: FEMALE_LEAD_ASPECT_RATIO,
      }}
    >
      <img
        src={currentFrame.src}
        alt=""
        draggable={false}
        className={`absolute bottom-0 left-1/2 h-full w-full -translate-x-1/2 pixel-art select-none ${shadowClass}`}
        style={{
          imageRendering: 'pixelated',
          filter: isMemory ? 'hue-rotate(190deg) saturate(0.7) brightness(1.18)' : 'none',
        }}
      />
    </motion.div>
  );
}
