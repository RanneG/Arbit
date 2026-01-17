#!/usr/bin/env node

/**
 * Generate AI image prompts for all trading cards
 * 
 * Usage: node scripts/generate-image-prompts.js
 * 
 * Outputs prompts ready to use with DALL-E, Midjourney, Stable Diffusion, etc.
 */

const cards = [
  {
    name: 'Nexus Prime',
    file: 'nexus-prime.png',
    description: 'Mad Scientist of Dimension X-9',
    rarity: 'Legendary',
  },
  {
    name: 'Zephyr Flux',
    file: 'zephyr-flux.png',
    description: 'The Anxious Sidekick',
    rarity: 'Epic',
  },
  {
    name: 'Voidweaver',
    file: 'voidweaver.png',
    description: 'Master of Dimensional Rifts',
    rarity: 'Legendary',
  },
  {
    name: 'Quantum Shift',
    file: 'quantum-shift.png',
    description: 'The Reality Bender',
    rarity: 'Epic',
  },
  {
    name: 'Nexus Helper',
    file: 'nexus-helper.png',
    description: 'The Task Master',
    rarity: 'Rare',
  },
  {
    name: 'Stellar Wing',
    file: 'stellar-wing.png',
    description: 'Champion of the Celestial Aviary',
    rarity: 'Epic',
  },
  {
    name: 'Cosmic Rager',
    file: 'cosmic-rager.png',
    description: 'The Party Beast',
    rarity: 'Rare',
  },
  {
    name: 'Dream Stalker',
    file: 'dream-stalker.png',
    description: 'The Nightmare Runner',
    rarity: 'Uncommon',
  },
  {
    name: 'Fuel Bot',
    file: 'fuel-bot.png',
    description: 'The Hungry Automaton',
    rarity: 'Rare',
  },
  {
    name: 'The Nexus',
    file: 'the-nexus.png',
    description: 'The Collective Consciousness',
    rarity: 'Legendary',
  },
  {
    name: 'Space Sweeper',
    file: 'space-sweeper.png',
    description: 'The Cosmic Janitor',
    rarity: 'Common',
  },
  {
    name: 'Fusion Core',
    file: 'fusion-core.png',
    description: 'The Experimental Hybrid',
    rarity: 'Epic',
  },
];

const basePrompt = (card) => {
  return `2D flat art style, ${card.name.toLowerCase()} character, ${card.description.toLowerCase()}, gloomy dark theme with limited color palette (dark grays, muted purples, dark blues), quirky Gen Z aesthetic, space sci-fi interdimensional background, portrait orientation 400x600px, no 3D effects, flat colors, expressive character design`;
};

console.log('=== AI Image Generation Prompts ===\n');
console.log('Copy these prompts into your AI image generator (DALL-E, Midjourney, Stable Diffusion, etc.)\n');

cards.forEach((card, index) => {
  console.log(`${index + 1}. ${card.name} (${card.rarity})`);
  console.log(`   File: ${card.file}`);
  console.log(`   Prompt: ${basePrompt(card)}\n`);
});

console.log('\n=== Tips ===');
console.log('- Use DALL-E 3, Midjourney, Stable Diffusion, or Leonardo.ai');
console.log('- For Midjourney, add: --style 2d --ar 2:3 --v 6');
console.log('- For Stable Diffusion, use negative prompt: "3D, realistic, photorealistic, bright colors"');
console.log('- Adjust colors to match gloomy theme');
console.log('- Ensure all images are 400x600px portrait orientation');
