import { ChatException } from './ChatException.js';

/**
 * Chat 메시지 예외 클래스
 *
 * @description
 * 메시지 송수신 관련 예외를 처리
 * - 전송 실패
 * - 수신 실패
 * - 유효성 검증 실패
 * - 권한 오류
 *
 * @extends ChatException
 */
export class ChatMessageException extends ChatException {
  constructor(code, message, details = {}) {
    super(code, message, {
      ...details,
      category: 'message'
    });
    this.name = 'ChatMessageException';
  }

  /**
   * 메시지 전송 실패 (네트워크)
   */
  static sendFailedNetwork(context = {}) {
    return new ChatMessageException(
      'CHAT-MSG-001',
      'Message send failed: network error',
      {
        userMessage: '메시지 전송에 실패했습니다. 다시 시도해주세요',
        devMessage: 'Network error occurred while sending message',
        retryable: true,
        context
      }
    );
  }

  /**
   * 메시지 전송 실패 (서버)
   */
  static sendFailedServer(context = {}) {
    return new ChatMessageException(
      'CHAT-MSG-002',
      'Message send failed: server error',
      {
        userMessage: '메시지를 전송할 수 없습니다. 잠시 후 다시 시도해주세요',
        devMessage: 'Server error occurred while processing message',
        retryable: true,
        context
      }
    );
  }

  /**
   * 빈 메시지
   */
  static emptyContent(context = {}) {
    return new ChatMessageException(
      'CHAT-MSG-003',
      'Empty message content',
      {
        userMessage: '메시지 내용을 입력해주세요',
        devMessage: 'Message content is empty or whitespace only',
        retryable: false,
        context
      }
    );
  }

  /**
   * 메시지 길이 초과
   */
  static contentTooLong(length, maxLength = 2000, context = {}) {
    return new ChatMessageException(
      'CHAT-MSG-004',
      `Message too long (${length} > ${maxLength} chars)`,
      {
        userMessage: `메시지는 ${maxLength}자 이하여야 합니다`,
        devMessage: `Message length ${length} exceeds maximum ${maxLength}`,
        retryable: false,
        context: { ...context, length, maxLength }
      }
    );
  }

  /**
   * 스팸 감지
   */
  static spamDetected(messageCount, timeWindow, context = {}) {
    return new ChatMessageException(
      'CHAT-MSG-005',
      `Spam detected: ${messageCount} messages in ${timeWindow}s`,
      {
        userMessage: '메시지를 너무 빠르게 전송하고 있습니다',
        devMessage: `Rate limit exceeded: ${messageCount} messages in ${timeWindow} seconds`,
        retryable: true,
        context: { ...context, messageCount, timeWindow }
      }
    );
  }

  /**
   * XSS 시도 감지
   */
  static xssDetected(threats, context = {}) {
    return new ChatMessageException(
      'CHAT-MSG-006',
      'XSS attempt detected',
      {
        userMessage: '메시지에 허용되지 않는 내용이 포함되어 있습니다',
        devMessage: `XSS threats detected: ${threats.join(', ')}`,
        retryable: false,
        context: { ...context, threats }
      }
    );
  }

  /**
   * 메시지 조회 실패
   */
  static fetchFailed(context = {}) {
    return new ChatMessageException(
      'CHAT-MSG-007',
      'Failed to fetch messages',
      {
        userMessage: '메시지를 불러올 수 없습니다',
        devMessage: 'Database query failed while fetching messages',
        retryable: true,
        context
      }
    );
  }

  /**
   * 메시지 수정 권한 없음
   */
  static unauthorizedEdit(context = {}) {
    return new ChatMessageException(
      'CHAT-MSG-008',
      'Unauthorized message edit',
      {
        userMessage: '메시지를 수정할 권한이 없습니다',
        devMessage: 'User does not have permission to edit this message',
        retryable: false,
        context
      }
    );
  }

  /**
   * 메시지 삭제 권한 없음
   */
  static unauthorizedDelete(context = {}) {
    return new ChatMessageException(
      'CHAT-MSG-009',
      'Unauthorized message delete',
      {
        userMessage: '메시지를 삭제할 권한이 없습니다',
        devMessage: 'User does not have permission to delete this message',
        retryable: false,
        context
      }
    );
  }

  /**
   * 메시지를 찾을 수 없음
   */
  static notFound(messageId, context = {}) {
    return new ChatMessageException(
      'CHAT-MSG-010',
      'Message not found',
      {
        userMessage: '메시지를 찾을 수 없습니다',
        devMessage: `Message with ID ${messageId} not found`,
        retryable: false,
        context: { ...context, messageId }
      }
    );
  }

  /**
   * 중복 메시지 (내부 로깅용)
   */
  static duplicate(messageId, context = {}) {
    return new ChatMessageException(
      'CHAT-MSG-011',
      'Duplicate message ignored',
      {
        userMessage: '', // 사용자에게 표시 안 함
        devMessage: `Duplicate message ${messageId} ignored`,
        retryable: false,
        context: { ...context, messageId }
      }
    );
  }

  /**
   * 메시지 순서 불일치 (내부 로깅용)
   */
  static orderInconsistency(context = {}) {
    return new ChatMessageException(
      'CHAT-MSG-012',
      'Message order inconsistency',
      {
        userMessage: '', // 사용자에게 표시 안 함
        devMessage: 'Message order inconsistency detected and corrected',
        retryable: false,
        context
      }
    );
  }
}

