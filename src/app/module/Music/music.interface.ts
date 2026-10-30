/* eslint-disable no-unused-vars */
import { Document, Types } from "mongoose";

/**
 * Supported music providers with distinct licensing terms.
 * The provider abstraction lets us add new sources without changing application code.
 */
export enum MusicProvider {
  JAMENDO = "JAMENDO", // Royalty-free music with CC licensing
  FREE_MUSIC_ARCHIVE = "FREE_MUSIC_ARCHIVE", // Creative Commons archive
  INTERNAL = "INTERNAL", // User-uploaded or custom tracks
}

/**
 * License types determine what users can do with the track.
 * Always verify with provider terms before use in published content.
 */
export enum MusicLicense {
  CC_BY = "CC_BY", // Attribution required
  CC_BY_SA = "CC_BY_SA", // Attribution + Share-alike
  CC_BY_ND = "CC_BY_ND", // Attribution + No derivatives
  CC_BY_NC = "CC_BY_NC", // Attribution + Non-commercial
  CC0 = "CC0", // Public domain
  ROYALTY_FREE = "ROYALTY_FREE", // Royalty-free with attribution
  CUSTOM = "CUSTOM", // Custom licensing terms
}

/**
 * Moods help users find music matching their content's emotional tone.
 */
export enum MusicMood {
  HAPPY = "HAPPY",
  SAD = "SAD",
  ENERGETIC = "ENERGETIC",
  CALM = "CALM",
  ROMANTIC = "ROMANTIC",
  EPIC = "EPIC",
  DARK = "DARK",
  UPLIFTING = "UPLIFTING",
  CHILL = "CHILL",
  DRAMATIC = "DRAMATIC",
}

/**
 * Music genres for browsing and filtering.
 */
export enum MusicGenre {
  POP = "POP",
  ROCK = "ROCK",
  ELECTRONIC = "ELECTRONIC",
  JAZZ = "JAZZ",
  CLASSICAL = "CLASSICAL",
  HIP_HOP = "HIP_HOP",
  AMBIENT = "AMBIENT",
  FOLK = "FOLK",
  INDIE = "INDIE",
  WORLD = "WORLD",
  ACOUSTIC = "ACOUSTIC",
  INSTRUMENTAL = "INSTRUMENTAL",
}

/**
 * Cached track metadata from external providers.
 * Stores essential info to reduce API calls and provide offline availability.
 */
export interface IMusicTrack extends Document {
  // Provider information
  provider: MusicProvider;
  providerTrackId: string; // Unique ID from the provider's system

  // Track metadata
  title: string;
  artist: string;
  album?: string | null;
  duration: number; // Duration in seconds

  // Media assets
  artworkUrl?: string | null; // Album/track artwork
  previewUrl: string; // Preview/stream URL (validated at runtime)
  downloadUrl?: string | null; // Full track download if permitted

  // Classification
  genre?: MusicGenre | null;
  mood?: MusicMood | null;
  trackLanguage?: string | null; // ISO 639-1 code (e.g., "en", "es")

  // Licensing
  license: MusicLicense;
  attributionRequired: boolean;
  attributionText?: string | null; // Provider-specified attribution
  commercialUse: boolean; // Can this be used in monetized content?

  // Engagement metrics
  usageCount: number; // How many times this track has been selected
  popularityScore: number; // Calculated from provider data + usage

  // Caching
  lastFetched: Date; // When metadata was last updated from provider
  isActive: boolean; // Can this track still be selected?

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Music attachment on content (Post, Story, Short).
 * Stores user's selections: track, segment, volume, etc.
 */
export interface IMusicAttachment extends Document {
  // Reference to cached track metadata
  track: Types.ObjectId; // Reference to IMusicTrack

  // User selections
  startTime: number; // Selected segment start (seconds)
  endTime: number; // Selected segment end (seconds)
  volume: number; // 0.0 to 1.0

  // Attached to content
  contentType: "post" | "story" | "short";
  contentId: Types.ObjectId; // ID of Post, Story, or Short
  user: Types.ObjectId; // User who attached the music

  // Playback state (for Stories/Shorts with video)
  fadeIn: boolean; // Fade in at start
  fadeOut: boolean; // Fade out at end

  createdAt: Date;
  updatedAt: Date;
}

/**
 * User's music preferences and history.
 */
export interface IMusicUserPreference extends Document {
  user: Types.ObjectId;

  // Favorites
  favoriteTracks: Types.ObjectId[]; // IMusicTrack references

  // History
  recentlyPlayed: {
    track: Types.ObjectId;
    playedAt: Date;
  }[];

  // Preferences
  preferredGenres: MusicGenre[];
  preferredMoods: MusicMood[];

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Provider-agnostic search/browse query shape.
 */
export interface IMusicSearchQuery {
  query?: string; // Text search
  genre?: MusicGenre;
  mood?: MusicMood;
  trackLanguage?: string;
  minDuration?: number; // Seconds
  maxDuration?: number; // Seconds
  provider?: MusicProvider;
  limit?: number;
  offset?: number;
}

/**
 * Provider response shape (normalized).
 */
export interface IMusicProviderTrack {
  providerTrackId: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  artworkUrl?: string;
  previewUrl: string;
  downloadUrl?: string;
  genre?: MusicGenre;
  mood?: MusicMood;
  trackLanguage?: string;
  license: MusicLicense;
  attributionRequired: boolean;
  attributionText?: string;
  commercialUse: boolean;
}

/**
 * Response shape for music browse/search endpoints.
 */
export interface IMusicBrowseResult {
  tracks: IMusicTrack[];
  total: number;
  hasMore: boolean;
}
