import mongoose, { Schema } from "mongoose";
import { IMusicTrack, MusicGenre, MusicLicense, MusicMood, MusicProvider } from "./music.interface";

const musicTrackSchema = new Schema<IMusicTrack>(
  {
    // Provider information
    provider: {
      type: String,
      enum: Object.values(MusicProvider),
      required: true,
      index: true,
    },
    providerTrackId: {
      type: String,
      required: true,
      trim: true,
    },

    // Track metadata
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    artist: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    album: {
      type: String,
      default: null,
      trim: true,
      maxlength: 300,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },

    // Media assets
    artworkUrl: {
      type: String,
      default: null,
      trim: true,
      maxlength: 2000,
    },
    previewUrl: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    downloadUrl: {
      type: String,
      default: null,
      trim: true,
      maxlength: 2000,
    },

    // Classification
    genre: {
      type: String,
      enum: [...Object.values(MusicGenre), null],
      default: null,
      index: true,
    },
    mood: {
      type: String,
      enum: [...Object.values(MusicMood), null],
      default: null,
      index: true,
    },
    trackLanguage: {
      type: String,
      default: null,
      trim: true,
      maxlength: 10,
    },

    // Licensing
    license: {
      type: String,
      enum: Object.values(MusicLicense),
      required: true,
    },
    attributionRequired: {
      type: Boolean,
      required: true,
      default: true,
    },
    attributionText: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
    },
    commercialUse: {
      type: Boolean,
      required: true,
      default: false,
    },

    // Engagement metrics
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    popularityScore: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Caching
    lastFetched: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for provider + providerTrackId (unique constraint)
musicTrackSchema.index({ provider: 1, providerTrackId: 1 }, { unique: true });

// Text search index for title, artist, album
musicTrackSchema.index({
  title: "text",
  artist: "text",
  album: "text",
});

// Hot-path indexes for browse/filter
musicTrackSchema.index({ isActive: 1, popularityScore: -1 });
musicTrackSchema.index({ isActive: 1, createdAt: -1 });
musicTrackSchema.index({ genre: 1, isActive: 1, popularityScore: -1 });
musicTrackSchema.index({ mood: 1, isActive: 1, popularityScore: -1 });

export const MusicTrack = mongoose.model<IMusicTrack>("MusicTrack", musicTrackSchema);
