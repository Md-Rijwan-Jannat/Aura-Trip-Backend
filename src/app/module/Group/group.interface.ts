import { Document, Types } from "mongoose";
import {
  GROUP_ACTIVITY_ACTION,
  GROUP_CATEGORY,
  GROUP_INVITE_STATUS,
  GROUP_JOIN_POLICY,
  GROUP_MEMBERSHIP_STATUS,
  GROUP_MODERATION_STATUS,
  GROUP_POST_PERMISSION,
  GROUP_ROLE,
  GROUP_VISIBILITY,
  SHORT_AUDIENCE,
  SHORT_STATUS,
} from "./group.constants";

export interface IGroup extends Document {
  name: string;
  slug: string;
  description: string;
  purpose?: string | null;
  category: (typeof GROUP_CATEGORY)[number];
  visibility: (typeof GROUP_VISIBILITY)[keyof typeof GROUP_VISIBILITY];
  image?: string | null;
  coverImage?: string | null;
  location?: string | null;
  rules: string[];
  joinPolicy: (typeof GROUP_JOIN_POLICY)[keyof typeof GROUP_JOIN_POLICY];
  postPermission: (typeof GROUP_POST_PERMISSION)[keyof typeof GROUP_POST_PERMISSION];
  postApprovalEnabled: boolean;
  chatEnabled: boolean;
  notifyOnNewPost: boolean;
  owner: Types.ObjectId;
  chat?: Types.ObjectId | null;
  memberCount: number;
  pendingCount: number;
  bannedUsers: Types.ObjectId[];
  mutedUsers: Types.ObjectId[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGroupMembership extends Document {
  group: Types.ObjectId;
  user: Types.ObjectId;
  role: (typeof GROUP_ROLE)[keyof typeof GROUP_ROLE];
  status: (typeof GROUP_MEMBERSHIP_STATUS)[keyof typeof GROUP_MEMBERSHIP_STATUS];
  joinedAt?: Date | null;
  requestedAt?: Date | null;
  reviewedBy?: Types.ObjectId | null;
  reviewedAt?: Date | null;
  bannedBy?: Types.ObjectId | null;
  bannedAt?: Date | null;
  mutedNotifications?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGroupInvite extends Document {
  group: Types.ObjectId;
  tokenHash: string;
  createdBy: Types.ObjectId;
  label?: string | null;
  status: (typeof GROUP_INVITE_STATUS)[keyof typeof GROUP_INVITE_STATUS];
  maxUses?: number | null;
  usedCount: number;
  requiresApproval: boolean;
  expiresAt?: Date | null;
  revokedAt?: Date | null;
  revokedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGroupActivityLog extends Document {
  group: Types.ObjectId;
  actor: Types.ObjectId;
  action: (typeof GROUP_ACTIVITY_ACTION)[keyof typeof GROUP_ACTIVITY_ACTION];
  targetType?: string;
  targetId?: Types.ObjectId;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IShort extends Document {
  user: Types.ObjectId;
  group?: Types.ObjectId | null;
  title?: string | null;
  caption?: string | null;
  video: string;
  coverImage?: string | null;
  duration?: number | null;
  location?: string | null;
  hashtags: string[];
  audience: (typeof SHORT_AUDIENCE)[keyof typeof SHORT_AUDIENCE];
  status: (typeof SHORT_STATUS)[keyof typeof SHORT_STATUS];
  moderationStatus: (typeof GROUP_MODERATION_STATUS)[keyof typeof GROUP_MODERATION_STATUS];
  rejectionReason?: string | null;
  likes: Types.ObjectId[];
  commentCount: number;
  viewCount: number;
  views: Types.ObjectId[];
  reportCount: number;
  featuredCommentId?: Types.ObjectId | null;
  featuredCommentMode?: "AUTOMATIC" | "MANUAL";
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotification extends Document {
  recipient: Types.ObjectId;
  actor?: Types.ObjectId | null;
  type: TNotificationType;
  title: string;
  body?: string | null;
  link?: string | null;
  entityType?: string | null;
  entityId?: Types.ObjectId | null;
  groupId?: Types.ObjectId | null;
  readAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * All notification types in the system. Each type maps to a specific
 * user-facing event and may have associated preferences.
 */
export const NOTIFICATION_TYPE = {
  // Social
  NEW_FOLLOWER: "NEW_FOLLOWER",
  FOLLOW_REQUEST: "FOLLOW_REQUEST",
  FOLLOW_REQUEST_ACCEPTED: "FOLLOW_REQUEST_ACCEPTED",
  MENTION: "MENTION",
  TAG: "TAG",

  // Posts
  POST_LIKE: "POST_LIKE",
  POST_REACTION: "POST_REACTION",
  POST_COMMENT: "POST_COMMENT",
  POST_COMMENT_REPLY: "POST_COMMENT_REPLY",
  POST_COMMENT_REACTION: "POST_COMMENT_REACTION",

  // Shorts
  SHORT_LIKE: "SHORT_LIKE",
  SHORT_REACTION: "SHORT_REACTION",
  SHORT_COMMENT: "SHORT_COMMENT",
  SHORT_COMMENT_REPLY: "SHORT_COMMENT_REPLY",

  // Groups
  GROUP_INVITATION: "GROUP_INVITATION",
  GROUP_JOIN_REQUEST: "GROUP_JOIN_REQUEST",
  GROUP_MEMBERSHIP_APPROVED: "GROUP_MEMBERSHIP_APPROVED",
  GROUP_JOIN_REQUEST_APPROVED: "GROUP_JOIN_REQUEST_APPROVED",
  GROUP_JOIN_REQUEST_REJECTED: "GROUP_JOIN_REQUEST_REJECTED",
  GROUP_POST: "GROUP_POST",
  GROUP_POST_COMMENT: "GROUP_POST_COMMENT",
  GROUP_POST_APPROVED: "GROUP_POST_APPROVED",
  GROUP_POST_REJECTED: "GROUP_POST_REJECTED",
  GROUP_MEMBER_ROLE_CHANGED: "GROUP_MEMBER_ROLE_CHANGED",
  GROUP_MENTION: "GROUP_MENTION",

  // Messages
  NEW_MESSAGE: "NEW_MESSAGE",
  GROUP_MESSAGE: "GROUP_MESSAGE",
  MESSAGE_MENTION: "MESSAGE_MENTION",

  // Security/Account
  SECURITY_ALERT: "SECURITY_ALERT",
  ACCOUNT_UPDATE: "ACCOUNT_UPDATE",
} as const;

export type TNotificationType = (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

/** Categories for notification preferences UI. */
export const NOTIFICATION_CATEGORY = {
  SOCIAL: "SOCIAL",
  POSTS: "POSTS",
  COMMENTS: "COMMENTS",
  MENTIONS: "MENTIONS",
  GROUPS: "GROUPS",
  MESSAGES: "MESSAGES",
  SHORTS: "SHORTS",
  SECURITY: "SECURITY",
} as const;

export type TNotificationCategory = (typeof NOTIFICATION_CATEGORY)[keyof typeof NOTIFICATION_CATEGORY];

/** Maps notification types to their preference category. */
export const NOTIFICATION_TYPE_CATEGORY: Record<TNotificationType, TNotificationCategory> = {
  [NOTIFICATION_TYPE.NEW_FOLLOWER]: NOTIFICATION_CATEGORY.SOCIAL,
  [NOTIFICATION_TYPE.FOLLOW_REQUEST]: NOTIFICATION_CATEGORY.SOCIAL,
  [NOTIFICATION_TYPE.FOLLOW_REQUEST_ACCEPTED]: NOTIFICATION_CATEGORY.SOCIAL,
  [NOTIFICATION_TYPE.MENTION]: NOTIFICATION_CATEGORY.MENTIONS,
  [NOTIFICATION_TYPE.TAG]: NOTIFICATION_CATEGORY.MENTIONS,
  [NOTIFICATION_TYPE.POST_LIKE]: NOTIFICATION_CATEGORY.POSTS,
  [NOTIFICATION_TYPE.POST_REACTION]: NOTIFICATION_CATEGORY.POSTS,
  [NOTIFICATION_TYPE.POST_COMMENT]: NOTIFICATION_CATEGORY.COMMENTS,
  [NOTIFICATION_TYPE.POST_COMMENT_REPLY]: NOTIFICATION_CATEGORY.COMMENTS,
  [NOTIFICATION_TYPE.POST_COMMENT_REACTION]: NOTIFICATION_CATEGORY.COMMENTS,
  [NOTIFICATION_TYPE.SHORT_LIKE]: NOTIFICATION_CATEGORY.SHORTS,
  [NOTIFICATION_TYPE.SHORT_REACTION]: NOTIFICATION_CATEGORY.SHORTS,
  [NOTIFICATION_TYPE.SHORT_COMMENT]: NOTIFICATION_CATEGORY.SHORTS,
  [NOTIFICATION_TYPE.SHORT_COMMENT_REPLY]: NOTIFICATION_CATEGORY.SHORTS,
  [NOTIFICATION_TYPE.GROUP_INVITATION]: NOTIFICATION_CATEGORY.GROUPS,
  [NOTIFICATION_TYPE.GROUP_JOIN_REQUEST]: NOTIFICATION_CATEGORY.GROUPS,
  [NOTIFICATION_TYPE.GROUP_MEMBERSHIP_APPROVED]: NOTIFICATION_CATEGORY.GROUPS,
  [NOTIFICATION_TYPE.GROUP_JOIN_REQUEST_APPROVED]: NOTIFICATION_CATEGORY.GROUPS,
  [NOTIFICATION_TYPE.GROUP_JOIN_REQUEST_REJECTED]: NOTIFICATION_CATEGORY.GROUPS,
  [NOTIFICATION_TYPE.GROUP_POST]: NOTIFICATION_CATEGORY.GROUPS,
  [NOTIFICATION_TYPE.GROUP_POST_COMMENT]: NOTIFICATION_CATEGORY.GROUPS,
  [NOTIFICATION_TYPE.GROUP_POST_APPROVED]: NOTIFICATION_CATEGORY.GROUPS,
  [NOTIFICATION_TYPE.GROUP_POST_REJECTED]: NOTIFICATION_CATEGORY.GROUPS,
  [NOTIFICATION_TYPE.GROUP_MEMBER_ROLE_CHANGED]: NOTIFICATION_CATEGORY.GROUPS,
  [NOTIFICATION_TYPE.GROUP_MENTION]: NOTIFICATION_CATEGORY.GROUPS,
  [NOTIFICATION_TYPE.NEW_MESSAGE]: NOTIFICATION_CATEGORY.MESSAGES,
  [NOTIFICATION_TYPE.GROUP_MESSAGE]: NOTIFICATION_CATEGORY.MESSAGES,
  [NOTIFICATION_TYPE.MESSAGE_MENTION]: NOTIFICATION_CATEGORY.MESSAGES,
  [NOTIFICATION_TYPE.SECURITY_ALERT]: NOTIFICATION_CATEGORY.SECURITY,
  [NOTIFICATION_TYPE.ACCOUNT_UPDATE]: NOTIFICATION_CATEGORY.SECURITY,
};

export type TRequester = { id: string; role: string };
