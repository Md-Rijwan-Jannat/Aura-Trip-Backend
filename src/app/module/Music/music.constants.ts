import { MusicGenre, MusicLicense, MusicMood, MusicProvider } from "./music.interface";

/**
 * Provider configuration and API credentials.
 * Secrets MUST be stored server-side only, never exposed to frontend.
 */
export const MUSIC_PROVIDER_CONFIG = {
  [MusicProvider.JAMENDO]: {
    name: "Jamendo",
    apiUrl: "https://api.jamendo.com/v3.0",
    clientId: process.env.JAMENDO_CLIENT_ID || "",
    enabled: Boolean(process.env.JAMENDO_CLIENT_ID),
    rateLimit: {
      requestsPerMinute: 60,
      requestsPerDay: 10000,
    },
  },
  [MusicProvider.FREE_MUSIC_ARCHIVE]: {
    name: "Free Music Archive",
    apiUrl: "https://freemusicarchive.org/api/v1",
    apiKey: process.env.FMA_API_KEY || "",
    enabled: Boolean(process.env.FMA_API_KEY),
    rateLimit: {
      requestsPerMinute: 120,
      requestsPerDay: 20000,
    },
  },
  [MusicProvider.INTERNAL]: {
    name: "Internal Library",
    enabled: true,
  },
} as const;

/**
 * Content type limits for music duration.
 * Stories and Shorts have strict duration constraints.
 */
export const MUSIC_DURATION_LIMITS = {
  post: {
    min: 1, // 1 second
    max: 600, // 10 minutes
  },
  story: {
    min: 1,
    max: 15, // Stories are 15 seconds max
  },
  short: {
    min: 1,
    max: 60, // Shorts are 60 seconds max
  },
} as const;

/**
 * Volume constraints.
 */
export const MUSIC_VOLUME = {
  MIN: 0.0,
  MAX: 1.0,
  DEFAULT: 0.7,
} as const;

/**
 * Search and pagination limits.
 */
export const MUSIC_QUERY_LIMITS = {
  MIN_LIMIT: 1,
  MAX_LIMIT: 50,
  DEFAULT_LIMIT: 20,
  MAX_QUERY_LENGTH: 200,
} as const;

/**
 * Cache TTL for provider data (seconds).
 */
export const MUSIC_CACHE_TTL = {
  TRACK_METADATA: 7 * 24 * 60 * 60, // 7 days
  SEARCH_RESULTS: 1 * 60 * 60, // 1 hour
  TRENDING: 6 * 60 * 60, // 6 hours
} as const;

/**
 * Recently played history limit per user.
 */
export const MAX_RECENTLY_PLAYED = 50;

/**
 * Maximum favorites per user.
 */
export const MAX_FAVORITE_TRACKS = 500;

/**
 * Genre display labels.
 */
export const GENRE_LABELS: Record<MusicGenre, string> = {
  [MusicGenre.POP]: "Pop",
  [MusicGenre.ROCK]: "Rock",
  [MusicGenre.ELECTRONIC]: "Electronic",
  [MusicGenre.JAZZ]: "Jazz",
  [MusicGenre.CLASSICAL]: "Classical",
  [MusicGenre.HIP_HOP]: "Hip Hop",
  [MusicGenre.AMBIENT]: "Ambient",
  [MusicGenre.FOLK]: "Folk",
  [MusicGenre.INDIE]: "Indie",
  [MusicGenre.WORLD]: "World",
  [MusicGenre.ACOUSTIC]: "Acoustic",
  [MusicGenre.INSTRUMENTAL]: "Instrumental",
};

/**
 * Mood display labels.
 */
export const MOOD_LABELS: Record<MusicMood, string> = {
  [MusicMood.HAPPY]: "Happy",
  [MusicMood.SAD]: "Sad",
  [MusicMood.ENERGETIC]: "Energetic",
  [MusicMood.CALM]: "Calm",
  [MusicMood.ROMANTIC]: "Romantic",
  [MusicMood.EPIC]: "Epic",
  [MusicMood.DARK]: "Dark",
  [MusicMood.UPLIFTING]: "Uplifting",
  [MusicMood.CHILL]: "Chill",
  [MusicMood.DRAMATIC]: "Dramatic",
};

/**
 * License display information with usage restrictions.
 */
export const LICENSE_INFO: Record<
  MusicLicense,
  {
    label: string;
    description: string;
    requiresAttribution: boolean;
    allowsCommercial: boolean;
  }
> = {
  [MusicLicense.CC_BY]: {
    label: "CC BY",
    description: "Free to use with attribution",
    requiresAttribution: true,
    allowsCommercial: true,
  },
  [MusicLicense.CC_BY_SA]: {
    label: "CC BY-SA",
    description: "Free to use with attribution, share-alike",
    requiresAttribution: true,
    allowsCommercial: true,
  },
  [MusicLicense.CC_BY_ND]: {
    label: "CC BY-ND",
    description: "Free to use with attribution, no derivatives",
    requiresAttribution: true,
    allowsCommercial: true,
  },
  [MusicLicense.CC_BY_NC]: {
    label: "CC BY-NC",
    description: "Free for non-commercial use with attribution",
    requiresAttribution: true,
    allowsCommercial: false,
  },
  [MusicLicense.CC0]: {
    label: "CC0",
    description: "Public domain, no restrictions",
    requiresAttribution: false,
    allowsCommercial: true,
  },
  [MusicLicense.ROYALTY_FREE]: {
    label: "Royalty Free",
    description: "Free to use with attribution",
    requiresAttribution: true,
    allowsCommercial: true,
  },
  [MusicLicense.CUSTOM]: {
    label: "Custom License",
    description: "Check specific terms",
    requiresAttribution: true,
    allowsCommercial: false,
  },
};

/**
 * Searchable fields for track queries.
 */
export const MUSIC_SEARCH_FIELDS = ["title", "artist", "album"];

/**
 * Provider priority order (try in this order when fetching).
 */
export const PROVIDER_PRIORITY = [MusicProvider.JAMENDO, MusicProvider.FREE_MUSIC_ARCHIVE, MusicProvider.INTERNAL] as const;
