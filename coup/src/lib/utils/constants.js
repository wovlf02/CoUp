// C:/Project/CoUp/coup/src/lib/utils/constants.js

export const APP_NAME = 'CoUp';
export const APP_DESCRIPTION = '함께 성장하는 스터디 플랫폼';

export const DEFAULT_PAGE_LIMIT = 10;
export const MAX_PAGE_LIMIT = 50;

export const USER_ROLES = {
  MEMBER: 'MEMBER',
  ADMIN: 'ADMIN',
  OWNER: 'OWNER',
};

export const STUDY_VISIBILITY = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
};

export const STUDY_MEMBER_STATUS = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  REJECTED: 'REJECTED',
  LEFT: 'LEFT',
  KICKED: 'KICKED',
};

export const NOTIFICATION_TYPES = {
  STUDY_JOIN_REQUEST: 'STUDY_JOIN_REQUEST',
  STUDY_JOIN_APPROVED: 'STUDY_JOIN_APPROVED',
  STUDY_JOIN_REJECTED: 'STUDY_JOIN_REJECTED',
  NEW_NOTICE: 'NEW_NOTICE',
  NEW_MESSAGE: 'NEW_MESSAGE',
  TASK_ASSIGNED: 'TASK_ASSIGNED',
  TASK_COMPLETED: 'TASK_COMPLETED',
  EVENT_REMINDER: 'EVENT_REMINDER',
  // Add more as needed
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    SIGNUP: '/api/v1/auth/signup',
    SESSION: '/api/v1/users/me',
  },
  USERS: {
    ME: '/api/v1/users/me',
    UPDATE_PROFILE: '/api/v1/users/me',
    DELETE_ACCOUNT: '/api/v1/users/me',
  },
  STUDIES: {
    LIST: '/api/v1/studies',
    CREATE: '/api/v1/studies',
    DETAIL: (studyId) => `/api/v1/studies/${studyId}`,
    UPDATE: (studyId) => `/api/v1/studies/${studyId}`,
    DELETE: (studyId) => `/api/v1/studies/${studyId}`,
    JOIN: (studyId) => `/api/v1/studies/${studyId}/join`,
    MANAGE_JOIN_REQUEST: (studyId) => `/api/v1/studies/${studyId}/manage`,
    MEMBERS: (studyId) => `/api/v1/studies/${studyId}/members`,
    UPDATE_MEMBER_ROLE: (studyId, memberId) => `/api/v1/studies/${studyId}/members/${memberId}`,
    REMOVE_MEMBER: (studyId, memberId) => `/api/v1/studies/${studyId}/members/${memberId}`,
  },
  NOTICES: {
    LIST: (studyId) => `/api/v1/studies/${studyId}/notices`,
    CREATE: (studyId) => `/api/v1/studies/${studyId}/notices`,
    DETAIL: (studyId, noticeId) => `/api/v1/studies/${studyId}/notices/${noticeId}`,
    UPDATE: (studyId, noticeId) => `/api/v1/studies/${studyId}/notices/${noticeId}`,
    DELETE: (studyId, noticeId) => `/api/v1/studies/${studyId}/notices/${noticeId}`,
  },
  FILES: {
    LIST: (studyId) => `/api/v1/studies/${studyId}/files`,
    UPLOAD: (studyId) => `/api/v1/studies/${studyId}/files`,
    DELETE: (studyId, fileId) => `/api/v1/studies/${studyId}/files/${fileId}`,
  },
  EVENTS: {
    LIST: (studyId) => `/api/v1/studies/${studyId}/events`,
    CREATE: (studyId) => `/api/v1/studies/${studyId}/events`,
    DETAIL: (studyId, eventId) => `/api/v1/studies/${studyId}/events/${eventId}`,
    UPDATE: (studyId, eventId) => `/api/v1/studies/${studyId}/events/${eventId}`,
    DELETE: (studyId, eventId) => `/api/v1/studies/${studyId}/events/${eventId}`,
  },
  TASKS: {
    LIST: (studyId) => `/api/v1/studies/${studyId}/tasks`,
    CREATE: (studyId) => `/api/v1/studies/${studyId}/tasks`,
    DETAIL: (studyId, taskId) => `/api/v1/studies/${studyId}/tasks/${taskId}`,
    UPDATE: (studyId, taskId) => `/api/v1/studies/${studyId}/tasks/${taskId}`,
    DELETE: (studyId, taskId) => `/api/v1/studies/${studyId}/tasks/${taskId}`,
  },
  NOTIFICATIONS: {
    LIST: '/api/v1/notifications',
    MARK_ALL_READ: '/api/v1/notifications/read',
    MARK_AS_READ: (notificationId) => `/api/v1/notifications/${notificationId}/read`,
  },
  INTERNAL: {
    SAVE_MESSAGE: '/api/v1/internal/messages',
    UPDATE_USER_STATUS: '/api/v1/internal/users/status',
  },
};