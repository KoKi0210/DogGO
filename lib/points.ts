/**
 * Points calculation for walks.
 *
 * Formula from SPEC.md:
 *   base_points = floor(distance_km * 10) + floor(duration_mins * 0.5)
 *   multiplier = 1.0 (default) | 1.5 (if walker adopted this dog via the app)
 *   total_points = floor(base_points * multiplier)
 */

const DISTANCE_MULTIPLIER = 10;
const DURATION_MULTIPLIER = 0.5;
const ADOPTED_DOG_MULTIPLIER = 1.5;
const DEFAULT_MULTIPLIER = 1.0;

// TODO REMOVE OR MAKE LOGIC FOR ADOPTION_BONUS NOT IN THE DB
export const ADOPTION_BONUS = 500;

export function calculateBasePoints(distanceKm: number, durationMins: number): number {
  return Math.floor(distanceKm * DISTANCE_MULTIPLIER) + Math.floor(durationMins * DURATION_MULTIPLIER);
}

export function calculateTotalPoints(
  distanceKm: number,
  durationMins: number,
  isAdoptedDog: boolean
): { basePoints: number; multiplier: number; totalPoints: number } {
  const basePoints = calculateBasePoints(distanceKm, durationMins);
  const multiplier = isAdoptedDog ? ADOPTED_DOG_MULTIPLIER : DEFAULT_MULTIPLIER;
  const totalPoints = Math.floor(basePoints * multiplier);

  return { basePoints, multiplier, totalPoints };
}
