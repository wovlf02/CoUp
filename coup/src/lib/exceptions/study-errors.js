/**
 * 스터디 예외 처리 헬퍼
 * @module lib/exceptions/study-errors
 */

/**
 * 스터디 관련 에러 코드 정의
 */
export const STUDY_ERRORS = {
  // 스터디 CRUD
  STUDY_NOT_FOUND: {
    code: 'STUDY_001',
    message: '스터디를 찾을 수 없습니다',
    statusCode: 404
  },
  INVALID_STUDY_NAME: {
    code: 'STUDY_002',
    message: '스터디 이름은 2자 이상 50자 이하여야 합니다',
    statusCode: 400
  },
  INVALID_DESCRIPTION: {
    code: 'STUDY_003',
    message: '스터디 설명은 10자 이상 500자 이하여야 합니다',
    statusCode: 400
  },
  INVALID_MAX_MEMBERS: {
    code: 'STUDY_004',
    message: '최대 인원은 2명에서 100명 사이여야 합니다',
    statusCode: 400
  },
  INVALID_CATEGORY: {
    code: 'STUDY_005',
    message: '유효하지 않은 카테고리입니다',
    statusCode: 400
  },
  DUPLICATE_STUDY_NAME: {
    code: 'STUDY_006',
    message: '이미 존재하는 스터디 이름입니다',
    statusCode: 409
  },
  MISSING_REQUIRED_FIELDS: {
    code: 'STUDY_007',
    message: '필수 필드가 누락되었습니다',
    statusCode: 400
  },

  // 권한
  NOT_STUDY_MEMBER: {
    code: 'STUDY_101',
    message: '스터디 멤버가 아닙니다',
    statusCode: 403
  },
  INSUFFICIENT_PERMISSION: {
    code: 'STUDY_102',
    message: '권한이 부족합니다',
    statusCode: 403
  },
  NOT_STUDY_OWNER: {
    code: 'STUDY_103',
    message: '스터디 소유자만 수행할 수 있습니다',
    statusCode: 403
  },
  NOT_ADMIN_OR_OWNER: {
    code: 'STUDY_104',
    message: '관리자 또는 소유자만 수행할 수 있습니다',
    statusCode: 403
  },

  // 가입/탈퇴
  STUDY_NOT_RECRUITING: {
    code: 'STUDY_201',
    message: '현재 모집 중이 아닙니다',
    statusCode: 400
  },
  STUDY_FULL: {
    code: 'STUDY_202',
    message: '정원이 마감되었습니다',
    statusCode: 400
  },
  ALREADY_MEMBER: {
    code: 'STUDY_203',
    message: '이미 가입된 스터디입니다',
    statusCode: 400
  },
  PENDING_APPROVAL: {
    code: 'STUDY_204',
    message: '가입 승인 대기 중입니다',
    statusCode: 400
  },
  KICKED_MEMBER: {
    code: 'STUDY_205',
    message: '강퇴된 스터디입니다. 스터디장에게 문의하세요',
    statusCode: 403
  },
  OWNER_CANNOT_LEAVE: {
    code: 'STUDY_206',
    message: '스터디장은 탈퇴할 수 없습니다. 스터디를 삭제하거나 소유권을 이전하세요',
    statusCode: 400
  },
  NOT_A_MEMBER: {
    code: 'STUDY_207',
    message: '스터디 멤버가 아닙니다',
    statusCode: 400
  },
  LEFT_MEMBER_COOLDOWN: {
    code: 'STUDY_208',
    message: '탈퇴 후 7일이 지나야 재가입할 수 있습니다',
    statusCode: 400
  },

  // 멤버 관리
  MEMBER_NOT_FOUND: {
    code: 'STUDY_301',
    message: '멤버를 찾을 수 없습니다',
    statusCode: 404
  },
  CANNOT_KICK_SELF: {
    code: 'STUDY_302',
    message: '자기 자신을 강퇴할 수 없습니다',
    statusCode: 400
  },
  CANNOT_KICK_OWNER: {
    code: 'STUDY_303',
    message: '스터디장을 강퇴할 수 없습니다',
    statusCode: 400
  },
  INVALID_ROLE: {
    code: 'STUDY_304',
    message: '유효하지 않은 역할입니다. MEMBER 또는 ADMIN만 가능합니다',
    statusCode: 400
  },
  CANNOT_CHANGE_OWNER_ROLE: {
    code: 'STUDY_305',
    message: '스터디장의 역할은 변경할 수 없습니다',
    statusCode: 400
  },
  CANNOT_KICK_ADMIN: {
    code: 'STUDY_306',
    message: '관리자는 다른 관리자를 강퇴할 수 없습니다',
    statusCode: 403
  },
  INVALID_MEMBER_STATUS: {
    code: 'STUDY_307',
    message: '유효하지 않은 멤버 상태입니다',
    statusCode: 400
  },

  // 가입 요청 관리
  JOIN_REQUEST_NOT_FOUND: {
    code: 'STUDY_401',
    message: '가입 요청을 찾을 수 없습니다',
    statusCode: 404
  },
  JOIN_REQUEST_ALREADY_PROCESSED: {
    code: 'STUDY_402',
    message: '이미 처리된 가입 요청입니다',
    statusCode: 400
  },
  DUPLICATE_JOIN_REQUEST: {
    code: 'STUDY_403',
    message: '이미 가입 요청이 존재합니다',
    statusCode: 400
  },

  // 파일
  FILE_NOT_PROVIDED: {
    code: 'STUDY_501',
    message: '파일을 선택해주세요',
    statusCode: 400
  },
  FILE_TOO_LARGE: {
    code: 'STUDY_502',
    message: '파일 크기는 50MB를 초과할 수 없습니다',
    statusCode: 400
  },
  INVALID_FILE_TYPE: {
    code: 'STUDY_503',
    message: '허용되지 않은 파일 형식입니다',
    statusCode: 400
  },
  FILE_NOT_FOUND: {
    code: 'STUDY_504',
    message: '파일을 찾을 수 없습니다',
    statusCode: 404
  },
  FILE_UPLOAD_FAILED: {
    code: 'STUDY_505',
    message: '파일 업로드에 실패했습니다',
    statusCode: 500
  },
  STORAGE_FULL: {
    code: 'STUDY_506',
    message: '저장 공간이 부족합니다',
    statusCode: 507
  },
  MALICIOUS_FILE_DETECTED: {
    code: 'STUDY_507',
    message: '악성 파일로 의심되어 업로드가 거부되었습니다',
    statusCode: 400
  },

  // 공지
  NOTICE_NOT_FOUND: {
    code: 'STUDY_601',
    message: '공지를 찾을 수 없습니다',
    statusCode: 404
  },
  INVALID_NOTICE_TITLE: {
    code: 'STUDY_602',
    message: '공지 제목은 1자 이상 100자 이하여야 합니다',
    statusCode: 400
  },
  INVALID_NOTICE_CONTENT: {
    code: 'STUDY_603',
    message: '공지 내용은 1자 이상 5000자 이하여야 합니다',
    statusCode: 400
  },

  // 할일
  TASK_NOT_FOUND: {
    code: 'STUDY_701',
    message: '할일을 찾을 수 없습니다',
    statusCode: 404
  },
  INVALID_TASK_TITLE: {
    code: 'STUDY_702',
    message: '할일 제목은 1자 이상 200자 이하여야 합니다',
    statusCode: 400
  },
  INVALID_TASK_DUE_DATE: {
    code: 'STUDY_703',
    message: '마감일은 현재 시간 이후여야 합니다',
    statusCode: 400
  },

  // 채팅
  MESSAGE_NOT_FOUND: {
    code: 'STUDY_801',
    message: '메시지를 찾을 수 없습니다',
    statusCode: 404
  },
  INVALID_MESSAGE_CONTENT: {
    code: 'STUDY_802',
    message: '메시지 내용은 1자 이상 2000자 이하여야 합니다',
    statusCode: 400
  },
  MESSAGE_OR_FILE_REQUIRED: {
    code: 'STUDY_803',
    message: '메시지 또는 파일 중 하나는 필수입니다',
    statusCode: 400
  },

  // 일정
  EVENT_NOT_FOUND: {
    code: 'STUDY_901',
    message: '일정을 찾을 수 없습니다',
    statusCode: 404
  },
  INVALID_EVENT_TITLE: {
    code: 'STUDY_902',
    message: '일정 제목은 1자 이상 100자 이하여야 합니다',
    statusCode: 400
  },
  INVALID_EVENT_DATE: {
    code: 'STUDY_903',
    message: '시작일은 종료일보다 이전이어야 합니다',
    statusCode: 400
  },

  // 데이터베이스
  DB_ERROR: {
    code: 'STUDY_996',
    message: '데이터베이스 오류가 발생했습니다',
    statusCode: 500
  },
  DB_TRANSACTION_ERROR: {
    code: 'STUDY_997',
    message: '트랜잭션 처리 중 오류가 발생했습니다',
    statusCode: 500
  },
  CONCURRENT_UPDATE_ERROR: {
    code: 'STUDY_998',
    message: '동시 수정으로 인해 처리할 수 없습니다. 다시 시도해주세요',
    statusCode: 409
  },

  // 일반
  UNKNOWN_ERROR: {
    code: 'STUDY_999',
    message: '알 수 없는 오류가 발생했습니다',
    statusCode: 500
  }
};

/**
 * 스터디 에러 응답 생성
 * @param {string} errorKey - STUDY_ERRORS의 키
 * @param {string|null} customMessage - 커스텀 메시지 (선택사항)
 * @param {Object|null} details - 추가 상세 정보 (선택사항)
 * @returns {Object} 에러 응답 객체
 */
export function createStudyErrorResponse(errorKey, customMessage = null, details = null) {
  const error = STUDY_ERRORS[errorKey] || STUDY_ERRORS.UNKNOWN_ERROR;

  const response = {
    error: error.code,
    message: customMessage || error.message,
    statusCode: error.statusCode
  };

  if (details) {
    response.details = details;
  }

  return response;
}

/**
 * 스터디 에러 로깅
 * @param {string} context - 에러 발생 위치
 * @param {Error} error - 에러 객체
 * @param {Object} metadata - 추가 메타데이터
 */
export function logStudyError(context, error, metadata = {}) {
  console.error(`❌ [STUDY ERROR] ${context}:`, {
    message: error.message,
    code: error.code || 'UNKNOWN',
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    ...metadata,
    timestamp: new Date().toISOString()
  });
}

/**
 * Prisma 에러를 스터디 에러로 변환
 * @param {Error} error - Prisma 에러
 * @returns {Object} 변환된 에러 응답
 */
export function handlePrismaError(error) {
  // P2002: Unique constraint failed
  if (error.code === 'P2002') {
    return createStudyErrorResponse('DUPLICATE_STUDY_NAME');
  }

  // P2025: Record not found
  if (error.code === 'P2025') {
    return createStudyErrorResponse('STUDY_NOT_FOUND');
  }

  // P2003: Foreign key constraint failed
  if (error.code === 'P2003') {
    return createStudyErrorResponse('DB_ERROR', '참조 무결성 오류가 발생했습니다');
  }

  // 일반 데이터베이스 에러
  return createStudyErrorResponse('DB_ERROR');
}

/**
 * 스터디 에러 클래스
 */
export class StudyError extends Error {
  constructor(errorKey, customMessage = null, details = null) {
    const error = STUDY_ERRORS[errorKey] || STUDY_ERRORS.UNKNOWN_ERROR;
    super(customMessage || error.message);
    this.name = 'StudyError';
    this.code = error.code;
    this.statusCode = error.statusCode;
    this.details = details;
  }
}

