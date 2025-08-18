import { RANDOMNESS_RANGE } from './constants';

/**
 * Clamps a number between min and max values
 */
export function clamp(n: number, min = 0, max = Infinity): number {
  return Math.min(Math.max(n, min), max);
}

/**
 * Blends two numbers using a weight factor
 * @param a First number
 * @param b Second number  
 * @param weight Weight for second number (0-1)
 */
export function blend(a: number, b: number, weight: number): number {
  return a * (1 - weight) + b * weight;
}

/**
 * Logistic function: 1/(1+exp(-x))
 */
export function logistic(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

/**
 * Simple mulberry32 PRNG for deterministic randomness
 * Based on seed string, returns a function that generates numbers in [0,1)
 */
function mulberry32(seed: number) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Converts string to a numeric seed
 */
function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Generates a deterministic pseudo-random offset in range ±(RANDOMNESS_RANGE/2)
 * Seeded by a combined string of home + away IDs
 */
export function randomOffset(seed: string): number {
  const numericSeed = stringToSeed(seed);
  const rng = mulberry32(numericSeed);
  
  // Generate random number in [0,1) then map to [-RANDOMNESS_RANGE/2, RANDOMNESS_RANGE/2]
  const random = rng();
  return (random - 0.5) * RANDOMNESS_RANGE;
}
