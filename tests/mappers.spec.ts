import { describe, it, expect, beforeEach } from "vitest";
import { toTeamStats, nullToZero } from "../src/lib/mappers";
import { asSeasonStatsRow } from "../src/lib/validation";
import type { TeamStats } from "../src/types/model";
import fixtureData from "../src/fixtures/seasonStats.example.json";

describe("nullToZero helper", () => {
  it("should convert null to 0", () => {
    expect(nullToZero(null)).toBe(0);
  });

  it("should convert undefined to 0", () => {
    expect(nullToZero(undefined)).toBe(0);
  });

  it("should preserve valid numbers", () => {
    expect(nullToZero(42)).toBe(42);
    expect(nullToZero(0)).toBe(0);
    expect(nullToZero(-5.5)).toBe(-5.5);
  });
});

describe("Zod validation with fixture", () => {
  it("should validate and coerce the fixture data correctly", () => {
    const validatedRow = asSeasonStatsRow(fixtureData);
    
    // Test that string numbers are coerced to numbers
    expect(typeof validatedRow.year).toBe("number");
    expect(validatedRow.year).toBe(2024);
    
    expect(typeof validatedRow.yardsPerGame).toBe("number");
    expect(validatedRow.yardsPerGame).toBe(385.2);
    
    // Test that nulls are coerced to 0
    expect(validatedRow.pointsPerGameLast1).toBe(0);
    expect(validatedRow.touchdownsPerGameHome).toBe(0);
    expect(validatedRow.passingYardsPerGameAway).toBe(0);
    
    // Test that existing numbers are preserved
    expect(validatedRow.pointsPerGame).toBe(28.4);
    expect(validatedRow.touchdownsPerGame).toBe(3.2);
  });
});

describe("toTeamStats mapper", () => {
  let validatedRow: ReturnType<typeof asSeasonStatsRow>;
  let teamStats: TeamStats;

  beforeEach(() => {
    validatedRow = asSeasonStatsRow(fixtureData);
    teamStats = toTeamStats(validatedRow);
  });

  it("should map core identifier correctly", () => {
    expect(teamStats.year).toBe(2024);
  });

  it("should map offensive yards per game correctly", () => {
    expect(teamStats.yardsPerGameSeason).toBe(385.2);
    expect(teamStats.yardsPerGameLast3).toBe(412.7);
    expect(teamStats.yardsPerGameLast1).toBe(445.0);
    expect(teamStats.yardsPerGameHome).toBe(398.5);
    expect(teamStats.yardsPerGameAway).toBe(371.9);
  });

  it("should map offensive points per game correctly", () => {
    expect(teamStats.pointsPerGameSeason).toBe(28.4);
    expect(teamStats.pointsPerGameLast3).toBe(31.7);
    expect(teamStats.pointsPerGameLast1).toBe(0); // was null in fixture
    expect(teamStats.pointsPerGameHome).toBe(30.2);
    expect(teamStats.pointsPerGameAway).toBe(26.6);
  });

  it("should map touchdowns per game correctly", () => {
    expect(teamStats.touchdownsPerGameSeason).toBe(3.2);
  });

  it("should map defensive stats correctly", () => {
    expect(teamStats.defensiveYardsAllowedSeason).toBe(342.7);
    expect(teamStats.defensivePointsAllowedSeason).toBe(22.1);
  });

  it("should map efficiency stats correctly", () => {
    expect(teamStats.yardsPerPointSeason).toBe(13.6);
    expect(teamStats.yardsPerPointLast3).toBe(13.0);
    expect(teamStats.yardsPerPointLast1).toBe(12.8);
    expect(teamStats.yardsPerPointHome).toBe(13.2);
    expect(teamStats.yardsPerPointAway).toBe(0); // was null in fixture
  });

  it("should map power ratings correctly", () => {
    expect(teamStats.fpiOverall).toBe(8.2);
    expect(teamStats.fpiOffense).toBe(12.1);
    expect(teamStats.fpiDefense).toBe(4.3);
  });

  it("should handle null values by converting to 0", () => {
    // Test specific fields that were null in the fixture
    expect(teamStats.pointsPerGameLast1).toBe(0);
    expect(teamStats.yardsPerPointAway).toBe(0);
  });

  it("should handle string numbers correctly", () => {
    // Test specific fields that were strings in the fixture
    expect(teamStats.yardsPerGameSeason).toBe(385.2); // was "385.2"
    expect(teamStats.pointsPerGameLast3).toBe(31.7); // was "31.7"
    expect(teamStats.fpiOverall).toBe(8.2); // was "8.2"
  });

  it("should produce a complete TeamStats object with all required fields", () => {
    const expectedFields = [
      "year",
      "yardsPerGameSeason", "yardsPerGameLast3", "yardsPerGameLast1", "yardsPerGameHome", "yardsPerGameAway",
      "pointsPerGameSeason", "pointsPerGameLast3", "pointsPerGameLast1", "pointsPerGameHome", "pointsPerGameAway",
      "touchdownsPerGameSeason",
      "defensiveYardsAllowedSeason", "defensivePointsAllowedSeason",
      "yardsPerPointSeason", "yardsPerPointLast3", "yardsPerPointLast1", "yardsPerPointHome", "yardsPerPointAway",
      "fpiOverall", "fpiOffense", "fpiDefense"
    ];

    expectedFields.forEach(field => {
      expect(teamStats).toHaveProperty(field);
      expect(typeof teamStats[field as keyof TeamStats]).toBe("number");
    });
  });

  it("should match expected snapshot", () => {
    expect(teamStats).toMatchSnapshot();
  });
});

describe("Field mapping verification", () => {
  it("should correctly map specific database columns to TeamStats fields", () => {
    const validatedRow = asSeasonStatsRow(fixtureData);
    const teamStats = toTeamStats(validatedRow);

    // Verify explicit field mappings as specified in requirements
    expect(teamStats.yardsPerGameSeason).toBe(validatedRow.yardsPerGame);
    expect(teamStats.yardsPerGameLast3).toBe(validatedRow.yardsPerGameLast3);
    expect(teamStats.yardsPerGameLast1).toBe(validatedRow.yardsPerGameLast1);
    expect(teamStats.yardsPerGameHome).toBe(validatedRow.yardsPerGameHome);
    expect(teamStats.yardsPerGameAway).toBe(validatedRow.yardsPerGameAway);

    expect(teamStats.pointsPerGameSeason).toBe(validatedRow.pointsPerGame);
    expect(teamStats.pointsPerGameLast3).toBe(validatedRow.pointsPerGameLast3);
    expect(teamStats.pointsPerGameLast1).toBe(validatedRow.pointsPerGameLast1);
    expect(teamStats.pointsPerGameHome).toBe(validatedRow.pointsPerGameHome);
    expect(teamStats.pointsPerGameAway).toBe(validatedRow.pointsPerGameAway);

    expect(teamStats.touchdownsPerGameSeason).toBe(validatedRow.touchdownsPerGame);
    expect(teamStats.defensiveYardsAllowedSeason).toBe(validatedRow.opponentYardsPerGame);
    expect(teamStats.defensivePointsAllowedSeason).toBe(validatedRow.opponentPointsPerGame);

    expect(teamStats.yardsPerPointSeason).toBe(validatedRow.yardsPerPoint);
    expect(teamStats.yardsPerPointLast3).toBe(validatedRow.yardsPerPointLast3);
    expect(teamStats.yardsPerPointLast1).toBe(validatedRow.yardsPerPointLast1);
    expect(teamStats.yardsPerPointHome).toBe(validatedRow.yardsPerPointHome);
    expect(teamStats.yardsPerPointAway).toBe(validatedRow.yardsPerPointAway);

    expect(teamStats.fpiOverall).toBe(validatedRow.fpi);
    expect(teamStats.fpiOffense).toBe(validatedRow.fpiOffense);
    expect(teamStats.fpiDefense).toBe(validatedRow.fpiDefense);
  });
});
