import {
  IMusicAttachment,
  IMusicBrowseResult,
  IMusicProviderTrack,
  IMusicSearchQuery,
  IMusicTrack,
  MusicGenre,
  MusicMood,
  MusicProvider,
} from "./music.interface";
import { MusicTrack } from "./musicTrack.model";
import { MusicAttachment } from "./musicAttachment.model";
import { MusicUserPreference } from "./musicUserPreference.model";
import { getDefaultProvider, getProvider } from "./providers";
import { MUSIC_DURATION_LIMITS, MUSIC_QUERY_LIMITS, MUSIC_VOLUME, MAX_FAVORITE_TRACKS } from "./music.constants";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import mongoose from "mongoose";

class MusicServiceClass {
  /**
   * Search/browse music tracks with caching.
   */
  async searchTracks(query: IMusicSearchQuery): Promise<IMusicBrowseResult> {
    // Validate and sanitize query
    const sanitized = this.sanitizeSearchQuery(query);

    // Determine provider
    const provider = sanitized.provider ? getProvider(sanitized.provider) : getDefaultProvider();

    if (!provider || !provider.isEnabled()) {
      throw new AppError(httpStatus.SERVICE_UNAVAILABLE, "No music providers available");
    }

    try {
      // Fetch from provider
      const result = await provider.searchTracks(sanitized);

      if (result.tracks.length === 0) {
        return {
          tracks: [],
          total: 0,
          hasMore: false,
        };
      }

      // Cache tracks in database and wait for it to complete
      await this.cacheTracks(result.tracks, sanitized.provider || MusicProvider.JAMENDO);

      // Now query the cached tracks from database
      const trackQueries = result.tracks.map((t) => ({
        provider: sanitized.provider || MusicProvider.JAMENDO,
        providerTrackId: t.providerTrackId,
      }));

      const cachedTracks = (await MusicTrack.find({
        $or: trackQueries.map((q) => ({
          provider: q.provider,
          providerTrackId: q.providerTrackId,
        })),
      }).lean()) as unknown as IMusicTrack[];

      // If for some reason tracks weren't cached properly, create temporary track objects
      // that include provider data with a synthetic _id for compatibility
      const trackMap = new Map(cachedTracks.map((t) => [t.providerTrackId, t]));
      const finalTracks: IMusicTrack[] = result.tracks.map((providerTrack) => {
        const cached = trackMap.get(providerTrack.providerTrackId);
        if (cached) return cached;

        // Fallback: create a track-like object from provider data
        return {
          ...providerTrack,
          provider: sanitized.provider || MusicProvider.JAMENDO,
          usageCount: 0,
          popularityScore: 0,
          lastFetched: new Date(),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as unknown as IMusicTrack;
      });

      return {
        tracks: finalTracks,
        total: result.total,
        hasMore: result.hasMore,
      };
    } catch (error) {
      console.error("Music search error:", error);
      throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to search music");
    }
  }

  /**
   * Get trending/popular tracks.
   */
  async getTrendingTracks(limit = 20, provider?: MusicProvider): Promise<IMusicTrack[]> {
    const musicProvider = provider ? getProvider(provider) : getDefaultProvider();

    if (!musicProvider || !musicProvider.isEnabled()) {
      throw new AppError(httpStatus.SERVICE_UNAVAILABLE, "No music providers available");
    }

    try {
      const providerTracks = await musicProvider.getTrendingTracks(limit);

      if (providerTracks.length === 0) {
        return [];
      }

      // Cache tracks in database
      await this.cacheTracks(providerTracks, provider || MusicProvider.JAMENDO);

      // Query the cached tracks from database
      const trackIds = providerTracks.map((t) => ({
        provider: provider || MusicProvider.JAMENDO,
        providerTrackId: t.providerTrackId,
      }));

      const cachedTracks = (await MusicTrack.find({
        $or: trackIds.map((id) => ({
          provider: id.provider,
          providerTrackId: id.providerTrackId,
        })),
      }).lean()) as unknown as IMusicTrack[];

      // If caching failed, create fallback track objects
      const trackMap = new Map(cachedTracks.map((t) => [t.providerTrackId, t]));
      const finalTracks: IMusicTrack[] = providerTracks.map((providerTrack) => {
        const cached = trackMap.get(providerTrack.providerTrackId);
        if (cached) return cached;

        return {
          ...providerTrack,
          provider: provider || MusicProvider.JAMENDO,
          usageCount: 0,
          popularityScore: 0,
          lastFetched: new Date(),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as unknown as IMusicTrack;
      });

      return finalTracks;
    } catch (error) {
      console.error("Get trending tracks error:", error);
      throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to get trending tracks");
    }
  }

  /**
   * Get tracks by genre.
   */
  async getTracksByGenre(genre: MusicGenre, limit = 20, provider?: MusicProvider): Promise<IMusicTrack[]> {
    return this.searchTracks({
      genre,
      limit,
      provider,
    }).then((result) => result.tracks);
  }

  /**
   * Get tracks by mood.
   */
  async getTracksByMood(mood: MusicMood, limit = 20, provider?: MusicProvider): Promise<IMusicTrack[]> {
    return this.searchTracks({
      mood,
      limit,
      provider,
    }).then((result) => result.tracks);
  }

  /**
   * Get a single track by ID.
   */
  async getTrackById(trackId: string): Promise<IMusicTrack> {
    const track = await MusicTrack.findById(trackId);

    if (!track || !track.isActive) {
      throw new AppError(httpStatus.NOT_FOUND, "Track not found");
    }

    return track;
  }

  /**
   * Attach music to content (Post, Story, Short).
   */
  async attachMusicToContent(data: {
    trackId: string;
    contentType: "post" | "story" | "short";
    contentId: string;
    userId: string;
    startTime: number;
    endTime: number;
    volume?: number;
    fadeIn?: boolean;
    fadeOut?: boolean;
  }): Promise<IMusicAttachment> {
    const { trackId, contentType, contentId, userId, startTime, endTime } = data;

    // Validate track exists
    const track = await MusicTrack.findById(trackId);
    if (!track || !track.isActive) {
      throw new AppError(httpStatus.NOT_FOUND, "Track not found");
    }

    // Validate duration constraints
    const segmentDuration = endTime - startTime;
    const limits = MUSIC_DURATION_LIMITS[contentType];

    if (segmentDuration < limits.min || segmentDuration > limits.max) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Music duration must be between ${limits.min} and ${limits.max} seconds for ${contentType}`,
      );
    }

    if (startTime < 0 || endTime > track.duration || startTime >= endTime) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid start/end time for track");
    }

    // Validate volume
    const volume = data.volume ?? MUSIC_VOLUME.DEFAULT;
    if (volume < MUSIC_VOLUME.MIN || volume > MUSIC_VOLUME.MAX) {
      throw new AppError(httpStatus.BAD_REQUEST, `Volume must be between ${MUSIC_VOLUME.MIN} and ${MUSIC_VOLUME.MAX}`);
    }

    // Upsert attachment (one per content)
    const attachment = await MusicAttachment.findOneAndUpdate(
      { contentType, contentId },
      {
        track: track._id,
        startTime,
        endTime,
        volume,
        fadeIn: data.fadeIn ?? false,
        fadeOut: data.fadeOut ?? false,
        user: userId,
      },
      { upsert: true, new: true },
    ).populate("track");

    // Increment track usage count
    await MusicTrack.findByIdAndUpdate(trackId, {
      $inc: { usageCount: 1, popularityScore: 1 },
    });

    // Update user's recently played
    await this.addToRecentlyPlayed(userId, trackId);

    return attachment;
  }

  /**
   * Get music attachment for content.
   */
  async getMusicForContent(contentType: "post" | "story" | "short", contentId: string): Promise<IMusicAttachment | null> {
    const attachment = await MusicAttachment.findOne({
      contentType,
      contentId,
    }).populate("track");

    return attachment;
  }

  /**
   * Remove music from content.
   */
  async removeMusicFromContent(contentType: "post" | "story" | "short", contentId: string, userId: string): Promise<void> {
    const attachment = await MusicAttachment.findOne({
      contentType,
      contentId,
    });

    if (!attachment) {
      throw new AppError(httpStatus.NOT_FOUND, "Music attachment not found");
    }

    // Verify ownership (only content owner can remove music)
    if (attachment.user.toString() !== userId) {
      throw new AppError(httpStatus.FORBIDDEN, "You can only remove music from your own content");
    }

    await MusicAttachment.deleteOne({ _id: attachment._id });
  }

  /**
   * Get user's favorite tracks.
   */
  async getUserFavorites(userId: string): Promise<IMusicTrack[]> {
    const prefs = await MusicUserPreference.findOne({ user: userId }).populate("favoriteTracks");

    if (!prefs) return [];

    return (prefs.favoriteTracks as unknown as IMusicTrack[]) || [];
  }

  /**
   * Add track to user's favorites.
   */
  async addToFavorites(userId: string, trackId: string): Promise<void> {
    const track = await MusicTrack.findById(trackId);
    if (!track || !track.isActive) {
      throw new AppError(httpStatus.NOT_FOUND, "Track not found");
    }

    const prefs = await MusicUserPreference.findOneAndUpdate(
      { user: userId },
      {
        $addToSet: { favoriteTracks: trackId },
      },
      { upsert: true, new: true },
    );

    // Enforce limit
    if (prefs.favoriteTracks.length > MAX_FAVORITE_TRACKS) {
      prefs.favoriteTracks = prefs.favoriteTracks.slice(0, MAX_FAVORITE_TRACKS);
      await prefs.save();
    }
  }

  /**
   * Remove track from user's favorites.
   */
  async removeFromFavorites(userId: string, trackId: string): Promise<void> {
    await MusicUserPreference.findOneAndUpdate(
      { user: userId },
      {
        $pull: { favoriteTracks: trackId },
      },
    );
  }

  /**
   * Get user's recently played tracks.
   */
  async getRecentlyPlayed(userId: string): Promise<IMusicTrack[]> {
    const prefs = await MusicUserPreference.findOne({ user: userId }).populate("recentlyPlayed.track");

    if (!prefs || !prefs.recentlyPlayed) return [];

    // Extract tracks and sort by playedAt (most recent first)
    const tracks = prefs.recentlyPlayed
      .sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime())
      .map((item) => item.track)
      .filter((track) => track) as unknown as IMusicTrack[];

    return tracks;
  }

  /**
   * Add track to user's recently played.
   */
  private async addToRecentlyPlayed(userId: string, trackId: string): Promise<void> {
    const prefs = await MusicUserPreference.findOne({ user: userId });

    if (!prefs) {
      await MusicUserPreference.create({
        user: userId,
        recentlyPlayed: [{ track: trackId, playedAt: new Date() }],
      });
      return;
    }

    // Remove existing entry if present
    prefs.recentlyPlayed = prefs.recentlyPlayed.filter((item) => item.track.toString() !== trackId);

    // Add to front
    prefs.recentlyPlayed.unshift({
      track: new mongoose.Types.ObjectId(trackId) as mongoose.Types.ObjectId,
      playedAt: new Date(),
    });

    await prefs.save();
  }

  /**
   * Cache provider tracks in database.
   */
  private async cacheTracks(providerTracks: IMusicProviderTrack[], provider: MusicProvider): Promise<void> {
    try {
      const bulkOps = providerTracks.map((track) => ({
        updateOne: {
          filter: {
            provider,
            providerTrackId: track.providerTrackId,
          },
          update: {
            $set: {
              title: track.title,
              artist: track.artist,
              album: track.album || null,
              duration: track.duration,
              artworkUrl: track.artworkUrl || null,
              previewUrl: track.previewUrl,
              downloadUrl: track.downloadUrl || null,
              genre: track.genre || null,
              mood: track.mood || null,
              trackLanguage: track.trackLanguage || null,
              license: track.license,
              attributionRequired: track.attributionRequired,
              attributionText: track.attributionText || null,
              commercialUse: track.commercialUse,
              lastFetched: new Date(),
              isActive: true,
            },
            $setOnInsert: {
              provider,
              providerTrackId: track.providerTrackId,
              usageCount: 0,
              popularityScore: 0,
            },
          },
          upsert: true,
        },
      }));

      if (bulkOps.length > 0) {
        await MusicTrack.bulkWrite(bulkOps);
      }
    } catch (error) {
      console.error("Cache tracks error:", error);
      // Don't throw - caching is not critical
    }
  }

  /**
   * Sanitize and validate search query.
   */
  private sanitizeSearchQuery(query: IMusicSearchQuery): IMusicSearchQuery {
    const sanitized: IMusicSearchQuery = {};

    // Limit and offset
    sanitized.limit = Math.min(
      Math.max(query.limit || MUSIC_QUERY_LIMITS.DEFAULT_LIMIT, MUSIC_QUERY_LIMITS.MIN_LIMIT),
      MUSIC_QUERY_LIMITS.MAX_LIMIT,
    );
    sanitized.offset = Math.max(query.offset || 0, 0);

    // Text query
    if (query.query && typeof query.query === "string") {
      sanitized.query = query.query.trim().slice(0, MUSIC_QUERY_LIMITS.MAX_QUERY_LENGTH);
    }

    // Filters
    if (query.genre) sanitized.genre = query.genre;
    if (query.mood) sanitized.mood = query.mood;
    if (query.trackLanguage) sanitized.trackLanguage = query.trackLanguage;
    if (query.minDuration) sanitized.minDuration = Math.max(query.minDuration, 1);
    if (query.maxDuration) sanitized.maxDuration = Math.max(query.maxDuration, 1);
    if (query.provider) sanitized.provider = query.provider;

    return sanitized;
  }
}

export const MusicService = new MusicServiceClass();
