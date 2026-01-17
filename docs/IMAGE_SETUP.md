# Image Setup Guide

## Image Requirements

- **Dimensions**: 400x600px (portrait orientation)
- **Format**: PNG or JPG
- **Style**: 2D flat art, gloomy dark theme, limited color palette
- **Appeal**: Gen Z / younger generation friendly

## File Locations

- **Web Preview**: `web-preview/public/images/cards/`
- **React Native**: `src/assets/images/cards/`

## Required Files

1. `nexus-prime.jpg`
2. `zephyr-flux.jpg`
3. `voidweaver.jpg`
4. `quantum-shift.jpg`
5. `nexus-helper.jpg`
6. `stellar-wing.jpg`
7. `cosmic-rager.jpg`
8. `dream-stalker.jpg`
9. `fuel-bot.jpg`
10. `the-nexus.jpg`
11. `space-sweeper.jpg`
12. `fusion-core.jpg`

## Generating Images

Use AI image generators with prompts from `scripts/generate-image-prompts.js`:

```bash
node scripts/generate-image-prompts.js
```

Recommended tools:
- DALL-E 3 (ChatGPT Plus)
- Midjourney
- Leonardo.ai
- Stable Diffusion

## Color Palette

- **Dark Grays**: #1a1a2e, #16213e, #0f0f1e
- **Muted Purples**: #533483, #6b4c93, #4a2c5a
- **Dark Blues**: #0f3460, #1a3a5a, #2a4a6a
- **Accents** (sparingly): #00a86b, #7cfc00, #ff6347
