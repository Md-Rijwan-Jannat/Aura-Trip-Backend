import express from "express";
import { MusicController } from "./music.controller";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { MusicValidation } from "./music.validation";

const router = express.Router();

/**
 * Public routes - Browse and discover music
 */

// Search/browse music tracks
router.get("/search", MusicController.searchTracks);

// Get trending tracks
router.get("/trending", MusicController.getTrendingTracks);

// Get tracks by genre
router.get("/genre/:genre", validateRequest(MusicValidation.getTracksByGenreSchema), MusicController.getTracksByGenre);

// Get tracks by mood
router.get("/mood/:mood", validateRequest(MusicValidation.getTracksByMoodSchema), MusicController.getTracksByMood);

// Get a single track by ID
router.get("/tracks/:id", MusicController.getTrackById);

/**
 * Protected routes - Attach music and manage favorites
 */

// Attach music to content (Post, Story, Short)
router.post("/attach", auth(), validateRequest(MusicValidation.attachMusicSchema), MusicController.attachMusic);

// Get music for content
router.get(
  "/content/:contentType/:contentId",
  validateRequest(MusicValidation.getMusicForContentSchema),
  MusicController.getMusicForContent,
);

// Remove music from content
router.delete(
  "/content/:contentType/:contentId",
  auth(),
  validateRequest(MusicValidation.removeMusicFromContentSchema),
  MusicController.removeMusicFromContent,
);

// Get user's favorite tracks
router.get("/favorites", auth(), MusicController.getUserFavorites);

// Add track to favorites
router.post("/favorites/:trackId", auth(), validateRequest(MusicValidation.favoriteTrackSchema), MusicController.addToFavorites);

// Remove track from favorites
router.delete("/favorites/:trackId", auth(), validateRequest(MusicValidation.favoriteTrackSchema), MusicController.removeFromFavorites);

// Get user's recently played tracks
router.get("/recently-played", auth(), MusicController.getRecentlyPlayed);

export const MusicRoutes = router;
