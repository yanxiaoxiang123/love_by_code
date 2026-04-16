# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**LOVE_BY_CODE** is a romantic pixel-art interactive story game — a 4-act love confession experience where players navigate through themed levels, collect characters, and interact with objects to reveal a progressive narrative. Built with React 19 + TypeScript + Vite + Tailwind CSS v4.

## Commands

```bash
npm run dev      # Start dev server on port 3000
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # TypeScript type check (tsc --noEmit)
npm run clean    # Remove dist folder
```

## Architecture

### Scene Management

`App.tsx` manages the game flow through scene indices:
- `-1` → Intro (title screen)
- `0-3` → GameLevel (4 acts)
- `4` → Outro (final confession)

Each level is configured in `src/data/levels.ts` with items, themes, puzzles, and narrative text.

### Game Loop

`GameLevel.tsx` uses `motion/react`'s `useAnimationFrame` for the game loop:
- Player movement via arrow keys (← →)
- Action key (Space/Enter) for interactions
- Collision detection against level items
- Camera follows player, clamped to world bounds

### Level Configuration

Levels are defined in `src/data/levels.ts` with the `LevelConfig` interface:
- `theme`: 'campus' | 'night' | 'code' | 'rooftop' — controls visuals and item rendering
- `items`: Array of collectible/interactive/npc elements with x positions
- `puzzle`: Optional ordered-interaction puzzle (Act 2 & 3)
- `baseSentence`: Progressive narrative revealed as player completes objectives

### Audio System

`App.tsx` manages background music with crossfade transitions:
- Opening music, per-level tracks, and letter reveal music
- `useEffect` on `activeTrackUrl` handles fade-to and crossfade logic
- Tracks stored in `demo/music/` directory

### Sprite System

`HeroSpineSprite.tsx` loads animation frames from `demo/男主-固定镜头-走路动作-frames/`:
- Frames parsed from filename timestamps (e.g., `walk-00-05-123.png`)
- `isMoving` prop triggers frame cycling
- Uses `import.meta.glob` for eager loading

## Key Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Root component, scene state, audio management |
| `src/components/GameLevel.tsx` | Main gameplay: movement, collisions, UI overlay |
| `src/data/levels.ts` | Level configs, item definitions, puzzle logic |
| `src/components/Intro.tsx` | Title screen |
| `src/components/Outro.tsx` | Final confession sequence |
| `src/components/HeroSpineSprite.tsx` | Player character animation |
| `vite.config.ts` | Vite + Tailwind v4 + React setup |

## Game Themes

Each act has a distinct visual style and interaction pattern:
- **Act 1 (campus)**: Collect floating characters (H, X, H, ❤️)
- **Act 2 (night)**: Light up streetlamps in order to reveal memories
- **Act 3 (code)**: Fix "error" bugs in emotional code
- **Act 4 (rooftop)**: Approach the NPC on a rooftop to deliver the confession
