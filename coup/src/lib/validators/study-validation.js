/**
 * 스터디 관련 유효성 검사 헬퍼
 * @module lib/validators/study-validation
 */

import { STUDY_ERRORS, createStudyErrorResponse } from '../exceptions/study-errors.js';

/**
 * 허용된 스터디 카테고리 목록
 */
export const VALID_CATEGORIES = [
  'PROGRAMMING',
  'LANGUAGE',
  'EXAM',
  'HOBBY',
  'JOB',
  'OTHER'
];

/**
 * 허용된 멤버 역할
 */
export const VALID_ROLES = ['OWNER', 'ADMIN', 'MEMBER'];

/**
 * 허용된 멤버 상태
 */
export const VALID_MEMBER_STATUS = ['PENDING', 'ACTIVE', 'KICKED', 'LEFT'];

/**
 * 스터디 이름 검증
 * @param {string} name - 검증할 스터디 이름
 * @returns {Object} { valid: boolean, error?: Object }
 */
export function validateStudyName(name) {
  if (!name || typeof name !== 'string') {
    return {
      valid: false,
      error: createStudyErrorResponse('INVALID_STUDY_NAME')
    };
  }

  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return {
      valid: false,
      error: createStudyErrorResponse('INVALID_STUDY_NAME', '스터디 이름은 최소 2자 이상이어야 합니다')
    };
  }

  if (trimmed.length > 50) {
    return {
      valid: false,
      error: createStudyErrorResponse('INVALID_STUDY_NAME', '스터디 이름은 최대 50자까지 가능합니다')
    };
  }

  return { valid: true };
}

/**
 * 스터디 설명 검증
 * @param {string} description - 검증할 스터디 설명
 * @returns {Object} { valid: boolean, error?: Object }
 */
export function validateDescription(description) {
  if (!description || typeof description !== 'string') {
    return {
      valid: false,
      error: createStudyErrorResponse('INVALID_DESCRIPTION')
    };
  }

  const trimmed = description.trim();

  if (trimmed.length < 10) {
    return {
      valid: false,
      error: createStudyErrorResponse('INVALID_DESCRIPTION', '스터디 설명은 최소 10자 이상이어야 합니다')
    };
  }

  if (trimmed.length > 500) {
    return {
      valid: false,
      error: createStudyErrorResponse('INVALID_DESCRIPTION', '스터디 설명은 최대 500자까지 가능합니다')
    };
  }

  return { valid: true };
}

/**
 * 최대 인원 검증
 * @param {number} maxMembers - 검증할 최대 인원
 * @returns {Object} { valid: boolean, error?: Object }
 */
export function validateMaxMembers(maxMembers) {
  const num = parseInt(maxMembers);

  if (isNaN(num)) {
    return {
      valid: false,
      error: createStudyErrorResponse('INVALID_MAX_MEMBERS', '최대 인원은 숫자여야 합니다')
    };
  }

  if (num < 2) {
    return {
      valid: false,
      error: createStudyErrorResponse('INVALID_MAX_MEMBERS', '최대 인원은 최소 2명 이상이어야 합니다')
    };
  }

  if (num > 100) {
    return {
      valid: false,
      error: createStudyErrorResponse('INVALID_MAX_MEMBERS', '최대 인원은 100명을 초과할 수 없습니다')
    };
  }

  return { valid: true };
}

/**
 * 카테고리 검증
 * @param {string} category - 검증할 카테고리
 * @returns {Object} { valid: boolean, error?: Object }
 */
export function validateCategory(category) {
  if (!category || !VALID_CATEGORIES.includes(category)) {
    return {
      valid: false,
      error: createStudyErrorResponse('INVALID_CATEGORY', `카테고리는 ${VALID_CATEGORIES.join(', ')} 중 하나여야 합니다`)
    };
  }

  return { valid: true };
}

/**
 * 멤버 역할 검증
 * @param {string} role - 검증할 역할
 * @returns {Object} { valid: boolean, error?: Object }
 */
export function validateRole(role) {
  if (!role || !VALID_ROLES.includes(role)) {
    return {
      valid: false,
      error: createStudyErrorResponse('INVALID_ROLE')
    };
  }

  return { valid: true };
}

/**
 * 멤버 상태 검증
 * @param {string} status - 검증할 상태
 * @returns {Object} { valid: boolean, error?: Object }
 */
export function validateMemberStatus(status) {
  if (!status || !VALID_MEMBER_STATUS.includes(status)) {
    return {
      valid: false,
      error: createStudyErrorResponse('INVALID_MEMBER_STATUS')
    };
  }

  return { valid: true };
}

/**
 * 공지 제목 검증
 * @param {string} title - 검증할 공지 제목
 * @returns {Object} { valid: boolean, error?: Object }
 */
export function validateNoticeTitle(title) {
  if (!title || typeof title !== 'string') {
    return {
      valid: false,
      error: createStudyErrorResponse('INVALID_NOTICE_TITLE')
    };
  }

  const trimmed = title.trim();

  if (trimmed.length < 1 || trimmed.length > 100) {
    return {
      valid: false,
      error: createStudyErrorResponse('INVALID_NOTICE_TITLE')
    };
  }

  return { valid: true };
}

/**
 * 공지 내용 검증
 * @param {string} content - 검증할 공지 내용
 * @returns {Object} { valid: boolean, error?: Object }
 */
export function validateNoticeContent(content) {
  if (!content || typeof content !== 'string') {
    return {
      valid: false,
      error: createStudyErrorResponse('INVALID_NOTICE_CONTENT')
    };
  }

  const trimmed = content.trim();

  if (trimmed.length < 1 || trimmed.length > 5000) {
    return {
      valid: false,
      error: createStudyErrorResponse('INVALID_NOTICE_CONTENT')
    };
  }

  return { valid: true };
}

/**
 * 할일 제목 검증
 * @param {string} title - 검증할 할일 제목
 * @returns {Object} { valid: boolean, error?: Object }
 */
export function validateTaskTitle(title) {
  if (!title || typeof title !== 'string') {
    return {
      valid: false,
      error: createStudyErrorResponse('INVALID_TASK_TITLE')
    };
  }

  const trimmed = title.trim();

  if (trimmed.length < 1 || trimmed.length > 200) {
    return {
      valid: false,
      error: createStudyErrorResponse('INVALID_TASK_TITLE')
    };
  }

  return { valid: true };
}

/**
 * 할일 마감일 검증
 * @param {string|Date} dueDate - 검증할 마감일
 * @returns {Object} { valid: boolean, error?: Object }
 */
export function validateTaskDueDate(dueDate) {
  if (!dueDate) {
    return { valid: true }; // 마감일은 선택사항
  }

  const date = new Date(dueDate);

  if (isNaN(date.getTime())) {
    return {
      valid: false,
      error: createStudyErrorResponse('INVALID_TASK_DUE_DATE', '유효하지 않은 날짜 형식입니다')
    };
  }

  if (date < new Date()) {
    return {
      valid: false,
      error: createStudyErrorResponse('INVALID_TASK_DUE_DATE')
    };
  }

  return { valid: true };
}

/**
 * 메시지 내용 검증
 * @param {string} content - 검증할 메시지 내용
 * @returns {Object} { valid: boolean, error?: Object }
 */
export function validateMessageContent(content) {
  if (!content || typeof content !== 'string') {
    return {
      valid: false,
      error: createStudyErrorResponse('INVALID_MESSAGE_CONTENT')
    };
  }

  const trimmed = content.trim();

  if (trimmed.length < 1 || trimmed.length > 2000) {
    return {
      valid: false,
      error: createStudyErrorResponse('INVALID_MESSAGE_CONTENT')
    };
  }

  return { valid: true };
}

/**
 * 일정 제목 검증
 * @param {string} title - 검증할 일정 제목
 * @returns {Object} { valid: boolean, error?: Object }
 */
export function validateEventTitle(title) {
  if (!title || typeof title !== 'string') {
    return {
      valid: false,
      error: createStudyErrorResponse('INVALID_EVENT_TITLE')
    };
  }

  const trimmed = title.trim();

  if (trimmed.length < 1 || trimmed.length > 100) {
    return {
      valid: false,
      error: createStudyErrorResponse('INVALID_EVENT_TITLE')
    };
  }

  return { valid: true };
}

/**
 * 일정 날짜 검증
 * @param {string|Date} startDate - 시작일
 * @param {string|Date} endDate - 종료일
 * @returns {Object} { valid: boolean, error?: Object }
 */
export function validateEventDate(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return {
      valid: false,
      error: createStudyErrorResponse('INVALID_EVENT_DATE', '유효하지 않은 날짜 형식입니다')
    };
  }

  if (start > end) {
    return {
      valid: false,
      error: createStudyErrorResponse('INVALID_EVENT_DATE')
    };
  }

  return { valid: true };
}

/**
 * 스터디 생성 데이터 전체 검증
 * @param {Object} data - 스터디 생성 데이터
 * @returns {Object} { valid: boolean, errors?: Array }
 */
export function validateStudyCreation(data) {
  const errors = [];

  // 필수 필드 확인
  if (!data.name) {
    errors.push(createStudyErrorResponse('MISSING_REQUIRED_FIELDS', '스터디 이름은 필수입니다'));
  } else {
    const nameValidation = validateStudyName(data.name);
    if (!nameValidation.valid) {
      errors.push(nameValidation.error);
    }
  }

  if (!data.description) {
    errors.push(createStudyErrorResponse('MISSING_REQUIRED_FIELDS', '스터디 설명은 필수입니다'));
  } else {
    const descValidation = validateDescription(data.description);
    if (!descValidation.valid) {
      errors.push(descValidation.error);
    }
  }

  if (!data.category) {
    errors.push(createStudyErrorResponse('MISSING_REQUIRED_FIELDS', '카테고리는 필수입니다'));
  } else {
    const categoryValidation = validateCategory(data.category);
    if (!categoryValidation.valid) {
      errors.push(categoryValidation.error);
    }
  }

  // 선택 필드 검증
  if (data.maxMembers !== undefined) {
    const maxMembersValidation = validateMaxMembers(data.maxMembers);
    if (!maxMembersValidation.valid) {
      errors.push(maxMembersValidation.error);
    }
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true };
}

/**
 * 스터디 수정 데이터 검증
 * @param {Object} data - 스터디 수정 데이터
 * @returns {Object} { valid: boolean, errors?: Array }
 */
export function validateStudyUpdate(data) {
  const errors = [];

  // 제공된 필드만 검증
  if (data.name !== undefined) {
    const nameValidation = validateStudyName(data.name);
    if (!nameValidation.valid) {
      errors.push(nameValidation.error);
    }
  }

  if (data.description !== undefined) {
    const descValidation = validateDescription(data.description);
    if (!descValidation.valid) {
      errors.push(descValidation.error);
    }
  }

  if (data.category !== undefined) {
    const categoryValidation = validateCategory(data.category);
    if (!categoryValidation.valid) {
      errors.push(categoryValidation.error);
    }
  }

  if (data.maxMembers !== undefined) {
    const maxMembersValidation = validateMaxMembers(data.maxMembers);
    if (!maxMembersValidation.valid) {
      errors.push(maxMembersValidation.error);
    }
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true };
}

/**
 * XSS 방어를 위한 HTML 이스케이프
 * @param {string} text - 이스케이프할 텍스트
 * @returns {string} 이스케이프된 텍스트
 */
export function escapeHtml(text) {
  if (!text || typeof text !== 'string') return text;

  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

