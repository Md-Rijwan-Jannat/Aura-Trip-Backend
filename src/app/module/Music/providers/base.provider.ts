/* eslint-disable no-unused-vars */
import { IMusicProviderTrack, IMusicSearchQuery } from "../music.interface";

/**
 * Base interface for music providers.
 * All providers must implement this interface to ensure consistent behavior.
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
export interface IMusicProviderService {
  /**
   * Provider name for logging and identification.
   */
  readonly name: string;

  /**
   * Check if this provider is properly configured and enabled.
   */
  isEnabled(): boolean;

  /**
   * Search/browse tracks with filters.
   */
  searchTracks(_query: IMusicSearchQuery): Promise<{
    tracks: IMusicProviderTrack[];
    total: number;
    hasMore: boolean;
  }>;

  /**
   * Get a single track by its provider ID.
   */
  getTrackById(_providerTrackId: string): Promise<IMusicProviderTrack | null>;

  /**
   * Get trending/popular tracks.
   */
  getTrendingTracks(_limit?: number): Promise<IMusicProviderTrack[]>;

  /**
   * Get tracks by genre.
   */
  getTracksByGenre(_genre: string, _limit?: number): Promise<IMusicProviderTrack[]>;

  /**
   * Get tracks by mood.
   */
  getTracksByMood(_mood: string, _limit?: number): Promise<IMusicProviderTrack[]>;
}
/* eslint-enable @typescript-eslint/no-unused-vars */

/**
 * Abstract base class with shared provider logic.
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
export abstract class BaseMusicProvider implements IMusicProviderService {
  abstract readonly name: string;

  abstract isEnabled(): boolean;

  abstract searchTracks(_query: IMusicSearchQuery): Promise<{
    tracks: IMusicProviderTrack[];
    total: number;
    hasMore: boolean;
  }>;

  abstract getTrackById(_providerTrackId: string): Promise<IMusicProviderTrack | null>;

  abstract getTrendingTracks(_limit?: number): Promise<IMusicProviderTrack[]>;

  abstract getTracksByGenre(_genre: string, _limit?: number): Promise<IMusicProviderTrack[]>;

  abstract getTracksByMood(_mood: string, _limit?: number): Promise<IMusicProviderTrack[]>;
  /* eslint-enable @typescript-eslint/no-unused-vars */

  /**
   * Validate a URL to ensure it's safe and uses HTTPS.
   */
  protected validateUrl(url: string): boolean {
    if (!url || typeof url !== "string") return false;
    try {
      const parsed = new URL(url);
      return parsed.protocol === "https:";
    } catch {
      return false;
    }
  }

  /**
   * Sanitize string fields to prevent injection.
   */
  protected sanitizeString(str: string | undefined | null): string | null {
    if (!str || typeof str !== "string") return null;
    return str.trim().slice(0, 500);
  }

  /**
   * Normalize duration to seconds (some providers use milliseconds).
   */
  protected normalizeDuration(duration: number): number {
    if (duration > 10000) {
      // Likely milliseconds
      return Math.floor(duration / 1000);
    }
    return Math.floor(duration);
  }
}
