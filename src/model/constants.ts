/**
 * Model constants for the NFL prediction scoring engine
 * These values are based on sports analytics research and can be tuned later
 */

// Weighting factors for different time periods
export const SEASON_WEIGHT = 0.45;  // weight for current season averages
export const LAST3_WEIGHT = 0.30;   // last 3 games (captures form)
export const LAST1_WEIGHT = 0.10;   // last game (captures momentum)
export const HOME_AWAY_WEIGHT = 0.15; // home team uses home splits; away team uses away splits

// Historical season weights (currently disabled)
export const PRIOR_2023_WEIGHT = 0;
export const PRIOR_2022_WEIGHT = 0;

// Adjustment factors
export const DEFENSIVE_POINTS_ADJ_FACTOR = 0.5;
export const FPI_RELATIVE_FACTOR = 0.6;
export const FPI_ADDITIVE_WEIGHT = 0.35;

// Randomness and probability factors
export const RANDOMNESS_RANGE = 0.05; // ±5% multiplicative; seed it for determinism
export const LOGISTIC_K = 0.25; // for win probability on spread
