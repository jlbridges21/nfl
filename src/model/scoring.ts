import type { TeamStats } from '@/types/model';
import { 
  SEASON_WEIGHT, 
  LAST3_WEIGHT, 
  LAST1_WEIGHT, 
  HOME_AWAY_WEIGHT,
  DEFENSIVE_POINTS_ADJ_FACTOR,
  FPI_RELATIVE_FACTOR,
  FPI_ADDITIVE_WEIGHT,
  LOGISTIC_K
} from './constants';
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
 * Main prediction function - implements the exact scoring algorithm
 */
export function predictGame(
  home: TeamStats, 
  away: TeamStats, 
  league: LeagueAvgs, 
  seed: string
): PredictResult {
  
  // Step 1: Calculate adjusted offensive yards
  // Home team uses home splits, away team uses away splits
  const homeYardsWeighted = 
    home.yardsPerGameSeason * SEASON_WEIGHT +
    home.yardsPerGameLast3 * LAST3_WEIGHT +
    home.yardsPerGameLast1 * LAST1_WEIGHT +
    home.yardsPerGameHome * HOME_AWAY_WEIGHT;

  const awayYardsWeighted = 
    away.yardsPerGameSeason * SEASON_WEIGHT +
    away.yardsPerGameLast3 * LAST3_WEIGHT +
    away.yardsPerGameLast1 * LAST1_WEIGHT +
    away.yardsPerGameAway * HOME_AWAY_WEIGHT;

  // Adjust for opponent defensive strength
  const adjustedHomeYards = homeYardsWeighted * (away.defensiveYardsAllowedSeason / league.leagueAvgDefensiveYardsAllowed);
  const adjustedAwayYards = awayYardsWeighted * (home.defensiveYardsAllowedSeason / league.leagueAvgDefensiveYardsAllowed);

  // Step 2: Calculate effective yards per point
  // Home team: 90% season, blend last3/last1 for 10%, then blend with league average
  const homeYppBase = blend(
    home.yardsPerPointSeason * 0.9 + home.yardsPerPointLast3 * 0.08 + home.yardsPerPointLast1 * 0.02,
    league.leagueAvgYardsPerPoint,
    0.2
  );

  // Away team: different weighting as specified
  const awayYppBase = blend(
    away.yardsPerPointSeason * 0.8 + away.yardsPerPointLast3 * 0.15 + away.yardsPerPointLast1 * 0.05,
    league.leagueAvgYardsPerPoint,
    0.2
  );

  const homeEffectiveYPP = Math.max(homeYppBase, 1); // Prevent division by zero
  const awayEffectiveYPP = Math.max(awayYppBase, 1);

  // Step 3: Calculate raw scores
  let homeScore = adjustedHomeYards / homeEffectiveYPP;
  let awayScore = adjustedAwayYards / awayEffectiveYPP;

  // Step 4: Apply defensive points adjustment
  const homeDefAdj = DEFENSIVE_POINTS_ADJ_FACTOR + 
    (1 - DEFENSIVE_POINTS_ADJ_FACTOR) * (away.defensivePointsAllowedSeason / league.leagueAvgDefensivePointsAllowed);
  const awayDefAdj = DEFENSIVE_POINTS_ADJ_FACTOR + 
    (1 - DEFENSIVE_POINTS_ADJ_FACTOR) * (home.defensivePointsAllowedSeason / league.leagueAvgDefensivePointsAllowed);

  homeScore *= homeDefAdj;
  awayScore *= awayDefAdj;

  // Step 5: Apply FPI adjustments
  // Relative FPI adjustment
  const homeFpiRelative = 1 + FPI_RELATIVE_FACTOR * ((home.fpiOffense - away.fpiDefense) / 10);
  const awayFpiRelative = 1 + FPI_RELATIVE_FACTOR * ((away.fpiOffense - home.fpiDefense) / 10);

  homeScore *= homeFpiRelative;
  awayScore *= awayFpiRelative;

  // Additive FPI adjustment
  homeScore += FPI_ADDITIVE_WEIGHT * home.fpiOverall;
  awayScore += FPI_ADDITIVE_WEIGHT * away.fpiOverall;

  // Step 6: Apply deterministic random offset
  const homeRandomOffset = randomOffset(seed + home.year.toString());
  const awayRandomOffset = randomOffset(seed + away.year.toString());

  homeScore *= (1 + homeRandomOffset);
  awayScore *= (1 + awayRandomOffset);

  // Step 7: Clamp scores to be non-negative
  homeScore = clamp(homeScore, 0);
  awayScore = clamp(awayScore, 0);

  // Step 8: Calculate derived metrics
  const spread = homeScore - awayScore;
  const total = homeScore + awayScore;
  const predictedWinner = homeScore > awayScore ? "Home" : "Away";
  const winProbabilityHome = logistic(LOGISTIC_K * spread);

  // Step 9: Calculate confidence
  let confidence = 0.50;
  confidence += Math.min(Math.abs(spread) / 20, 0.30); // Add up to 0.30 based on spread
  
  // Subtract 0.1 if either team has missing stats (check for zeros that indicate missing data)
  const homeHasMissingStats = home.yardsPerGameSeason === 0 || home.pointsPerGameSeason === 0 || home.defensiveYardsAllowedSeason === 0;
  const awayHasMissingStats = away.yardsPerGameSeason === 0 || away.pointsPerGameSeason === 0 || away.defensiveYardsAllowedSeason === 0;
  
  if (homeHasMissingStats || awayHasMissingStats) {
    confidence -= 0.1;
  }
  
  confidence = clamp(confidence, 0, 1);

  // Step 10: Build contributions array
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
    value: defenseContrib,
    direction: away.defensivePointsAllowedSeason > home.defensivePointsAllowedSeason ? "home" : "away"
  });

  // Home field advantage contribution
  const homeFieldDiff = Math.abs(home.yardsPerGameHome - home.yardsPerGameAway) + Math.abs(away.yardsPerGameAway - away.yardsPerGameHome);
  const homeFieldContrib = (homeFieldDiff / Math.max(home.yardsPerGameSeason, away.yardsPerGameSeason)) * HOME_AWAY_WEIGHT;
  contributions.push({
    key: "homeField",
    value: homeFieldContrib,
    direction: "home" // Home field always favors home team
  });

  // Recent form contribution
  const recentFormDiff = Math.abs(home.pointsPerGameLast3 - away.pointsPerGameLast3);
  const recentFormContrib = recentFormDiff / Math.max(home.pointsPerGameLast3, away.pointsPerGameLast3, 1);
  contributions.push({
    key: "recentForm",
    value: recentFormContrib,
    direction: home.pointsPerGameLast3 > away.pointsPerGameLast3 ? "home" : "away"
  });

  // FPI edge contribution
  const fpiDiff = Math.abs(home.fpiOverall - away.fpiOverall);
  contributions.push({
    key: "fpiEdge",
    value: fpiDiff,
    direction: home.fpiOverall > away.fpiOverall ? "home" : "away"
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
