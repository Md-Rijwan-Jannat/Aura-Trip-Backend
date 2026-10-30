import { z } from "zod";
import { MusicGenre, MusicMood, MusicProvider } from "./music.interface";
import { MUSIC_DURATION_LIMITS, MUSIC_QUERY_LIMITS, MUSIC_VOLUME } from "./music.constants";

/**
 * Search/browse music validation.
 */
const searchTracksSchema = z.object({
  query: z
    .object({
      query: z.string().max(MUSIC_QUERY_LIMITS.MAX_QUERY_LENGTH).optional(),
      genre: z.nativeEnum(MusicGenre).optional(),
      mood: z.nativeEnum(MusicMood).optional(),
      language: z.string().max(10).optional(),
      minDuration: z.coerce.number().min(1).optional(),
      maxDuration: z.coerce.number().min(1).optional(),
      provider: z.nativeEnum(MusicProvider).optional(),
      limit: z.coerce.number().min(MUSIC_QUERY_LIMITS.MIN_LIMIT).max(MUSIC_QUERY_LIMITS.MAX_LIMIT).optional(),
      offset: z.coerce.number().min(0).optional(),
    })
    .refine(
      (data) => {
        if (data.minDuration && data.maxDuration) {
          return data.minDuration <= data.maxDuration;
        }
        return true;
      },
      {
        message: "minDuration must be less than or equal to maxDuration",
      },
    ),
});

/**
 * Get trending tracks validation.
 */
const getTrendingTracksSchema = z.object({
  query: z.object({
    limit: z.coerce.number().min(MUSIC_QUERY_LIMITS.MIN_LIMIT).max(MUSIC_QUERY_LIMITS.MAX_LIMIT).optional(),
    provider: z.nativeEnum(MusicProvider).optional(),
  }),
});

/**
 * Get tracks by genre validation.
 */
const getTracksByGenreSchema = z.object({
  params: z.object({
    genre: z.nativeEnum(MusicGenre),
  }),
  query: z.object({
    limit: z.coerce.number().min(MUSIC_QUERY_LIMITS.MIN_LIMIT).max(MUSIC_QUERY_LIMITS.MAX_LIMIT).optional(),
    provider: z.nativeEnum(MusicProvider).optional(),
  }),
});

/**
 * Get tracks by mood validation.
 */
const getTracksByMoodSchema = z.object({
  params: z.object({
    mood: z.nativeEnum(MusicMood),
  }),
  query: z.object({
    limit: z.coerce.number().min(MUSIC_QUERY_LIMITS.MIN_LIMIT).max(MUSIC_QUERY_LIMITS.MAX_LIMIT).optional(),
    provider: z.nativeEnum(MusicProvider).optional(),
  }),
});

/**
 * Attach music to content validation.
 */
const attachMusicSchema = z.object({
  body: z
    .object({
      trackId: z.string().min(1, "Track ID is required"),
      contentType: z.enum(["post", "story", "short"]),
      contentId: z.string().min(1, "Content ID is required"),
      startTime: z.number().min(0),
      endTime: z.number().min(0),
      volume: z.number().min(MUSIC_VOLUME.MIN).max(MUSIC_VOLUME.MAX).optional(),
      fadeIn: z.boolean().optional(),
      fadeOut: z.boolean().optional(),
    })
    .refine((data) => data.startTime < data.endTime, {
      message: "startTime must be less than endTime",
    })
    .refine(
      (data) => {
        const duration = data.endTime - data.startTime;
        const limits = MUSIC_DURATION_LIMITS[data.contentType];
        return duration >= limits.min && duration <= limits.max;
      },
      (data) => {
        const limits = MUSIC_DURATION_LIMITS[data.contentType];
        return {
          message: `Music duration for ${data.contentType} must be between ${limits.min} and ${limits.max} seconds`,
        };
      },
    ),
});

/**
 * Get music for content validation.
 */
const getMusicForContentSchema = z.object({
  params: z.object({
    contentType: z.enum(["post", "story", "short"]),
    contentId: z.string().min(1),
  }),
});

/**
 * Remove music from content validation.
 */
const removeMusicFromContentSchema = z.object({
  params: z.object({
    contentType: z.enum(["post", "story", "short"]),
    contentId: z.string().min(1),
  }),
});

/**
 * Add/remove favorite validation.
 */
const favoriteTrackSchema = z.object({
  params: z.object({
    trackId: z.string().min(1),
  }),
});

export const MusicValidation = {
  searchTracksSchema,
  getTrendingTracksSchema,
  getTracksByGenreSchema,
  getTracksByMoodSchema,
  attachMusicSchema,
  getMusicForContentSchema,
  removeMusicFromContentSchema,
  favoriteTrackSchema,
};
