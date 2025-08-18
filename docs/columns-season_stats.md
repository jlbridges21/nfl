# Season Stats Database Columns

This document provides a comprehensive reference for all columns in the `season_stats` table. Each column represents a specific NFL team statistic, organized by category.

## Core Identifiers

| DB Column Name | Description |
|----------------|-------------|
| id | Unique identifier for the season stats record (UUID) |
| team_id | Foreign key reference to the team (UUID) |
| Year | The NFL season year |

## Offense - Yards per Game

| DB Column Name | Description |
|----------------|-------------|
| Yards_per_Game | Total offensive yards per game for the season |
| Yards_per_Game_(Last_3) | Total offensive yards per game over the last 3 games |
| Yards_per_Game_(Last_1) | Total offensive yards per game for the most recent game |
| Yards_per_Game_(Home) | Total offensive yards per game in home games |
| Yards_per_Game_(Away) | Total offensive yards per game in away games |

## Offense - Points per Game

| DB Column Name | Description |
|----------------|-------------|
| Points_Per_Game | Points scored per game for the season |
| Points_Per_Game_(Last_3) | Points scored per game over the last 3 games |
| Points_Per_Game_(Last_1) | Points scored per game for the most recent game |
| Points_Per_Game_(Home) | Points scored per game in home games |
| Points_Per_Game_(Away) | Points scored per game in away games |

## Offense - Touchdowns per Game

| DB Column Name | Description |
|----------------|-------------|
| Touchdowns_per_Game | Touchdowns scored per game for the season |
| Touchdowns_per_Game_(Last_3) | Touchdowns scored per game over the last 3 games |
| Touchdowns_per_Game_(Last_1) | Touchdowns scored per game for the most recent game |
| Touchdowns_per_Game_(Home) | Touchdowns scored per game in home games |
| Touchdowns_per_Game_(Away) | Touchdowns scored per game in away games |

## Offense - Passing Yards per Game

| DB Column Name | Description |
|----------------|-------------|
| Passing_Yards_Per_Game | Passing yards per game for the season |
| Passing_Yards_Per_Game_(Last_3) | Passing yards per game over the last 3 games |
| Passing_Yards_Per_Game_(Last_1) | Passing yards per game for the most recent game |
| Passing_Yards_Per_Game_(Home) | Passing yards per game in home games |
| Passing_Yards_Per_Game_(Away) | Passing yards per game in away games |

## Offense - Rushing Yards per Game

| DB Column Name | Description |
|----------------|-------------|
| Rushing_Yards_Per_Game_ | Rushing yards per game for the season |
| Rushing_Yards_Per_Game_(Last_3) | Rushing yards per game over the last 3 games |
| Rushing_Yards_Per_Game_(Last_1) | Rushing yards per game for the most recent game |
| Rushing_Yards_Per_Game_(Home) | Rushing yards per game in home games |
| Rushing_Yards_Per_Game_(Away) | Rushing yards per game in away games |

## Offense - Red Zone Scores per Game (TD only)

| DB Column Name | Description |
|----------------|-------------|
| Red_Zone_Scores_Per_Game_(TD_only) | Red zone touchdowns per game for the season |
| Red_Zone_Scores_Per_Game_(TD_only)_(Last_3) | Red zone touchdowns per game over the last 3 games |
| Red_Zone_Scores_Per_Game_(TD_only)_(Last_1) | Red zone touchdowns per game for the most recent game |
| Red_Zone_Scores_Per_Game_(TD_only)_(Home) | Red zone touchdowns per game in home games |
| Red_Zone_Scores_Per_Game_(TD_only)_(Away) | Red zone touchdowns per game in away games |

## Defense - Opponent Yards per Game

| DB Column Name | Description |
|----------------|-------------|
| Opponent_Yards_per_Game | Total yards allowed per game for the season |
| Opponent_Yards_per_Game_(Last_3) | Total yards allowed per game over the last 3 games |
| Opponent_Yards_per_Game_(Last_1) | Total yards allowed per game for the most recent game |
| Opponent_Yards_per_Game_(Home) | Total yards allowed per game in home games |
| Opponent_Yards_per_Game_(Away) | Total yards allowed per game in away games |

## Defense - Opponent Points per Game

| DB Column Name | Description |
|----------------|-------------|
| Opponent_Points_per_Game | Points allowed per game for the season |
| Opponent_Points_per_Game_(Last_3) | Points allowed per game over the last 3 games |
| Opponent_Points_per_Game_(Last_1) | Points allowed per game for the most recent game |
| Opponent_Points_per_Game_(Home) | Points allowed per game in home games |
| Opponent_Points_per_Game_(Away) | Points allowed per game in away games |

## Defense - Opponent Passing Yards per Game

| DB Column Name | Description |
|----------------|-------------|
| Opponent_Passing_Yards_per_Game | Passing yards allowed per game for the season |
| Opponent_Passing_Yards_per_Game_(Last_3) | Passing yards allowed per game over the last 3 games |
| Opponent_Passing_Yards_per_Game_(Last_1) | Passing yards allowed per game for the most recent game |
| Opponent_Passing_Yards_per_Game_(Home) | Passing yards allowed per game in home games |
| Opponent_Passing_Yards_per_Game_(Away) | Passing yards allowed per game in away games |

## Defense - Opponent Rushing Yards per Game

| DB Column Name | Description |
|----------------|-------------|
| Opponent_Rushing_Yards_per_Game | Rushing yards allowed per game for the season |
| Opponent_Rushing_Yards_per_Game_(Last_3) | Rushing yards allowed per game over the last 3 games |
| Opponent_Rushing_Yards_per_Game_(Last_1) | Rushing yards allowed per game for the most recent game |
| Opponent_Rushing_Yards_per_Game_(Home) | Rushing yards allowed per game in home games |
| Opponent_Rushing_Yards_per_Game_(Away) | Rushing yards allowed per game in away games |

## Defense - Opponent Red Zone Scores per Game (TDs only)

| DB Column Name | Description |
|----------------|-------------|
| Opponent_Red_Zone_Scores_per_Game_(TDs_only) | Red zone touchdowns allowed per game for the season |
| Opponent_Red_Zone_Scores_per_Game_(TDs_only)_(Last_3) | Red zone touchdowns allowed per game over the last 3 games |
| Opponent_Red_Zone_Scores_per_Game_(TDs_only)_(Last_1) | Red zone touchdowns allowed per game for the most recent game |
| Opponent_Red_Zone_Scores_per_Game_(TDs_only)_(Home) | Red zone touchdowns allowed per game in home games |
| Opponent_Red_Zone_Scores_per_Game_(TDs_only)_(Away) | Red zone touchdowns allowed per game in away games |

## Efficiency - Average Scoring Margin

| DB Column Name | Description |
|----------------|-------------|
| Average_Scoring_Margin | Average point differential (team points - opponent points) for the season |
| Average_Scoring_Margin_(Last_3) | Average point differential over the last 3 games |
| Average_Scoring_Margin_(Last_1) | Point differential for the most recent game |
| Average_Scoring_Margin_(Home) | Average point differential in home games |
| Average_Scoring_Margin_(Away) | Average point differential in away games |

## Efficiency - Yards per Point

| DB Column Name | Description |
|----------------|-------------|
| Yards_Per_Point | Offensive yards required per point scored for the season |
| Yards_Per_Point_(Last_3) | Offensive yards required per point scored over the last 3 games |
| Yards_Per_Point_(Last_1) | Offensive yards required per point scored for the most recent game |
| Yards_Per_Point_(Home) | Offensive yards required per point scored in home games |
| Yards_Per_Point_(Away) | Offensive yards required per point scored in away games |

## Power Ratings (Optional)

| DB Column Name | Description |
|----------------|-------------|
| fpi | ESPN's Football Power Index overall rating |
| fpi_offense | ESPN's Football Power Index offensive rating |
| fpi_defense | ESPN's Football Power Index defensive rating |

## Notes

- All numeric values may be stored as strings, numbers, or null in the database
- The validation layer automatically coerces these values to numbers with null/undefined defaulting to 0
- Time-based metrics (Last_3, Last_1) provide recent performance trends
- Location-based metrics (Home, Away) capture venue-specific performance
- Power ratings are optional and may not be available for all teams/seasons
