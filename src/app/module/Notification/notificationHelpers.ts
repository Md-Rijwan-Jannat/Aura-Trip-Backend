/**
 * Notification Creator Helper
 *
 * Centralized notification creation used across the application.
 * This module handles all notification creation logic, ensuring consistent
 * behavior, proper deduplication, and respect for user preferences.
 */

import { NotificationService, TNotificationInput } from "./notification.service";
import { TNotificationType, NOTIFICATION_TITLES } from "./notification.types";

interface CreateNotificationOptions {
  recipient: string;
  actorId?: string | null;
  actorName?: string;
  type: TNotificationType;
  entityType?: string;
  entityId?: string;
  groupId?: string;
  extra?: string; // For titles that need extra context (group name, etc.)
  body?: string;
  link?: string;
  dedupe?: boolean;
}

/**
 * Create a notification with proper title generation and deduplication.
 * Returns the created notification or null if not created (due to preferences, self-notification, etc.)
 */
export const createNotification = async (options: CreateNotificationOptions) => {
  const { recipient, actorId, actorName, type, entityType, entityId, groupId, extra, body, link, dedupe } = options;

  // Generate title from template
  const title = NOTIFICATION_TITLES[type](actorName || "Someone", extra);

  const input: TNotificationInput = {
    recipient,
    actor: actorId ?? null,
    type,
    title,
    body: body ?? null,
    link: link ?? null,
    entityType: entityType ?? null,
    entityId: entityId ?? null,
    groupId: groupId ?? null,
    dedupe,
  };

  return NotificationService.createNotificationIntoDB(input);
};

/**
 * Notification creators for specific event types
 */
export const NotificationCreators = {
  // Social notifications
  newFollower: async (recipientId: string, followerId: string, followerName: string) => {
    return createNotification({
      recipient: recipientId,
      actorId: followerId,
      actorName: followerName,
      type: "NEW_FOLLOWER" as TNotificationType,
      link: `/profile/${followerId}`,
      dedupe: true,
    });
  },

  followRequest: async (recipientId: string, requesterId: string, requesterName: string) => {
    return createNotification({
      recipient: recipientId,
      actorId: requesterId,
      actorName: requesterName,
      type: "FOLLOW_REQUEST" as TNotificationType,
      link: `/profile/${requesterId}`,
    });
  },

  followRequestAccepted: async (requesterId: string, recipientId: string, recipientName: string) => {
    return createNotification({
      recipient: requesterId,
      actorId: recipientId,
      actorName: recipientName,
      type: "FOLLOW_REQUEST_ACCEPTED" as TNotificationType,
      link: `/profile/${recipientId}`,
      dedupe: true,
    });
  },

  // Post notifications
  postLike: async (postOwnerId: string, likerId: string, likerName: string, postId: string) => {
    return createNotification({
      recipient: postOwnerId,
      actorId: likerId,
      actorName: likerName,
      type: "POST_LIKE" as TNotificationType,
      entityType: "post",
      entityId: postId,
      link: `/posts/${postId}`,
      dedupe: true,
    });
  },

  postReaction: async (postOwnerId: string, reactorId: string, reactorName: string, postId: string, reaction: string) => {
    return createNotification({
      recipient: postOwnerId,
      actorId: reactorId,
      actorName: reactorName,
      type: "POST_REACTION" as TNotificationType,
      entityType: "post",
      entityId: postId,
      extra: reaction,
      link: `/posts/${postId}`,
      dedupe: true,
    });
  },

  postComment: async (postOwnerId: string, commenterId: string, commenterName: string, postId: string, commentId: string) => {
    return createNotification({
      recipient: postOwnerId,
      actorId: commenterId,
      actorName: commenterName,
      type: "POST_COMMENT" as TNotificationType,
      entityType: "post",
      entityId: postId,
      link: `/posts/${postId}?comment=${commentId}`,
    });
  },

  postCommentReply: async (
    commentOwnerId: string,
    replierId: string,
    replierName: string,
    postId: string,
    commentId: string,
    replyId: string,
  ) => {
    return createNotification({
      recipient: commentOwnerId,
      actorId: replierId,
      actorName: replierName,
      type: "POST_COMMENT_REPLY" as TNotificationType,
      entityType: "comment",
      entityId: commentId,
      link: `/posts/${postId}?comment=${commentId}&reply=${replyId}`,
      dedupe: true,
    });
  },

  postCommentReaction: async (
    commentOwnerId: string,
    reactorId: string,
    reactorName: string,
    postId: string,
    commentId: string,
    reaction: string,
  ) => {
    return createNotification({
      recipient: commentOwnerId,
      actorId: reactorId,
      actorName: reactorName,
      type: "POST_COMMENT_REACTION" as TNotificationType,
      entityType: "comment",
      entityId: commentId,
      extra: reaction,
      link: `/posts/${postId}?comment=${commentId}`,
      dedupe: true,
    });
  },

  // Group notifications
  groupInvitation: async (invitedUserId: string, inviterId: string, inviterName: string, groupId: string, groupName: string) => {
    return createNotification({
      recipient: invitedUserId,
      actorId: inviterId,
      actorName: inviterName,
      type: "GROUP_INVITATION" as TNotificationType,
      entityType: "group",
      entityId: groupId,
      groupId,
      extra: groupName,
      link: `/groups/${groupId}`,
    });
  },

  groupJoinRequest: async (groupOwnerId: string, requesterId: string, requesterName: string, groupId: string, groupName: string) => {
    return createNotification({
      recipient: groupOwnerId,
      actorId: requesterId,
      actorName: requesterName,
      type: "GROUP_JOIN_REQUEST" as TNotificationType,
      entityType: "group",
      entityId: groupId,
      groupId,
      extra: groupName,
      link: `/groups/${groupId}/members?filter=pending`,
    });
  },

  groupMembershipApproved: async (memberId: string, approverId: string, approverName: string, groupId: string, groupName: string) => {
    return createNotification({
      recipient: memberId,
      actorId: approverId,
      actorName: approverName,
      type: "GROUP_MEMBERSHIP_APPROVED" as TNotificationType,
      entityType: "group",
      entityId: groupId,
      groupId,
      extra: groupName,
      link: `/groups/${groupId}`,
    });
  },

  groupJoinRequestApproved: async (requesterId: string, groupId: string, groupName: string) => {
    return createNotification({
      recipient: requesterId,
      type: "GROUP_JOIN_REQUEST_APPROVED" as TNotificationType,
      entityType: "group",
      entityId: groupId,
      groupId,
      extra: groupName,
      link: `/groups/${groupId}`,
    });
  },

  groupJoinRequestRejected: async (requesterId: string, groupId: string, groupName: string) => {
    return createNotification({
      recipient: requesterId,
      type: "GROUP_JOIN_REQUEST_REJECTED" as TNotificationType,
      entityType: "group",
      entityId: groupId,
      groupId,
      extra: groupName,
      link: `/groups/${groupId}`,
    });
  },

  groupPost: async (groupId: string, posterId: string, posterName: string, postId: string, groupName: string) => {
    return createNotification({
      recipient: groupId, // This will be resolved to group members in the service
      actorId: posterId,
      actorName: posterName,
      type: "GROUP_POST" as TNotificationType,
      entityType: "post",
      entityId: postId,
      groupId,
      extra: groupName,
      link: `/groups/${groupId}/posts/${postId}`,
    });
  },

  groupPostApproved: async (
    postAuthorId: string,
    approverId: string,
    approverName: string,
    postId: string,
    groupId: string,
    groupName: string,
  ) => {
    return createNotification({
      recipient: postAuthorId,
      actorId: approverId,
      actorName: approverName,
      type: "GROUP_POST_APPROVED" as TNotificationType,
      entityType: "post",
      entityId: postId,
      groupId,
      extra: groupName,
      link: `/groups/${groupId}/posts/${postId}`,
    });
  },

  groupPostRejected: async (
    postAuthorId: string,
    approverId: string,
    approverName: string,
    postId: string,
    groupId: string,
    groupName: string,
    reason?: string,
  ) => {
    return createNotification({
      recipient: postAuthorId,
      actorId: approverId,
      actorName: approverName,
      type: "GROUP_POST_REJECTED" as TNotificationType,
      entityType: "post",
      entityId: postId,
      groupId,
      extra: groupName,
      body: reason || undefined,
      link: `/groups/${groupId}`,
    });
  },

  groupMemberRoleChanged: async (
    memberId: string,
    changerId: string,
    changerName: string,
    groupId: string,
    groupName: string,
    newRole: string,
  ) => {
    return createNotification({
      recipient: memberId,
      actorId: changerId,
      actorName: changerName,
      type: "GROUP_MEMBER_ROLE_CHANGED" as TNotificationType,
      entityType: "group",
      entityId: groupId,
      groupId,
      extra: `${groupName} (${newRole})`,
      link: `/groups/${groupId}`,
    });
  },

  // Security notifications
  securityAlert: async (userId: string, message: string, link?: string) => {
    return createNotification({
      recipient: userId,
      type: "SECURITY_ALERT" as TNotificationType,
      body: message,
      link: link ?? "/settings/security",
    });
  },

  accountUpdate: async (userId: string, message: string, link?: string) => {
    return createNotification({
      recipient: userId,
      type: "ACCOUNT_UPDATE" as TNotificationType,
      body: message,
      link: link ?? "/settings/account",
    });
  },

  // Short notifications
  shortLiked: async (shortOwnerId: string, likerId: string, likerName: string, shortId: string) => {
    return createNotification({
      recipient: shortOwnerId,
      actorId: likerId,
      actorName: likerName,
      type: "SHORT_LIKE" as TNotificationType,
      entityType: "short",
      entityId: shortId,
      link: `/shorts/${shortId}`,
      dedupe: true,
    });
  },

  shortReaction: async (shortOwnerId: string, reactorId: string, reactorName: string, shortId: string, reaction: string) => {
    return createNotification({
      recipient: shortOwnerId,
      actorId: reactorId,
      actorName: reactorName,
      type: "SHORT_REACTION" as TNotificationType,
      entityType: "short",
      entityId: shortId,
      extra: reaction,
      link: `/shorts/${shortId}`,
      dedupe: true,
    });
  },

  shortComment: async (shortOwnerId: string, commenterId: string, commenterName: string, shortId: string, commentId: string) => {
    return createNotification({
      recipient: shortOwnerId,
      actorId: commenterId,
      actorName: commenterName,
      type: "SHORT_COMMENT" as TNotificationType,
      entityType: "short",
      entityId: shortId,
      link: `/shorts/${shortId}?comment=${commentId}`,
    });
  },

  shortCommentReply: async (
    commentOwnerId: string,
    replierId: string,
    replierName: string,
    shortId: string,
    commentId: string,
    replyId: string,
  ) => {
    return createNotification({
      recipient: commentOwnerId,
      actorId: replierId,
      actorName: replierName,
      type: "SHORT_COMMENT_REPLY" as TNotificationType,
      entityType: "comment",
      entityId: commentId,
      link: `/shorts/${shortId}?comment=${commentId}&reply=${replyId}`,
      dedupe: true,
    });
  },

  shortPosted: async (groupId: string, posterId: string, posterName: string, shortId: string, groupName: string) => {
    return createNotification({
      recipient: groupId,
      actorId: posterId,
      actorName: posterName,
      type: "SHORT_POSTED" as TNotificationType,
      entityType: "short",
      entityId: shortId,
      groupId,
      extra: groupName,
      link: `/groups/${groupId}/shorts/${shortId}`,
    });
  },

  shortApproved: async (
    shortAuthorId: string,
    approverId: string,
    approverName: string,
    shortId: string,
    groupId: string,
    groupName: string,
  ) => {
    return createNotification({
      recipient: shortAuthorId,
      actorId: approverId,
      actorName: approverName,
      type: "SHORT_APPROVED" as TNotificationType,
      entityType: "short",
      entityId: shortId,
      groupId,
      extra: groupName,
      link: `/groups/${groupId}/shorts/${shortId}`,
    });
  },

  shortRejected: async (
    shortAuthorId: string,
    approverId: string,
    approverName: string,
    shortId: string,
    groupId: string,
    groupName: string,
    reason?: string,
  ) => {
    return createNotification({
      recipient: shortAuthorId,
      actorId: approverId,
      actorName: approverName,
      type: "SHORT_REJECTED" as TNotificationType,
      entityType: "short",
      entityId: shortId,
      groupId,
      extra: groupName,
      body: reason || undefined,
      link: `/groups/${groupId}`,
    });
  },

  shortRemoved: async (
    shortAuthorId: string,
    removerId: string,
    removerName: string,
    shortId: string,
    groupId: string,
    groupName: string,
  ) => {
    return createNotification({
      recipient: shortAuthorId,
      actorId: removerId,
      actorName: removerName,
      type: "SHORT_REMOVED" as TNotificationType,
      entityType: "short",
      entityId: shortId,
      groupId,
      extra: groupName,
      body: "Your short was removed by group staff",
      link: `/groups/${groupId}`,
    });
  },

  // Call notifications
  callIncoming: async (calleeId: string, callerId: string, callerName: string, chatId: string) => {
    return createNotification({
      recipient: calleeId,
      actorId: callerId,
      actorName: callerName,
      type: "CALL_INCOMING" as TNotificationType,
      entityType: "chat",
      entityId: chatId,
      link: `/messages/${chatId}`,
    });
  },

  callIncomingGroup: async (groupId: string, callerId: string, callerName: string, chatId: string, groupName: string) => {
    return createNotification({
      recipient: groupId,
      actorId: callerId,
      actorName: callerName,
      type: "CALL_INCOMING_GROUP" as TNotificationType,
      entityType: "chat",
      entityId: chatId,
      groupId,
      extra: groupName,
      link: `/groups/${groupId}/chat`,
    });
  },

  // Message notifications
  newMessage: async (recipientId: string, senderId: string, senderName: string, chatId: string) => {
    return createNotification({
      recipient: recipientId,
      actorId: senderId,
      actorName: senderName,
      type: "NEW_MESSAGE" as TNotificationType,
      entityType: "chat",
      entityId: chatId,
      link: `/messages/${chatId}`,
      dedupe: true,
    });
  },

  groupMessage: async (recipientId: string, senderId: string, senderName: string, chatId: string, groupName: string) => {
    return createNotification({
      recipient: recipientId,
      actorId: senderId,
      actorName: senderName,
      type: "GROUP_MESSAGE" as TNotificationType,
      entityType: "chat",
      entityId: chatId,
      groupId: groupName,
      extra: groupName,
      link: `/messages/${chatId}`,
      dedupe: true,
    });
  },

  messageMention: async (recipientId: string, senderId: string, senderName: string, messageId: string, chatId: string) => {
    return createNotification({
      recipient: recipientId,
      actorId: senderId,
      actorName: senderName,
      type: "MESSAGE_MENTION" as TNotificationType,
      entityType: "message",
      entityId: messageId,
      groupId: chatId,
      link: `/messages/${chatId}`,
      dedupe: true,
    });
  },
};
