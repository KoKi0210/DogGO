import { DogStatus } from '@/types/database';

/**
 * Maps DogStatus values to their i18n translation keys.
 */
export const STATUS_KEY: Record<DogStatus, string> = {
  walk: 'dogs.statusWalk',
  adoption: 'dogs.statusAdoption',
  both: 'dogs.statusBoth',
  adopted: 'dogs.statusAdopted',
};

/**
 * Returns the appropriate theme color key for a dog status badge.
 */
export function getBadgeColorKey(status: DogStatus): 'accent' | 'primary' | 'secondary' | 'textSecondary' {
  switch (status) {
    case 'walk':
      return 'accent';
    case 'adoption':
      return 'primary';
    case 'both':
      return 'secondary';
    case 'adopted':
      return 'textSecondary';
  }
}

/**
 * Extracts a human-readable message from an unknown error value.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error';
}
