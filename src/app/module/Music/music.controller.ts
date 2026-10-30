import { MusicService } from "./music.service";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";
import httpStatus from "http-status";
import { MusicGenre, MusicMood, MusicProvider } from "./music.interface";

/**
 * Search/browse music tracks.
 */
const searchTracks = catchAsync(async (req, res) => {
  // Parse and validate query parameters
  const query = {
    query: req.query.query as string | undefined,
    genre: req.query.genre as MusicGenre | undefined,
    mood: req.query.mood as MusicMood | undefined,
    trackLanguage: req.query.trackLanguage as string | undefined,
    minDuration: req.query.minDuration ? Number(req.query.minDuration) : undefined,
    maxDuration: req.query.maxDuration ? Number(req.query.maxDuration) : undefined,
    provider: req.query.provider as MusicProvider | undefined,
    limit: req.query.limit ? Number(req.query.limit) : 20,
    offset: req.query.offset ? Number(req.query.offset) : 0,
  };

  const result = await MusicService.searchTracks(query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Music tracks retrieved successfully",
    data: result.tracks,
    meta: {
      total: result.total,
      hasMore: result.hasMore,
      limit: query.limit,
      offset: query.offset,
    },
  });
});

/**
 * Get trending/popular tracks.
 */
const getTrendingTracks = catchAsync(async (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  const provider = req.query.provider as MusicProvider | undefined;

  const tracks = await MusicService.getTrendingTracks(limit, provider);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Trending tracks retrieved successfully",
    data: tracks,
  });
});

/**
 * Get tracks by genre.
 */
const getTracksByGenre = catchAsync(async (req, res) => {
  const { genre } = req.params;
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  const provider = req.query.provider as MusicProvider | undefined;

  const tracks = await MusicService.getTracksByGenre(genre as MusicGenre, limit, provider);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `${genre} tracks retrieved successfully`,
    data: tracks,
  });
});

/**
 * Get tracks by mood.
 */
const getTracksByMood = catchAsync(async (req, res) => {
  const { mood } = req.params;
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  const provider = req.query.provider as MusicProvider | undefined;

  const tracks = await MusicService.getTracksByMood(mood as MusicMood, limit, provider);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `${mood} tracks retrieved successfully`,
    data: tracks,
  });
});

/**
 * Get a single track by ID.
 */
const getTrackById = catchAsync(async (req, res) => {
  const track = await MusicService.getTrackById(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Track retrieved successfully",
    data: track,
  });
});

/**
 * Attach music to content (Post, Story, Short).
 */
const attachMusic = catchAsync(async (req, res) => {
  const attachment = await MusicService.attachMusicToContent({
    ...req.body,
    userId: req.user.id,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Music attached successfully",
    data: attachment,
  });
});

/**
 * Get music for content.
 */
const getMusicForContent = catchAsync(async (req, res) => {
  const { contentType, contentId } = req.params;

  const attachment = await MusicService.getMusicForContent(contentType as "post" | "story" | "short", contentId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: attachment ? "Music attachment retrieved successfully" : "No music attached to this content",
    data: attachment,
  });
});

/**
 * Remove music from content.
 */
const removeMusicFromContent = catchAsync(async (req, res) => {
  const { contentType, contentId } = req.params;

  await MusicService.removeMusicFromContent(contentType as "post" | "story" | "short", contentId, req.user.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Music removed successfully",
    data: null,
  });
});

/**
 * Get user's favorite tracks.
 */
const getUserFavorites = catchAsync(async (req, res) => {
  const tracks = await MusicService.getUserFavorites(req.user.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Favorite tracks retrieved successfully",
    data: tracks,
  });
});

/**
 * Add track to favorites.
 */
const addToFavorites = catchAsync(async (req, res) => {
  await MusicService.addToFavorites(req.user.id, req.params.trackId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Track added to favorites",
    data: null,
  });
});

/**
 * Remove track from favorites.
 */
const removeFromFavorites = catchAsync(async (req, res) => {
  await MusicService.removeFromFavorites(req.user.id, req.params.trackId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Track removed from favorites",
    data: null,
  });
});

/**
 * Get user's recently played tracks.
 */
const getRecentlyPlayed = catchAsync(async (req, res) => {
  const tracks = await MusicService.getRecentlyPlayed(req.user.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Recently played tracks retrieved successfully",
    data: tracks,
  });
});

export const MusicController = {
  searchTracks,
  getTrendingTracks,
  getTracksByGenre,
  getTracksByMood,
  getTrackById,
  attachMusic,
  getMusicForContent,
  removeMusicFromContent,
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  getRecentlyPlayed,
};
