/* eslint-disable no-unused-vars */
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
  SHORT_POSTED: "SHORT_POSTED",
  SHORT_APPROVED: "SHORT_APPROVED",
  SHORT_REJECTED: "SHORT_REJECTED",
  SHORT_REMOVED: "SHORT_REMOVED",

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

  // Calls
  CALL_INCOMING: "CALL_INCOMING",
  CALL_INCOMING_GROUP: "CALL_INCOMING_GROUP",

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
  [NOTIFICATION_TYPE.SHORT_POSTED]: NOTIFICATION_CATEGORY.SHORTS,
  [NOTIFICATION_TYPE.SHORT_APPROVED]: NOTIFICATION_CATEGORY.SHORTS,
  [NOTIFICATION_TYPE.SHORT_REJECTED]: NOTIFICATION_CATEGORY.SHORTS,
  [NOTIFICATION_TYPE.SHORT_REMOVED]: NOTIFICATION_CATEGORY.SHORTS,
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
  [NOTIFICATION_TYPE.CALL_INCOMING]: NOTIFICATION_CATEGORY.MESSAGES,
  [NOTIFICATION_TYPE.CALL_INCOMING_GROUP]: NOTIFICATION_CATEGORY.MESSAGES,
  [NOTIFICATION_TYPE.SECURITY_ALERT]: NOTIFICATION_CATEGORY.SECURITY,
  [NOTIFICATION_TYPE.ACCOUNT_UPDATE]: NOTIFICATION_CATEGORY.SECURITY,
} as const;

/** Notification title templates for each type (user-facing messages). */
export const NOTIFICATION_TITLES: Record<TNotificationType, (actorName?: string, extra?: string) => string> = {
  [NOTIFICATION_TYPE.NEW_FOLLOWER]: (_actorName = "Someone") => `${_actorName} started following you`,
  [NOTIFICATION_TYPE.FOLLOW_REQUEST]: (_actorName = "Someone") => `${_actorName} sent you a follow request`,
  [NOTIFICATION_TYPE.FOLLOW_REQUEST_ACCEPTED]: (_actorName = "Someone") => `${_actorName} accepted your follow request`,
  [NOTIFICATION_TYPE.MENTION]: (_actorName = "Someone", _extra?: string) => `${_actorName} mentioned you${_extra ? ` in ${_extra}` : ""}`,
  [NOTIFICATION_TYPE.TAG]: (_actorName = "Someone") => `${_actorName} tagged you in a post`,
  [NOTIFICATION_TYPE.POST_LIKE]: (_actorName = "Someone") => `${_actorName} liked your post`,
  [NOTIFICATION_TYPE.POST_REACTION]: (_actorName = "Someone", _extra?: string) =>
    `${_actorName} reacted to your post${_extra ? ` with ${_extra}` : ""}`,
  [NOTIFICATION_TYPE.POST_COMMENT]: (_actorName = "Someone") => `${_actorName} commented on your post`,
  [NOTIFICATION_TYPE.POST_COMMENT_REPLY]: (_actorName = "Someone") => `${_actorName} replied to your comment`,
  [NOTIFICATION_TYPE.POST_COMMENT_REACTION]: (_actorName = "Someone", _extra?: string) =>
    `${_actorName} reacted to your comment${_extra ? ` with ${_extra}` : ""}`,
  [NOTIFICATION_TYPE.SHORT_LIKE]: (_actorName = "Someone") => `${_actorName} liked your short`,
  [NOTIFICATION_TYPE.SHORT_REACTION]: (_actorName = "Someone", _extra?: string) =>
    `${_actorName} reacted to your short${_extra ? ` with ${_extra}` : ""}`,
  [NOTIFICATION_TYPE.SHORT_COMMENT]: (_actorName = "Someone") => `${_actorName} commented on your short`,
  [NOTIFICATION_TYPE.SHORT_COMMENT_REPLY]: (_actorName = "Someone") => `${_actorName} replied to your comment`,
  [NOTIFICATION_TYPE.SHORT_POSTED]: (_actorName = "Someone", _extra?: string) =>
    `${_actorName} posted a short in ${_extra || "your group"}`,
  [NOTIFICATION_TYPE.SHORT_APPROVED]: (_actorName = "Someone") => `${_actorName} approved your short`,
  [NOTIFICATION_TYPE.SHORT_REJECTED]: (_actorName = "Someone", _extra?: string) =>
    `${_actorName} did not approve your short${_extra ? ` in ${_extra}` : ""}`,
  [NOTIFICATION_TYPE.SHORT_REMOVED]: (_actorName = "Someone") => `${_actorName} removed your short`,
  [NOTIFICATION_TYPE.GROUP_INVITATION]: (_actorName = "Someone", _extra?: string) =>
    `${_actorName} invited you to join ${_extra || "a group"}`,
  [NOTIFICATION_TYPE.GROUP_JOIN_REQUEST]: (_actorName = "Someone", _extra?: string) =>
    `${_actorName} requested to join ${_extra || "your group"}`,
  [NOTIFICATION_TYPE.GROUP_MEMBERSHIP_APPROVED]: (_actorName = "Someone", _extra?: string) =>
    `${_actorName} approved your membership in ${_extra || "a group"}`,
  [NOTIFICATION_TYPE.GROUP_JOIN_REQUEST_APPROVED]: (_, _extra?: string) => `Your request to join ${_extra || "a group"} was approved`,
  [NOTIFICATION_TYPE.GROUP_JOIN_REQUEST_REJECTED]: (__, _extra?: string) => `Your request to join ${_extra || "a group"} was rejected`,
  [NOTIFICATION_TYPE.GROUP_POST]: (_actorName = "Someone", _extra?: string) => `${_actorName} posted in ${_extra || "your group"}`,
  [NOTIFICATION_TYPE.GROUP_POST_COMMENT]: (_actorName = "Someone") => `${_actorName} commented on a post in your group`,
  [NOTIFICATION_TYPE.GROUP_POST_APPROVED]: (_?: string, _extra?: string) => `Your post in ${_extra || "a group"} was approved`,
  [NOTIFICATION_TYPE.GROUP_POST_REJECTED]: (__?: string, _extra?: string) => `Your post in ${_extra || "a group"} was rejected`,
  [NOTIFICATION_TYPE.GROUP_MEMBER_ROLE_CHANGED]: (___?: string, _extra?: string) => `Your role in ${_extra || "a group"} was updated`,
  [NOTIFICATION_TYPE.GROUP_MENTION]: (_actorName = "Someone", _extra?: string) =>
    `${_actorName} mentioned you in a group${_extra ? `: ${_extra}` : ""}`,
  [NOTIFICATION_TYPE.NEW_MESSAGE]: (_actorName = "Someone") => `${_actorName} sent you a message`,
  [NOTIFICATION_TYPE.GROUP_MESSAGE]: (_actorName = "Someone", _extra?: string) => `${_actorName} sent a message to ${_extra || "a group"}`,
  [NOTIFICATION_TYPE.MESSAGE_MENTION]: (_actorName = "Someone") => `${_actorName} mentioned you in a message`,
  [NOTIFICATION_TYPE.CALL_INCOMING]: (_actorName = "Someone") => `${_actorName} is calling you`,
  [NOTIFICATION_TYPE.CALL_INCOMING_GROUP]: (_actorName = "Someone", _extra?: string) =>
    `${_actorName} started a group call${_extra ? ` in ${_extra}` : ""}`,
  [NOTIFICATION_TYPE.SECURITY_ALERT]: () => "Security alert",
  [NOTIFICATION_TYPE.ACCOUNT_UPDATE]: () => "Account update",
};
