/**
 * Shared layout constants to avoid magic numbers across the app.
 */

/** Top padding to account for status bar + header */
export const HEADER_TOP_PADDING = 60;

/** Standard image picker configuration */
export const IMAGE_PICKER = {
  ASPECT_RATIO: [4, 3] as [number, number],
  QUALITY: 0.8,
  DEFAULT_FILENAME: 'dog.jpg',
};

/** Map configuration */
export const MAP = {
  /** Default location: Sofia, Bulgaria */
  DEFAULT_LATITUDE: 42.6977,
  DEFAULT_LONGITUDE: 23.3219,
  /** Zoomed out delta (city-level view) */
  OVERVIEW_DELTA: 0.05,
  /** Zoomed in delta (neighborhood-level view) */
  DETAIL_DELTA: 0.01,
};

/** Earth radius in kilometers (for Haversine formula) */
export const EARTH_RADIUS_KM = 6371;
