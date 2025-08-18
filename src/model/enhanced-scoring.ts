import type { TeamStats } from '@/types/model';
import type { PredictionSettings } from '@/components/predictor/settings-modal';
import { clamp, blend, logistic, randomOffset } from './helpers';

export interface LeagueAvgs {
  leagueAvgDefensiveYardsAllowed: number;
  leagueAvgDefensivePointsAllowed: number;
  leagueAvgYardsPerPoint: number;
}

export interface ContributionsItem {
  key: "offense" | "efficiency" | "defense" | "homeField" | "recentForm" | "fpiEdge";
  value: number;
  direction: "home" | "away";
}

export interface PredictResult {
  homeScore: number;
  awayScore: number;
  total: number;
  spread: number;
  predictedWinner: "Home" | "Away";
  winProbabilityHome: number;
  confidence: number;
  contributions: ContributionsItem[];
  adjustedHomeYards: number;
  adjustedAwayYards: number;
}

/**
 * Enhanced prediction function that uses season_stats data and user-adjustable weights
 */
export function predictGameEnhanced(
  home: TeamStats, 
  away: TeamStats, 
  league: LeagueAvgs, 
  seed: string,
  settings: PredictionSettings
): PredictResult {
  
  // Step 1: Calculate adjusted offensive yards with user-tunable weights
  // Base season weight is adjusted based on recent form setting
  const baseSeasonWeight = 0.50;
  const adjustedLast3Weight = settings.recentForm;
  const adjustedSeasonWeight = baseSeasonWeight + (0.30 - adjustedLast3Weight); // Redistribute weight
  const last1Weight = 0.10;
  const homeAwayWeight = settings.homeFieldAdvantage;

  // Ensure weights sum to 1.0
  const totalWeight = adjustedSeasonWeight + adjustedLast3Weight + last1Weight + homeAwayWeight;
  const normalizedSeasonWeight = adjustedSeasonWeight / totalWeight;
  const normalizedLast3Weight = adjustedLast3Weight / totalWeight;
  const normalizedLast1Weight = last1Weight / totalWeight;
  const normalizedHomeAwayWeight = homeAwayWeight / totalWeight;

  // Home team uses home splits, away team uses away splits
  const homeYardsWeighted = 
    home.yardsPerGameSeason * normalizedSeasonWeight +
    home.yardsPerGameLast3 * normalizedLast3Weight +
    home.yardsPerGameLast1 * normalizedLast1Weight +
    home.yardsPerGameHome * normalizedHomeAwayWeight;

  const awayYardsWeighted = 
    away.yardsPerGameSeason * normalizedSeasonWeight +
    away.yardsPerGameLast3 * normalizedLast3Weight +
    away.yardsPerGameLast1 * normalizedLast1Weight +
    away.yardsPerGameAway * normalizedHomeAwayWeight;

  // Step 2: Apply defensive yard factor (capped within [0.85, 1.15])
  const homeDefensiveYardFactor = clamp(
    away.defensiveYardsAllowedSeason / league.leagueAvgDefensiveYardsAllowed,
    0.85,
    1.15
  );
  
  const awayDefensiveYardFactor = clamp(
    home.defensiveYardsAllowedSeason / league.leagueAvgDefensiveYardsAllowed,
    0.85,
    1.15
  );

  const adjustedHomeYards = homeYardsWeighted * homeDefensiveYardFactor;
  const adjustedAwayYards = awayYardsWeighted * awayDefensiveYardFactor;

  // Step 3: Calculate effective yards per point with blending
  // Home team: blend team YPP (80%) with league average (20%)
  const homeYppBlended = blend(
    home.yardsPerPointSeason * 0.80 + home.yardsPerPointLast3 * 0.15 + home.yardsPerPointLast1 * 0.05,
    league.leagueAvgYardsPerPoint,
    0.20
  );

  // Away team: similar blending
  const awayYppBlended = blend(
    away.yardsPerPointSeason * 0.80 + away.yardsPerPointLast3 * 0.15 + away.yardsPerPointLast1 * 0.05,
    league.leagueAvgYardsPerPoint,
    0.20
  );

  // Cap YPP within reasonable bounds
  const homeEffectiveYPP = clamp(homeYppBlended, 8, 50);
  const awayEffectiveYPP = clamp(awayYppBlended, 8, 50);

  // Step 4: Calculate raw scores from yards and YPP
  let homeScore = adjustedHomeYards / homeEffectiveYPP;
  let awayScore = adjustedAwayYards / awayEffectiveYPP;

  // Step 5: Apply Points Per Game calibration (80% YPP-projected + 20% normalized PPG)
  const homeNormalizedPPG = home.pointsPerGameSeason;
  const awayNormalizedPPG = away.pointsPerGameSeason;
  
  homeScore = homeScore * 0.80 + homeNormalizedPPG * 0.20;
  awayScore = awayScore * 0.80 + awayNormalizedPPG * 0.20;

  // Step 6: Apply Defensive Strength modifier (user-adjustable, capped within [0.9, 1.1])
  const homeDefensiveStrengthFactor = clamp(
    settings.defensiveStrength + (1 - settings.defensiveStrength) * 
    (away.defensivePointsAllowedSeason / league.leagueAvgDefensivePointsAllowed),
    0.9,
    1.1
  );
  
  const awayDefensiveStrengthFactor = clamp(
    settings.defensiveStrength + (1 - settings.defensiveStrength) * 
    (home.defensivePointsAllowedSeason / league.leagueAvgDefensivePointsAllowed),
    0.9,
    1.1
  );

  homeScore *= homeDefensiveStrengthFactor;
  awayScore *= awayDefensiveStrengthFactor;

  // Step 7: Apply FPI Edge (user-adjustable with tight caps)
  // Part A: Offense vs Defense differential
  const homeFpiOffDefDiff = (home.fpiOffense || 0) - (away.fpiDefense || 0);
  const awayFpiOffDefDiff = (away.fpiOffense || 0) - (home.fpiDefense || 0);
  
  const homeFpiOffDefFactor = clamp(
    1 + (settings.fpiEdge * 0.1) * (homeFpiOffDefDiff / 10),
    0.95,
    1.05
  );
  
  const awayFpiOffDefFactor = clamp(
    1 + (settings.fpiEdge * 0.1) * (awayFpiOffDefDiff / 10),
    0.95,
    1.05
  );

  homeScore *= homeFpiOffDefFactor;
  awayScore *= awayFpiOffDefFactor;

  // Part B: Overall FPI delta (small additive nudge)
  const homeFpiOverall = home.fpiOverall || 0;
  const awayFpiOverall = away.fpiOverall || 0;
  
  const fpiAdditive = settings.fpiEdge * 0.2; // Scale down the additive impact
  homeScore += fpiAdditive * homeFpiOverall;
  awayScore += fpiAdditive * awayFpiOverall;

  // Step 8: Apply Home Field Advantage (already incorporated in weights, but add small boost)
  const homeFieldBoost = settings.homeFieldAdvantage * 2.0; // Small additive boost
  homeScore += homeFieldBoost;

  // Step 9: Apply deterministic random offset (keep tiny)
  const homeRandomOffset = randomOffset(seed + home.year.toString()) * 0.02; // Reduced randomness
  const awayRandomOffset = randomOffset(seed + away.year.toString()) * 0.02;

  homeScore *= (1 + homeRandomOffset);
  awayScore *= (1 + awayRandomOffset);

  // Step 10: Clamp scores to realistic ranges
  homeScore = clamp(homeScore, 3, 60);
  awayScore = clamp(awayScore, 3, 60);

  // Step 11: Calculate derived metrics
  const spread = homeScore - awayScore;
  const total = homeScore + awayScore;
  const predictedWinner = homeScore > awayScore ? "Home" : "Away";
  const winProbabilityHome = logistic(0.25 * spread);

  // Step 12: Calculate confidence
  let confidence = 0.50;
  confidence += Math.min(Math.abs(spread) / 20, 0.30); // Add up to 0.30 based on spread
  
  // Subtract 0.1 if either team has missing stats
  const homeHasMissingStats = home.yardsPerGameSeason === 0 || home.pointsPerGameSeason === 0 || home.defensiveYardsAllowedSeason === 0;
  const awayHasMissingStats = away.yardsPerGameSeason === 0 || away.pointsPerGameSeason === 0 || away.defensiveYardsAllowedSeason === 0;
  
  if (homeHasMissingStats || awayHasMissingStats) {
    confidence -= 0.1;
  }
  
  confidence = clamp(confidence, 0, 1);

  // Step 13: Build contributions array
  const contributions: ContributionsItem[] = [];

  // Offense contribution
  const offenseContrib = Math.abs(adjustedHomeYards - adjustedAwayYards) / Math.max(adjustedHomeYards, adjustedAwayYards);
  contributions.push({
    key: "offense",
    value: offenseContrib,
    direction: adjustedHomeYards > adjustedAwayYards ? "home" : "away"
  });

  // Efficiency contribution
  const efficiencyContrib = Math.abs(awayEffectiveYPP - homeEffectiveYPP) / Math.max(homeEffectiveYPP, awayEffectiveYPP) * 0.5;
  contributions.push({
    key: "efficiency",
    value: efficiencyContrib,
    direction: homeEffectiveYPP < awayEffectiveYPP ? "home" : "away" // Lower YPP is better
  });

  // Defense contribution
  const defenseContrib = Math.abs(away.defensivePointsAllowedSeason - home.defensivePointsAllowedSeason) / league.leagueAvgDefensivePointsAllowed;
  contributions.push({
    key: "defense",
    value: defenseContrib * settings.defensiveStrength, // Scale by user setting
    direction: away.defensivePointsAllowedSeason > home.defensivePointsAllowedSeason ? "home" : "away"
  });

  // Home field advantage contribution
  const homeFieldDiff = Math.abs(home.yardsPerGameHome - home.yardsPerGameAway) + Math.abs(away.yardsPerGameAway - away.yardsPerGameHome);
  const homeFieldContrib = (homeFieldDiff / Math.max(home.yardsPerGameSeason, away.yardsPerGameSeason)) * settings.homeFieldAdvantage;
  contributions.push({
    key: "homeField",
    value: homeFieldContrib,
    direction: "home" // Home field always favors home team
  });

  // Recent form contribution
  const recentFormDiff = Math.abs(home.pointsPerGameLast3 - away.pointsPerGameLast3);
  const recentFormContrib = (recentFormDiff / Math.max(home.pointsPerGameLast3, away.pointsPerGameLast3, 1)) * settings.recentForm;
  contributions.push({
    key: "recentForm",
    value: recentFormContrib,
    direction: home.pointsPerGameLast3 > away.pointsPerGameLast3 ? "home" : "away"
  });

  // FPI edge contribution
  const fpiDiff = Math.abs(homeFpiOverall - awayFpiOverall);
  contributions.push({
    key: "fpiEdge",
    value: fpiDiff * settings.fpiEdge,
    direction: homeFpiOverall > awayFpiOverall ? "home" : "away"
  });

  return {
    homeScore: Math.round(homeScore * 10) / 10, // Round to 1 decimal
    awayScore: Math.round(awayScore * 10) / 10,
    total: Math.round(total * 10) / 10,
    spread: Math.round(spread * 10) / 10,
    predictedWinner,
    winProbabilityHome: Math.round(winProbabilityHome * 1000) / 1000, // Round to 3 decimals
    confidence: Math.round(confidence * 100) / 100, // Round to 2 decimals
    contributions,
    adjustedHomeYards: Math.round(adjustedHomeYards * 10) / 10,
    adjustedAwayYards: Math.round(adjustedAwayYards * 10) / 10,
  };
}
