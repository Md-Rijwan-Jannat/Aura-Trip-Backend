import { IMusicProviderTrack, IMusicSearchQuery, MusicGenre, MusicLicense, MusicMood, MusicProvider } from "../music.interface";
import { BaseMusicProvider } from "./base.provider";
import { MusicTrack } from "../musicTrack.model";

/**
 * Internal music library provider.
 * Serves tracks from our database (user-uploaded or manually curated).
 *
 * This provider queries the MusicTrack collection for tracks marked with
 * MusicProvider.INTERNAL. Use this for custom music libraries or
 * user-uploaded content (with proper licensing verification).
 */
export class InternalProvider extends BaseMusicProvider {
  readonly name = "Internal Library";

  isEnabled(): boolean {
    return true; // Always enabled
  }

  async searchTracks(query: IMusicSearchQuery): Promise<{
    tracks: IMusicProviderTrack[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const limit = query.limit || 20;
      const offset = query.offset || 0;

      // Build query
      const filter: Record<string, unknown> = {
        provider: MusicProvider.INTERNAL,
        isActive: true,
      };

      if (query.query) {
        filter.$text = { $search: query.query };
      }

      if (query.genre) {
        filter.genre = query.genre;
      }

      if (query.mood) {
        filter.mood = query.mood;
      }

      if (query.trackLanguage) {
        filter.trackLanguage = query.trackLanguage;
      }

      if (query.minDuration) {
        filter.duration = { ...(filter.duration as Record<string, unknown>), $gte: query.minDuration };
      }

      if (query.maxDuration) {
        filter.duration = { ...(filter.duration as Record<string, unknown>), $lte: query.maxDuration };
      }

      // Execute query
      const [tracks, total] = await Promise.all([
        MusicTrack.find(filter).sort({ popularityScore: -1, createdAt: -1 }).skip(offset).limit(limit).lean(),
        MusicTrack.countDocuments(filter),
      ]);

      const normalizedTracks = tracks
        .map((track) => this.normalizeTrack(track))
        .filter((track): track is IMusicProviderTrack => track !== null);

      const hasMore = offset + normalizedTracks.length < total;

      return {
        tracks: normalizedTracks,
        total,
        hasMore,
      };
    } catch (error) {
      console.error("Internal provider searchTracks error:", error);
      return { tracks: [], total: 0, hasMore: false };
    }
  }

  async getTrackById(providerTrackId: string): Promise<IMusicProviderTrack | null> {
    try {
      const track = await MusicTrack.findOne({
        provider: MusicProvider.INTERNAL,
        providerTrackId,
        isActive: true,
      }).lean();

      if (!track) return null;

      return this.normalizeTrack(track);
    } catch (error) {
      console.error(`Internal provider getTrackById error (${providerTrackId}):`, error);
      return null;
    }
  }

  async getTrendingTracks(limit = 20): Promise<IMusicProviderTrack[]> {
    try {
      const tracks = await MusicTrack.find({
        provider: MusicProvider.INTERNAL,
        isActive: true,
      })
        .sort({ popularityScore: -1, usageCount: -1 })
        .limit(limit)
        .lean();

      return tracks.map((track) => this.normalizeTrack(track)).filter((track): track is IMusicProviderTrack => track !== null);
    } catch (error) {
      console.error("Internal provider getTrendingTracks error:", error);
      return [];
    }
  }

  async getTracksByGenre(genre: string, limit = 20): Promise<IMusicProviderTrack[]> {
    return (
      await this.searchTracks({
        genre: genre as MusicGenre,
        limit,
      })
    ).tracks;
  }

  async getTracksByMood(mood: string, limit = 20): Promise<IMusicProviderTrack[]> {
    return (
      await this.searchTracks({
        mood: mood as MusicMood,
        limit,
      })
    ).tracks;
  }

  /**
   * Normalize database track to provider interface.
   */
  private normalizeTrack(track: Record<string, unknown>): IMusicProviderTrack | null {
    try {
      if (!track.providerTrackId || !track.title || !track.artist) {
        return null;
      }

      return {
        providerTrackId: String(track.providerTrackId),
        title: String(track.title),
        artist: String(track.artist),
        album: track.album ? String(track.album) : undefined,
        duration: Number(track.duration),
        artworkUrl: track.artworkUrl ? String(track.artworkUrl) : undefined,
        previewUrl: String(track.previewUrl),
        downloadUrl: track.downloadUrl ? String(track.downloadUrl) : undefined,
        genre: track.genre as MusicGenre | undefined,
        mood: track.mood as MusicMood | undefined,
        trackLanguage: track.trackLanguage ? String(track.trackLanguage) : undefined,
        license: track.license as MusicLicense,
        attributionRequired: Boolean(track.attributionRequired),
        attributionText: track.attributionText ? String(track.attributionText) : undefined,
        commercialUse: Boolean(track.commercialUse),
      };
    } catch (error) {
      console.error("Internal provider normalizeTrack error:", error);
      return null;
    }
  }
}
