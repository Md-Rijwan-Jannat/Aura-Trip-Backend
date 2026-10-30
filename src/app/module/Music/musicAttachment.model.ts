import mongoose, { Schema } from "mongoose";
import { IMusicAttachment } from "./music.interface";

const musicAttachmentSchema = new Schema<IMusicAttachment>(
  {
    // Reference to cached track metadata
    track: {
      type: Schema.Types.ObjectId,
      ref: "MusicTrack",
      required: true,
      index: true,
    },

    // User selections
    startTime: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    endTime: {
      type: Number,
      required: true,
      min: 0,
    },
    volume: {
      type: Number,
      required: true,
      min: 0.0,
      max: 1.0,
      default: 0.7,
    },

    // Attached to content
    contentType: {
      type: String,
      enum: ["post", "story", "short"],
      required: true,
      index: true,
    },
    contentId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Playback state
    fadeIn: {
      type: Boolean,
      default: false,
    },
    fadeOut: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for content lookups (one music attachment per content)
musicAttachmentSchema.index({ contentType: 1, contentId: 1 }, { unique: true });

// Index for user's music history
musicAttachmentSchema.index({ user: 1, createdAt: -1 });

// Index for track usage analytics
musicAttachmentSchema.index({ track: 1, createdAt: -1 });

export const MusicAttachment = mongoose.model<IMusicAttachment>("MusicAttachment", musicAttachmentSchema);
