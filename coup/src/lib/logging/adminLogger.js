/**
 * adminLogger.js
 *
 * Admin 도메인 전용 구조화된 로깅 시스템
 * AdminException과 통합되어 일관된 로깅 제공
 * 보안 감사 로깅 강화
 *
 * @module lib/logging/adminLogger
 * @author CoUp Team
 * @created 2025-12-02
 */

import { AdminException } from '@/lib/exceptions/admin';

// ============================================
// 로그 레벨 및 설정
// ============================================

/**
 * 로그 레벨 정의
 */
export const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  CRITICAL: 'CRITICAL',
  SECURITY: 'SECURITY' // Admin 전용 보안 로그
};

/**
 * 로그 레벨 우선순위
 */
const LOG_LEVEL_PRIORITY = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  CRITICAL: 4,
  SECURITY: 5 // 최상위
};

/**
 * 환경별 최소 로그 레벨
 */
const MIN_LOG_LEVEL = process.env.NODE_ENV === 'production' ? 'INFO' : 'DEBUG';

/**
 * 로그 출력 여부 확인
 */
function shouldLog(level) {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[MIN_LOG_LEVEL];
}

/**
 * 보안 민감 정보 필터링
 *
 * @param {Object} data - 원본 데이터
 * @returns {Object} 필터링된 데이터
 */
function sanitizeSensitiveData(data) {
  if (!data || typeof data !== 'object') return data;

  const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'sessionId', 'creditCard'];
  const sanitized = { ...data };

  Object.keys(sanitized).forEach(key => {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeSensitiveData(sanitized[key]);
    }
  });

  return sanitized;
}

// ============================================
// 로그 포맷팅
// ============================================

/**
 * 로그 엔트리 생성
 *
 * @param {string} level - 로그 레벨
 * @param {string} message - 로그 메시지
 * @param {Object} context - 컨텍스트 정보
 * @returns {Object} 포맷된 로그 엔트리
 */
function createLogEntry(level, message, context = {}) {
  const timestamp = new Date().toISOString();

  // 보안 민감 정보 필터링
  const sanitizedContext = sanitizeSensitiveData(context);

  return {
    level,
    message,
    timestamp,
    domain: 'admin',
    environment: process.env.NODE_ENV || 'development',
    ...sanitizedContext
  };
}

/**
 * 로그 출력
 *
 * @param {Object} logEntry - 로그 엔트리
 */
function outputLog(logEntry) {
  const { level, message, timestamp, ...rest } = logEntry;

  // 콘솔 출력
  const consoleMethod = {
    DEBUG: 'log',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
    CRITICAL: 'error',
    SECURITY: 'error'
  }[level];

  if (process.env.NODE_ENV === 'production') {
    // 프로덕션: JSON 형식 (구조화된 로깅)
    console[consoleMethod](JSON.stringify(logEntry));
  } else {
    // 개발: 가독성 있는 형식
    const icon = level === 'SECURITY' ? '🔒' : '🔑';
    console[consoleMethod](
      `${icon} [${timestamp}] [${level}] [ADMIN] ${message}`,
      Object.keys(rest).length > 0 ? rest : ''
    );
  }

  // TODO: 외부 모니터링 서비스 전송
  // - Sentry (에러 추적)
  // - SIEM (보안 정보 및 이벤트 관리)
  // - CloudWatch (AWS)
  // - Splunk (로그 분석)
}

// ============================================
// 핵심 로깅 클래스
// ============================================

/**
 * Admin Logger 클래스
 */
export class AdminLogger {
  /**
   * 일반 로그
   *
   * @param {string} level - 로그 레벨
   * @param {string} message - 로그 메시지
   * @param {Object} context - 컨텍스트 정보
   */
  static log(level, message, context = {}) {
    if (!shouldLog(level)) return;

    const logEntry = createLogEntry(level, message, context);
    outputLog(logEntry);
  }

  /**
   * DEBUG 레벨 로그
   *
   * @param {string} message - 로그 메시지
   * @param {Object} context - 컨텍스트 정보
   */
  static debug(message, context = {}) {
    this.log(LOG_LEVELS.DEBUG, message, context);
  }

  /**
   * INFO 레벨 로그
   *
   * @param {string} message - 로그 메시지
   * @param {Object} context - 컨텍스트 정보
   */
  static info(message, context = {}) {
    this.log(LOG_LEVELS.INFO, message, context);
  }

  /**
   * WARN 레벨 로그
   *
   * @param {string} message - 로그 메시지
   * @param {Object} context - 컨텍스트 정보
   */
  static warn(message, context = {}) {
    this.log(LOG_LEVELS.WARN, message, context);
  }

  /**
   * ERROR 레벨 로그
   *
   * @param {string} message - 로그 메시지
   * @param {Object} context - 컨텍스트 정보
   */
  static error(message, context = {}) {
    this.log(LOG_LEVELS.ERROR, message, context);
  }

  /**
   * CRITICAL 레벨 로그
   *
   * @param {string} message - 로그 메시지
   * @param {Object} context - 컨텍스트 정보
   */
  static critical(message, context = {}) {
    this.log(LOG_LEVELS.CRITICAL, message, context);
  }

  /**
   * SECURITY 레벨 로그 (관리자 전용)
   *
   * @param {string} message - 로그 메시지
   * @param {Object} context - 컨텍스트 정보
   */
  static security(message, context = {}) {
    this.log(LOG_LEVELS.SECURITY, message, {
      ...context,
      securityAlert: true
    });
  }

  // ============================================
  // AdminException 통합 로깅
  // ============================================

  /**
   * AdminException 로깅
   *
   * @param {AdminException|Error} error - 에러 객체
   * @param {Object} additionalContext - 추가 컨텍스트
   *
   * @example
   * try {
   *   // ...
   * } catch (error) {
   *   AdminLogger.logError(error, { adminId, action, targetId });
   *   throw error;
   * }
   */
  static logError(error, additionalContext = {}) {
    if (error instanceof AdminException) {
      const level = this._mapSeverityToLogLevel(error.severity, error.securityLevel);

      this.log(level, error.devMessage, {
        action: 'exception',
        code: error.code,
        userMessage: error.userMessage,
        devMessage: error.devMessage,
        severity: error.severity,
        securityLevel: error.securityLevel,
        category: error.category,
        retryable: error.retryable,
        statusCode: error.statusCode,
        errorContext: error.context,
        stack: error.stack,
        ...additionalContext
      });
    } else {
      // 일반 에러
      this.error(error.message, {
        action: 'error',
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...additionalContext
      });
    }
  }

  /**
   * Severity와 SecurityLevel을 로그 레벨로 매핑
   *
   * @param {string} severity - 에러 심각도
   * @param {string} securityLevel - 보안 레벨
   * @returns {string} 로그 레벨
   */
  static _mapSeverityToLogLevel(severity, securityLevel = 'normal') {
    // 보안 레벨이 높으면 SECURITY 레벨 사용
    if (securityLevel === 'critical' || securityLevel === 'high') {
      return LOG_LEVELS.SECURITY;
    }

    const mapping = {
      low: LOG_LEVELS.WARN,
      medium: LOG_LEVELS.ERROR,
      high: LOG_LEVELS.ERROR,
      critical: LOG_LEVELS.CRITICAL
    };
    return mapping[severity] || LOG_LEVELS.ERROR;
  }

  // ============================================
  // Admin 도메인 특화 로깅
  // ============================================

  /**
   * 관리자 로그인 로깅
   *
   * @param {string} adminId - 관리자 ID
   * @param {boolean} success - 성공 여부
   * @param {Object} context - 추가 컨텍스트
   */
  static logAdminLogin(adminId, success, context = {}) {
    const level = success ? LOG_LEVELS.INFO : LOG_LEVELS.SECURITY;
    const message = success
      ? `Admin login successful: ${adminId}`
      : `Admin login failed: ${adminId}`;

    this.log(level, message, {
      action: 'admin_login',
      adminId,
      success,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  /**
   * 관리자 작업 로깅
   *
   * @param {string} adminId - 관리자 ID
   * @param {string} action - 수행한 작업
   * @param {Object} context - 작업 컨텍스트
   */
  static logAdminAction(adminId, action, context = {}) {
    this.info(`Admin action: ${action}`, {
      action: 'admin_action',
      adminId,
      actionType: action,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  /**
   * 사용자 관리 작업 로깅
   *
   * @param {string} adminId - 관리자 ID
   * @param {string} targetUserId - 대상 사용자 ID
   * @param {string} action - 수행한 작업
   * @param {Object} context - 작업 컨텍스트
   */
  static logUserManagement(adminId, targetUserId, action, context = {}) {
    this.info(`User management: ${action} on ${targetUserId}`, {
      action: 'user_management',
      adminId,
      targetUserId,
      managementAction: action,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  /**
   * 신고 처리 로깅
   *
   * @param {string} adminId - 관리자 ID
   * @param {string} reportId - 신고 ID
   * @param {string} action - 처리 작업
   * @param {Object} context - 처리 컨텍스트
   */
  static logReportProcessing(adminId, reportId, action, context = {}) {
    this.info(`Report processing: ${action} on ${reportId}`, {
      action: 'report_processing',
      adminId,
      reportId,
      processingAction: action,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  /**
   * 시스템 설정 변경 로깅
   *
   * @param {string} adminId - 관리자 ID
   * @param {string} settingKey - 설정 키
   * @param {*} oldValue - 이전 값
   * @param {*} newValue - 새 값
   * @param {Object} context - 추가 컨텍스트
   */
  static logSettingChange(adminId, settingKey, oldValue, newValue, context = {}) {
    this.warn(`System setting changed: ${settingKey}`, {
      action: 'setting_change',
      adminId,
      settingKey,
      oldValue: sanitizeSensitiveData({ value: oldValue }).value,
      newValue: sanitizeSensitiveData({ value: newValue }).value,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  /**
   * 권한 거부 로깅
   *
   * @param {string} adminId - 관리자 ID
   * @param {string} attemptedAction - 시도한 작업
   * @param {string} requiredPermission - 필요한 권한
   * @param {Object} context - 추가 컨텍스트
   */
  static logPermissionDenied(adminId, attemptedAction, requiredPermission, context = {}) {
    this.security(`Permission denied: ${attemptedAction}`, {
      action: 'permission_denied',
      adminId,
      attemptedAction,
      requiredPermission,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  /**
   * 데이터베이스 오류 로깅
   *
   * @param {string} operation - 수행 중이던 작업
   * @param {Error} error - 에러 객체
   * @param {Object} context - 추가 컨텍스트
   */
  static logDatabaseError(operation, error, context = {}) {
    this.error(`Database error during ${operation}`, {
      action: 'database_error',
      operation,
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  /**
   * API 요청 시작 로깅
   *
   * @param {string} endpoint - API 엔드포인트
   * @param {string} method - HTTP 메서드
   * @param {Object} context - 요청 컨텍스트
   */
  static logApiRequest(endpoint, method, context = {}) {
    this.debug(`API Request: ${method} ${endpoint}`, {
      action: 'api_request',
      endpoint,
      method,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  /**
   * API 응답 로깅
   *
   * @param {string} endpoint - API 엔드포인트
   * @param {number} statusCode - HTTP 상태 코드
   * @param {number} duration - 처리 시간 (ms)
   * @param {Object} context - 응답 컨텍스트
   */
  static logApiResponse(endpoint, statusCode, duration, context = {}) {
    const level = statusCode >= 500 ? LOG_LEVELS.ERROR :
                  statusCode >= 400 ? LOG_LEVELS.WARN :
                  LOG_LEVELS.DEBUG;

    this.log(level, `API Response: ${statusCode} in ${duration}ms`, {
      action: 'api_response',
      endpoint,
      statusCode,
      duration,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  /**
   * 성능 측정 로깅
   *
   * @param {string} operation - 작업 이름
   * @param {number} duration - 소요 시간 (ms)
   * @param {Object} context - 추가 컨텍스트
   */
  static logPerformance(operation, duration, context = {}) {
    const level = duration > 5000 ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG;

    this.log(level, `Performance: ${operation} took ${duration}ms`, {
      action: 'performance',
      operation,
      duration,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  /**
   * 데이터 내보내기 로깅
   *
   * @param {string} adminId - 관리자 ID
   * @param {string} dataType - 내보낼 데이터 타입
   * @param {number} recordCount - 레코드 수
   * @param {Object} context - 추가 컨텍스트
   */
  static logDataExport(adminId, dataType, recordCount, context = {}) {
    this.warn(`Data export: ${dataType} (${recordCount} records)`, {
      action: 'data_export',
      adminId,
      dataType,
      recordCount,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  /**
   * 대량 작업 로깅
   *
   * @param {string} adminId - 관리자 ID
   * @param {string} operation - 작업 유형
   * @param {number} affectedCount - 영향받은 레코드 수
   * @param {Object} context - 추가 컨텍스트
   */
  static logBulkOperation(adminId, operation, affectedCount, context = {}) {
    this.warn(`Bulk operation: ${operation} (${affectedCount} records)`, {
      action: 'bulk_operation',
      adminId,
      operation,
      affectedCount,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  /**
   * 보안 이벤트 로깅
   *
   * @param {string} eventType - 이벤트 타입
   * @param {string} severity - 심각도
   * @param {Object} context - 이벤트 컨텍스트
   */
  static logSecurityEvent(eventType, severity, context = {}) {
    this.security(`Security event: ${eventType}`, {
      action: 'security_event',
      eventType,
      severity,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  /**
   * 사용자 정지 액션 로깅
   */
  static logUserSuspension(adminId, userId, reason, days, context = {}) {
    this.info(`User suspended: ${userId} for ${days} days`, {
      action: 'user_suspension',
      adminId,
      userId,
      reason,
      days,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  /**
   * 스터디 종료 액션 로깅
   */
  static logStudyClosure(adminId, studyId, reason, context = {}) {
    this.info(`Study closed: ${studyId}`, {
      action: 'study_closure',
      adminId,
      studyId,
      reason,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  /**
   * 신고 처리 액션 로깅
   */
  static logReportProcessed(adminId, reportId, action, context = {}) {
    this.info(`Report processed: ${reportId} - ${action}`, {
      action: 'report_processed',
      adminId,
      reportId,
      processingAction: action,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  /**
   * 로그인 시도 로깅
   */
  static logLoginAttempt(email, success, ip, context = {}) {
    if (success) {
      this.info(`Login attempt: ${email}`, {
        action: 'login_attempt',
        email,
        success,
        ip,
        timestamp: new Date().toISOString(),
        ...context
      });
    } else {
      this.security(`Failed login attempt: ${email}`, {
        action: 'login_attempt',
        email,
        success,
        ip,
        timestamp: new Date().toISOString(),
        ...context
      });
    }
  }

  /**
   * 권한 거부 로깅
   */
  static logPermissionDenied(adminId, permission, role, context = {}) {
    this.warn(`Permission denied: ${adminId}`, {
      action: 'permission_denied',
      adminId,
      permission,
      role,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  /**
   * 의심스러운 활동 로깅
   */
  static logSuspiciousActivity(description, context = {}) {
    this.security(`Suspicious activity: ${description}`, {
      action: 'suspicious_activity',
      description,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  /**
   * 예외 로깅
   */
  static logException(error, context = {}) {
    this.error(`Exception occurred: ${error.message}`, {
      action: 'exception',
      name: error.name,
      code: error.code,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  /**
   * 느린 쿼리 로깅
   */
  static logSlowQuery(query, duration, context = {}) {
    this.warn(`Slow query: ${query.substring(0, 100)}`, {
      action: 'slow_query',
      query,
      duration,
      timestamp: new Date().toISOString(),
      ...context
    });
  }
}

// ============================================
// 유틸리티 함수
// ============================================

/**
 * Request 객체에서 컨텍스트 추출
 *
 * @param {Request} request - Next.js Request 객체
 * @returns {Object} 추출된 컨텍스트
 */
export function extractRequestContext(request) {
  if (!request) return {};

  try {
    const url = new URL(request.url);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    return {
      method: request.method,
      path: url.pathname,
      query: Object.fromEntries(url.searchParams),
      userAgent,
      ip,
      referer: request.headers.get('referer') || 'unknown'
    };
  } catch (error) {
    return { error: 'Failed to extract request context' };
  }
}

/**
 * Error 객체에서 컨텍스트 추출
 *
 * @param {Error} error - 에러 객체
 * @returns {Object} 추출된 컨텍스트
 */
export function extractErrorContext(error) {
  if (!error) return {};

  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
    code: error.code,
    ...(error.context || {})
  };
}

/**
 * 성능 측정 래퍼
 *
 * @param {Function} fn - 실행할 함수
 * @param {string} operationName - 작업 이름
 * @returns {Promise<*>} 함수 실행 결과
 *
 * @example
 * const result = await measurePerformance(
 *   () => fetchUsers(),
 *   'fetchUsers'
 * );
 */
export async function measurePerformance(fn, operationName) {
  const startTime = Date.now();

  try {
    const result = await fn();
    const duration = Date.now() - startTime;

    AdminLogger.logPerformance(operationName, duration, {
      success: true
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    AdminLogger.logPerformance(operationName, duration, {
      success: false,
      error: error.message
    });

    throw error;
  }
}

// ============================================
// EXPORTS
// ============================================

export default AdminLogger;

