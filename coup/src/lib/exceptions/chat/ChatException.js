/**
 * Chat 영역 기본 예외 클래스
 *
 * @description
 * 모든 채팅 관련 예외의 기본 클래스
 * 에러 코드, 사용자 메시지, 개발자 메시지, 재시도 가능 여부 등을 관리
 *
 * @example
 * throw new ChatException('CHAT-001', 'Error occurred', {
 *   userMessage: '채팅 오류가 발생했습니다',
 *   devMessage: 'Socket connection failed',
 *   retryable: true,
 *   context: { userId: '123', studyId: '456' }
 * });
 */
export class ChatException extends Error {
  /**
   * @param {string} code - 에러 코드 (예: CHAT-CONN-001)
   * @param {string} message - 기본 에러 메시지
   * @param {Object} details - 추가 상세 정보
   * @param {string} details.userMessage - 사용자에게 표시할 메시지
   * @param {string} details.devMessage - 개발자용 메시지
   * @param {boolean} details.retryable - 재시도 가능 여부
   * @param {Object} details.context - 에러 발생 컨텍스트
   * @param {string} details.category - 에러 카테고리
   */
  constructor(code, message, details = {}) {
    super(message);

    this.name = 'ChatException';
    this.code = code;
    this.userMessage = details.userMessage || message;
    this.devMessage = details.devMessage || message;
    this.retryable = details.retryable ?? false;
    this.timestamp = new Date().toISOString();
    this.context = details.context || {};
    this.category = details.category || 'general';

    // 스택 트레이스 캡처
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ChatException);
    }
  }

  /**
   * 에러를 JSON으로 직렬화
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      devMessage: this.devMessage,
      retryable: this.retryable,
      timestamp: this.timestamp,
      context: this.context,
      category: this.category,
    };
  }

  /**
   * 사용자 친화적인 에러 메시지 반환
   */
  getUserFriendlyMessage() {
    return this.userMessage;
  }

  /**
   * 개발자용 상세 메시지 반환
   */
  getDeveloperMessage() {
    return `[${this.code}] ${this.devMessage}`;
  }

  /**
   * 에러 로깅용 포맷
   */
  toLogFormat() {
    return {
      timestamp: this.timestamp,
      code: this.code,
      category: this.category,
      message: this.devMessage,
      context: this.context,
      stack: this.stack,
    };
  }
}

