import { Schema, model } from "mongoose";
import { NOTIFICATION_CATEGORY } from "./notification.types";

export interface INotificationPreferences extends Document {
  user: Schema.Types.ObjectId;
  // Per-category enabled/disabled flags (true = enabled/notifications will be sent)
  categories: {
    [key in (typeof NOTIFICATION_CATEGORY)[keyof typeof NOTIFICATION_CATEGORY]]?: boolean;
  };
  // Security notifications are always enabled and cannot be disabled
  createdAt: Date;
  updatedAt: Date;
}

const notificationPreferencesSchema = new Schema<INotificationPreferences>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    categories: {
      type: Map,
      of: Boolean,
      default: {},
    },
  },
  { timestamps: true },
);

// Initialize defaults: all categories enabled except security (which is always on)
notificationPreferencesSchema.pre("save", function (next) {
  if (this.isNew) {
    const defaults = {
      [NOTIFICATION_CATEGORY.SOCIAL]: true,
      [NOTIFICATION_CATEGORY.POSTS]: true,
      [NOTIFICATION_CATEGORY.COMMENTS]: true,
      [NOTIFICATION_CATEGORY.MENTIONS]: true,
      [NOTIFICATION_CATEGORY.GROUPS]: true,
      [NOTIFICATION_CATEGORY.MESSAGES]: true,
      [NOTIFICATION_CATEGORY.SHORTS]: true,
      // Security is controlled separately, not via preferences
    };
    for (const [key, value] of Object.entries(defaults)) {
      if (!this.categories.has(key)) {
        this.categories.set(key, value);
      }
    }
  }
  next();
});

export const NotificationPreferences = model<INotificationPreferences>("NotificationPreferences", notificationPreferencesSchema);
