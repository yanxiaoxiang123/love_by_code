import React, { useEffect, useState } from 'react';

const heroFrameModules = import.meta.glob(
  '../../demo/男主-固定镜头-走路动作-frames/*.png',
  {
    eager: true,
    import: 'default',
  },
);

const DEFAULT_FRAME_DURATION_MS = 85;
export const HERO_SPINE_ASPECT_RATIO = 278 / 651;

type HeroSpineSpriteProps = {
  isMoving: boolean;
  className?: string;
  shadowClass?: string;
};

type HeroFrame = {
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

const heroFrames: HeroFrame[] = Object.entries(heroFrameModules)
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

export default function HeroSpineSprite({
  isMoving,
  className = 'w-full h-full',
  shadowClass = 'drop-shadow-[0_0_12px_rgba(255,255,255,0.32)]',
}: HeroSpineSpriteProps) {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    if (!isMoving || heroFrames.length <= 1) {
      setFrameIndex(0);
      return;
    }

    const timer = window.setTimeout(() => {
      setFrameIndex((prev) => (prev + 1) % heroFrames.length);
    }, heroFrames[frameIndex]?.durationMs ?? DEFAULT_FRAME_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [frameIndex, isMoving]);

  const currentFrame = heroFrames[frameIndex] ?? heroFrames[0];

  if (!currentFrame?.src) {
    return null;
  }

  return (
    <img
      src={currentFrame.src}
      alt=""
      draggable={false}
      className={`absolute bottom-0 left-1/2 w-full h-full -translate-x-1/2 pixel-art select-none ${className} ${shadowClass}`}
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
