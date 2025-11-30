/**
 * 알림 생성 유틸리티
 * @module lib/notification-helpers
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 알림 타입 정의
 */
export const NOTIFICATION_TYPES = {
  JOIN_APPROVED: 'JOIN_APPROVED',
  NOTICE: 'NOTICE',
  FILE: 'FILE',
  EVENT: 'EVENT',
  TASK: 'TASK',
  MEMBER: 'MEMBER',
  KICK: 'KICK',
  CHAT: 'CHAT'
};

/**
 * 알림 템플릿
 */
const NOTIFICATION_TEMPLATES = {
  // 가입 승인
  JOIN_APPROVED: (studyName) => `${studyName} 스터디 가입이 승인되었습니다`,

  // 공지
  NOTICE_CREATED: (studyName, title) => `${studyName} - 새 공지: ${title}`,
  NOTICE_UPDATED: (studyName, title) => `${studyName} - 공지 수정: ${title}`,
  NOTICE_PINNED: (studyName, title) => `${studyName} - 중요 공지: ${title}`,

  // 파일
  FILE_UPLOADED: (studyName, fileName) => `${studyName} - 새 파일: ${fileName}`,

  // 일정
  EVENT_CREATED: (studyName, title) => `${studyName} - 새 일정: ${title}`,
  EVENT_UPDATED: (studyName, title) => `${studyName} - 일정 변경: ${title}`,
  EVENT_REMINDER: (studyName, title, hours) => `${studyName} - ${title} (${hours}시간 후 시작)`,

  // 할일
  TASK_ASSIGNED: (studyName, title) => `${studyName} - 새 할일: ${title}`,
  TASK_DUE_SOON: (studyName, title, hours) => `${studyName} - ${title} 마감 ${hours}시간 전`,

  // 멤버
  MEMBER_JOINED: (studyName, userName) => `${studyName} - ${userName}님이 가입했습니다`,
  MEMBER_LEFT: (studyName, userName) => `${studyName} - ${userName}님이 탈퇴했습니다`,
  ROLE_CHANGED: (studyName, newRole) => `${studyName} - 역할이 ${newRole}(으)로 변경되었습니다`,

  // 강퇴
  KICKED: (studyName, reason) => `${studyName}에서 강퇴되었습니다${reason ? `: ${reason}` : ''}`,

  // 채팅
  CHAT_MENTION: (studyName, userName) => `${studyName} - ${userName}님이 회원님을 언급했습니다`
};

/**
 * 단일 알림 생성
 * @param {Object} data - 알림 데이터
 * @returns {Promise<Object>} 생성된 알림
 */
export async function createNotification(data) {
  const {
    userId,
    type,
    studyId = null,
    studyName = null,
    studyEmoji = null,
    message,
    additionalData = null
  } = data;

  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        studyId,
        studyName,
        studyEmoji,
        message,
        data: additionalData
      }
    });

    return notification;
  } catch (error) {
    console.error('❌ [NOTIFICATION] 알림 생성 실패:', {
      error: error.message,
      userId,
      type
    });
    throw error;
  }
}

/**
 * 일괄 알림 생성 (여러 사용자에게)
 * @param {Array<string>} userIds - 알림을 받을 사용자 ID 목록
 * @param {Object} notificationData - 알림 데이터
 * @returns {Promise<Object>} { success: number, failed: number }
 */
export async function createBulkNotifications(userIds, notificationData) {
  const {
    type,
    studyId = null,
    studyName = null,
    studyEmoji = null,
    message,
    additionalData = null
  } = notificationData;

  const notifications = userIds.map(userId => ({
    userId,
    type,
    studyId,
    studyName,
    studyEmoji,
    message,
    data: additionalData
  }));

  try {
    const result = await prisma.notification.createMany({
      data: notifications,
      skipDuplicates: true
    });

    return {
      success: result.count,
      failed: 0,
      total: userIds.length
    };
  } catch (error) {
    console.error('❌ [NOTIFICATION] 일괄 알림 생성 실패:', {
      error: error.message,
      userCount: userIds.length,
      type
    });

    return {
      success: 0,
      failed: userIds.length,
      total: userIds.length
    };
  }
}

/**
 * 스터디 가입 승인 알림
 * @param {string} userId - 사용자 ID
 * @param {Object} study - 스터디 정보
 * @returns {Promise<Object>} 생성된 알림
 */
export async function notifyJoinApproved(userId, study) {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.JOIN_APPROVED,
    studyId: study.id,
    studyName: study.name,
    studyEmoji: study.emoji,
    message: NOTIFICATION_TEMPLATES.JOIN_APPROVED(study.name)
  });
}

/**
 * 새 공지 알림 (모든 멤버에게)
 * @param {Object} study - 스터디 정보
 * @param {string} noticeTitle - 공지 제목
 * @param {Array<string>} memberUserIds - 멤버 사용자 ID 목록
 * @param {boolean} isPinned - 고정 공지 여부
 * @returns {Promise<Object>} 생성 결과
 */
export async function notifyNewNotice(study, noticeTitle, memberUserIds, isPinned = false) {
  const template = isPinned
    ? NOTIFICATION_TEMPLATES.NOTICE_PINNED
    : NOTIFICATION_TEMPLATES.NOTICE_CREATED;

  return createBulkNotifications(memberUserIds, {
    type: NOTIFICATION_TYPES.NOTICE,
    studyId: study.id,
    studyName: study.name,
    studyEmoji: study.emoji,
    message: template(study.name, noticeTitle),
    additionalData: { title: noticeTitle, isPinned }
  });
}

/**
 * 새 파일 업로드 알림
 * @param {Object} study - 스터디 정보
 * @param {string} fileName - 파일 이름
 * @param {Array<string>} memberUserIds - 멤버 사용자 ID 목록
 * @returns {Promise<Object>} 생성 결과
 */
export async function notifyFileUploaded(study, fileName, memberUserIds) {
  return createBulkNotifications(memberUserIds, {
    type: NOTIFICATION_TYPES.FILE,
    studyId: study.id,
    studyName: study.name,
    studyEmoji: study.emoji,
    message: NOTIFICATION_TEMPLATES.FILE_UPLOADED(study.name, fileName),
    additionalData: { fileName }
  });
}

/**
 * 새 일정 생성 알림
 * @param {Object} study - 스터디 정보
 * @param {string} eventTitle - 일정 제목
 * @param {Array<string>} memberUserIds - 멤버 사용자 ID 목록
 * @returns {Promise<Object>} 생성 결과
 */
export async function notifyEventCreated(study, eventTitle, memberUserIds) {
  return createBulkNotifications(memberUserIds, {
    type: NOTIFICATION_TYPES.EVENT,
    studyId: study.id,
    studyName: study.name,
    studyEmoji: study.emoji,
    message: NOTIFICATION_TEMPLATES.EVENT_CREATED(study.name, eventTitle),
    additionalData: { title: eventTitle }
  });
}

/**
 * 일정 리마인더 알림
 * @param {Object} study - 스터디 정보
 * @param {string} eventTitle - 일정 제목
 * @param {number} hoursUntil - 시작까지 남은 시간
 * @param {Array<string>} memberUserIds - 멤버 사용자 ID 목록
 * @returns {Promise<Object>} 생성 결과
 */
export async function notifyEventReminder(study, eventTitle, hoursUntil, memberUserIds) {
  return createBulkNotifications(memberUserIds, {
    type: NOTIFICATION_TYPES.EVENT,
    studyId: study.id,
    studyName: study.name,
    studyEmoji: study.emoji,
    message: NOTIFICATION_TEMPLATES.EVENT_REMINDER(study.name, eventTitle, hoursUntil),
    additionalData: { title: eventTitle, hoursUntil }
  });
}

/**
 * 할일 배정 알림
 * @param {string} userId - 사용자 ID
 * @param {Object} study - 스터디 정보
 * @param {string} taskTitle - 할일 제목
 * @returns {Promise<Object>} 생성된 알림
 */
export async function notifyTaskAssigned(userId, study, taskTitle) {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.TASK,
    studyId: study.id,
    studyName: study.name,
    studyEmoji: study.emoji,
    message: NOTIFICATION_TEMPLATES.TASK_ASSIGNED(study.name, taskTitle),
    additionalData: { title: taskTitle }
  });
}

/**
 * 할일 마감 임박 알림
 * @param {string} userId - 사용자 ID
 * @param {Object} study - 스터디 정보
 * @param {string} taskTitle - 할일 제목
 * @param {number} hoursUntil - 마감까지 남은 시간
 * @returns {Promise<Object>} 생성된 알림
 */
export async function notifyTaskDueSoon(userId, study, taskTitle, hoursUntil) {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.TASK,
    studyId: study.id,
    studyName: study.name,
    studyEmoji: study.emoji,
    message: NOTIFICATION_TEMPLATES.TASK_DUE_SOON(study.name, taskTitle, hoursUntil),
    additionalData: { title: taskTitle, hoursUntil }
  });
}

/**
 * 새 멤버 가입 알림 (관리자에게)
 * @param {Object} study - 스터디 정보
 * @param {string} newMemberName - 새 멤버 이름
 * @param {Array<string>} adminUserIds - 관리자 사용자 ID 목록
 * @returns {Promise<Object>} 생성 결과
 */
export async function notifyMemberJoined(study, newMemberName, adminUserIds) {
  return createBulkNotifications(adminUserIds, {
    type: NOTIFICATION_TYPES.MEMBER,
    studyId: study.id,
    studyName: study.name,
    studyEmoji: study.emoji,
    message: NOTIFICATION_TEMPLATES.MEMBER_JOINED(study.name, newMemberName),
    additionalData: { memberName: newMemberName }
  });
}

/**
 * 역할 변경 알림
 * @param {string} userId - 사용자 ID
 * @param {Object} study - 스터디 정보
 * @param {string} newRole - 새 역할
 * @returns {Promise<Object>} 생성된 알림
 */
export async function notifyRoleChanged(userId, study, newRole) {
  const roleNames = {
    OWNER: '스터디장',
    ADMIN: '관리자',
    MEMBER: '멤버'
  };

  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.MEMBER,
    studyId: study.id,
    studyName: study.name,
    studyEmoji: study.emoji,
    message: NOTIFICATION_TEMPLATES.ROLE_CHANGED(study.name, roleNames[newRole] || newRole),
    additionalData: { newRole }
  });
}

/**
 * 강퇴 알림
 * @param {string} userId - 사용자 ID
 * @param {Object} study - 스터디 정보
 * @param {string} reason - 강퇴 사유
 * @returns {Promise<Object>} 생성된 알림
 */
export async function notifyKicked(userId, study, reason = null) {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.KICK,
    studyId: study.id,
    studyName: study.name,
    studyEmoji: study.emoji,
    message: NOTIFICATION_TEMPLATES.KICKED(study.name, reason),
    additionalData: { reason }
  });
}

/**
 * 채팅 멘션 알림
 * @param {string} userId - 멘션된 사용자 ID
 * @param {Object} study - 스터디 정보
 * @param {string} mentionerName - 멘션한 사용자 이름
 * @returns {Promise<Object>} 생성된 알림
 */
export async function notifyChatMention(userId, study, mentionerName) {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.CHAT,
    studyId: study.id,
    studyName: study.name,
    studyEmoji: study.emoji,
    message: NOTIFICATION_TEMPLATES.CHAT_MENTION(study.name, mentionerName),
    additionalData: { mentionerName }
  });
}

/**
 * 안전한 알림 생성 (실패해도 계속 진행)
 * @param {Function} notificationFn - 알림 생성 함수
 * @param {Array} args - 함수 인자
 * @returns {Promise<boolean>} 성공 여부
 */
export async function safeNotify(notificationFn, ...args) {
  try {
    await notificationFn(...args);
    return true;
  } catch (error) {
    console.error('❌ [NOTIFICATION] 알림 생성 실패 (무시):', {
      error: error.message,
      function: notificationFn.name
    });
    return false;
  }
}

