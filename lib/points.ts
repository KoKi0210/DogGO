const DISTANCE_MULTIPLIER = 10;
const DURATION_MULTIPLIER = 0.5;
const ADOPTED_DOG_MULTIPLIER = 1.5;
const DEFAULT_MULTIPLIER = 1.0;

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
