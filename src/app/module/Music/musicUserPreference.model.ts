import mongoose, { Schema } from "mongoose";
import { IMusicUserPreference, MusicGenre, MusicMood } from "./music.interface";
import { MAX_FAVORITE_TRACKS, MAX_RECENTLY_PLAYED } from "./music.constants";

const musicUserPreferenceSchema = new Schema<IMusicUserPreference>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // Favorites
    favoriteTracks: [
      {
        type: Schema.Types.ObjectId,
        ref: "MusicTrack",
      },
    ],

    // History (most recent first)
    recentlyPlayed: [
      {
        track: {
          type: Schema.Types.ObjectId,
          ref: "MusicTrack",
          required: true,
        },
        playedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Preferences
    preferredGenres: [
      {
        type: String,
        enum: Object.values(MusicGenre),
      },
    ],
    preferredMoods: [
      {
        type: String,
        enum: Object.values(MusicMood),
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Pre-save hook to enforce array limits
musicUserPreferenceSchema.pre("save", function (next) {
  // Limit favorites
  if (this.favoriteTracks.length > MAX_FAVORITE_TRACKS) {
    this.favoriteTracks = this.favoriteTracks.slice(0, MAX_FAVORITE_TRACKS);
  }

  // Limit recently played (keep most recent)
  if (this.recentlyPlayed.length > MAX_RECENTLY_PLAYED) {
    this.recentlyPlayed = this.recentlyPlayed.sort((a, b) => b.playedAt.getTime() - a.playedAt.getTime()).slice(0, MAX_RECENTLY_PLAYED);
  }

  next();
});

export const MusicUserPreference = mongoose.model<IMusicUserPreference>("MusicUserPreference", musicUserPreferenceSchema);
