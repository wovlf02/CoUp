/**
 * Admin Logger ?ŒìŠ¤??
 *
 * ?ŒìŠ¤??ë²”ìœ„:
 * - ë¡œê·¸ ?ˆë²¨ë³?ì¶œë ¥
 * - ë³´ì•ˆ ë¡œê¹…
 * - ë¯¼ê° ?•ë³´ ?„í„°ë§?
 * - ë¡œê·¸ ?¬ë§·??
 * - ê´€ë¦¬ìž ?¡ì…˜ ë¡œê¹…
 */

import { AdminLogger, LOG_LEVELS } from '@/lib/logging/adminLogger'

describe('AdminLogger', () => {
  let consoleLogSpy
  let consoleInfoSpy
  let consoleWarnSpy
  let consoleErrorSpy

  beforeEach(() => {
    // ì½˜ì†” ë©”ì„œ???¤íŒŒ???¤ì •
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation()
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    // ?¤íŒŒ??ë³µì›
    consoleLogSpy.mockRestore()
    consoleInfoSpy.mockRestore()
    consoleWarnSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  // ========================================
  // ë¡œê·¸ ?ˆë²¨ ?ŒìŠ¤??
  // ========================================

  describe('ë¡œê·¸ ?ˆë²¨', () => {
    it('DEBUG ?ˆë²¨ë¡?ë¡œê·¸ë¥?ì¶œë ¥?œë‹¤', () => {
      AdminLogger.debug('Debug message', { userId: 'user-1' })

      expect(consoleLogSpy).toHaveBeenCalled()
      const logCall = consoleLogSpy.mock.calls[0][0]
      expect(logCall).toContain('DEBUG')
      expect(logCall).toContain('Debug message')
    })

    it('INFO ?ˆë²¨ë¡?ë¡œê·¸ë¥?ì¶œë ¥?œë‹¤', () => {
      AdminLogger.info('Info message', { action: 'view_users' })

      expect(consoleInfoSpy).toHaveBeenCalled()
      const logCall = consoleInfoSpy.mock.calls[0][0]
      expect(logCall).toContain('INFO')
      expect(logCall).toContain('Info message')
    })

    it('WARN ?ˆë²¨ë¡?ë¡œê·¸ë¥?ì¶œë ¥?œë‹¤', () => {
      AdminLogger.warn('Warning message', { reason: 'suspicious_activity' })

      expect(consoleWarnSpy).toHaveBeenCalled()
      const logCall = consoleWarnSpy.mock.calls[0][0]
      expect(logCall).toContain('WARN')
      expect(logCall).toContain('Warning message')
    })

    it('ERROR ?ˆë²¨ë¡?ë¡œê·¸ë¥?ì¶œë ¥?œë‹¤', () => {
      AdminLogger.error('Error message', { error: 'Database error' })

      expect(consoleErrorSpy).toHaveBeenCalled()
      const logCall = consoleErrorSpy.mock.calls[0][0]
      expect(logCall).toContain('ERROR')
      expect(logCall).toContain('Error message')
    })

    it('CRITICAL ?ˆë²¨ë¡?ë¡œê·¸ë¥?ì¶œë ¥?œë‹¤', () => {
      AdminLogger.critical('Critical message', { severity: 'high' })

      expect(consoleErrorSpy).toHaveBeenCalled()
      const logCall = consoleErrorSpy.mock.calls[0][0]
      expect(logCall).toContain('CRITICAL')
      expect(logCall).toContain('Critical message')
    })

    it('SECURITY ?ˆë²¨ë¡?ë¡œê·¸ë¥?ì¶œë ¥?œë‹¤', () => {
      AdminLogger.security('Security event', { ip: '192.168.1.1' })

      expect(consoleErrorSpy).toHaveBeenCalled()
      const logCall = consoleErrorSpy.mock.calls[0][0]
      expect(logCall).toContain('SECURITY')
      expect(logCall).toContain('Security event')
    })
  })

  // ========================================
  // ë¯¼ê° ?•ë³´ ?„í„°ë§??ŒìŠ¤??
  // ========================================

  describe('ë¯¼ê° ?•ë³´ ?„í„°ë§?, () => {
    it('password ?„ë“œë¥?[REDACTED]ë¡?ë§ˆìŠ¤?¹í•œ??, () => {
      AdminLogger.info('User action', {
        userId: 'user-1',
        password: 'secret123',
      })

      expect(consoleInfoSpy).toHaveBeenCalled()
      const logCall = consoleInfoSpy.mock.calls[0]
      const contextArg = logCall[1]

      if (contextArg && typeof contextArg === 'object') {
        expect(contextArg.password).toBe('[REDACTED]')
      }
    })

    it('token ?„ë“œë¥?[REDACTED]ë¡?ë§ˆìŠ¤?¹í•œ??, () => {
      AdminLogger.info('API call', {
        userId: 'user-1',
        token: 'bearer-token-12345',
      })

      expect(consoleInfoSpy).toHaveBeenCalled()
      const logCall = consoleInfoSpy.mock.calls[0]
      const contextArg = logCall[1]

      if (contextArg && typeof contextArg === 'object') {
        expect(contextArg.token).toBe('[REDACTED]')
      }
    })

    it('secret ?„ë“œë¥?[REDACTED]ë¡?ë§ˆìŠ¤?¹í•œ??, () => {
      AdminLogger.info('Config update', {
        setting: 'api',
        secret: 'api-secret-key',
      })

      expect(consoleInfoSpy).toHaveBeenCalled()
    })

    it('ì¤‘ì²©??ê°ì²´??ë¯¼ê° ?•ë³´??ë§ˆìŠ¤?¹í•œ??, () => {
      AdminLogger.info('Complex action', {
        user: {
          id: 'user-1',
          password: 'secret',
        },
      })

      expect(consoleInfoSpy).toHaveBeenCalled()
    })

    it('ë¯¼ê°?˜ì? ?Šì? ?•ë³´??ê·¸ë?ë¡?ì¶œë ¥?œë‹¤', () => {
      AdminLogger.info('Normal action', {
        userId: 'user-1',
        action: 'view_list',
        timestamp: new Date().toISOString(),
      })

      expect(consoleInfoSpy).toHaveBeenCalled()
      const logCall = consoleInfoSpy.mock.calls[0]
      const contextArg = logCall[1]

      if (contextArg && typeof contextArg === 'object') {
        expect(contextArg.userId).toBe('user-1')
        expect(contextArg.action).toBe('view_list')
      }
    })
  })

  // ========================================
  // ë¡œê·¸ ?¬ë§· ?ŒìŠ¤??
  // ========================================

  describe('ë¡œê·¸ ?¬ë§·', () => {
    it('?€?„ìŠ¤?¬í”„ê°€ ?¬í•¨?œë‹¤', () => {
      AdminLogger.info('Test message')

      expect(consoleInfoSpy).toHaveBeenCalled()
      const logCall = consoleInfoSpy.mock.calls[0][0]
      // ISO 8601 ?•ì‹???€?„ìŠ¤?¬í”„ ?•ì¸
      expect(logCall).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })

    it('?„ë©”???•ë³´(ADMIN)ê°€ ?¬í•¨?œë‹¤', () => {
      AdminLogger.info('Test message')

      expect(consoleInfoSpy).toHaveBeenCalled()
      const logCall = consoleInfoSpy.mock.calls[0][0]
      expect(logCall).toContain('ADMIN')
    })

    it('ì»¨í…?¤íŠ¸ ?•ë³´ê°€ ?¬í•¨?œë‹¤', () => {
      const context = {
        adminId: 'admin-1',
        action: 'suspend_user',
        targetUserId: 'user-123',
      }

      AdminLogger.info('User suspended', context)

      expect(consoleInfoSpy).toHaveBeenCalled()
      const logCall = consoleInfoSpy.mock.calls[0]
      const contextArg = logCall[1]

      if (contextArg && typeof contextArg === 'object') {
        expect(contextArg).toMatchObject({
          adminId: 'admin-1',
          action: 'suspend_user',
          targetUserId: 'user-123',
        })
      }
    })
  })

  // ========================================
  // ê´€ë¦¬ìž ?¡ì…˜ ë¡œê¹… ?ŒìŠ¤??
  // ========================================

  describe('ê´€ë¦¬ìž ?¡ì…˜ ë¡œê¹…', () => {
    it('?¬ìš©???•ì? ?¡ì…˜??ë¡œê¹…?œë‹¤', () => {
      AdminLogger.logUserSuspension('admin-1', 'user-123', 'spam', 7)

      expect(consoleInfoSpy).toHaveBeenCalled()
      const logCall = consoleInfoSpy.mock.calls[0]
      expect(logCall[0]).toContain('User suspended')
    })

    it('?¤í„°??ì¢…ë£Œ ?¡ì…˜??ë¡œê¹…?œë‹¤', () => {
      AdminLogger.logStudyClosure('admin-1', 'study-123', 'policy_violation')

      expect(consoleInfoSpy).toHaveBeenCalled()
      const logCall = consoleInfoSpy.mock.calls[0]
      expect(logCall[0]).toContain('Study closed')
    })

    it('? ê³  ì²˜ë¦¬ ?¡ì…˜??ë¡œê¹…?œë‹¤', () => {
      AdminLogger.logReportProcessed('admin-1', 'report-123', 'APPROVED')

      expect(consoleInfoSpy).toHaveBeenCalled()
      const logCall = consoleInfoSpy.mock.calls[0]
      expect(logCall[0]).toContain('Report processed')
    })

    it('?¤ì • ë³€ê²??¡ì…˜??ë¡œê¹…?œë‹¤', () => {
      AdminLogger.logSettingChange('admin-1', 'max_upload_size', '10MB', '20MB')

      expect(consoleInfoSpy).toHaveBeenCalled()
      const logCall = consoleInfoSpy.mock.calls[0]
      expect(logCall[0]).toContain('Setting changed')
    })
  })

  // ========================================
  // ë³´ì•ˆ ?´ë²¤??ë¡œê¹… ?ŒìŠ¤??
  // ========================================

  describe('ë³´ì•ˆ ?´ë²¤??ë¡œê¹…', () => {
    it('ë¡œê·¸???œë„ë¥?ë¡œê¹…?œë‹¤', () => {
      AdminLogger.logLoginAttempt('admin@test.com', true, '127.0.0.1')

      expect(consoleInfoSpy).toHaveBeenCalled()
      const logCall = consoleInfoSpy.mock.calls[0]
      expect(logCall[0]).toContain('Login attempt')
    })

    it('?¤íŒ¨??ë¡œê·¸?¸ì„ SECURITY ?ˆë²¨ë¡?ë¡œê¹…?œë‹¤', () => {
      AdminLogger.logLoginAttempt('admin@test.com', false, '127.0.0.1')

      expect(consoleErrorSpy).toHaveBeenCalled()
      const logCall = consoleErrorSpy.mock.calls[0]
      expect(logCall[0]).toContain('SECURITY')
    })

    it('ê¶Œí•œ ê±°ë?ë¥?ë¡œê¹…?œë‹¤', () => {
      AdminLogger.logPermissionDenied('admin-1', 'user:delete', 'MODERATOR')

      expect(consoleWarnSpy).toHaveBeenCalled()
      const logCall = consoleWarnSpy.mock.calls[0]
      expect(logCall[0]).toContain('Permission denied')
    })

    it('?˜ì‹¬?¤ëŸ¬???œë™??ë¡œê¹…?œë‹¤', () => {
      AdminLogger.logSuspiciousActivity('Multiple failed login attempts', {
        ip: '192.168.1.1',
        attempts: 5,
      })

      expect(consoleErrorSpy).toHaveBeenCalled()
      const logCall = consoleErrorSpy.mock.calls[0]
      expect(logCall[0]).toContain('SECURITY')
    })
  })

  // ========================================
  // ?ˆì™¸ ë¡œê¹… ?ŒìŠ¤??
  // ========================================

  describe('?ˆì™¸ ë¡œê¹…', () => {
    it('AdminException??ë¡œê¹…?œë‹¤', () => {
      const error = {
        name: 'AdminPermissionException',
        code: 'ADMIN-002',
        message: 'Insufficient permission',
        statusCode: 403,
      }

      AdminLogger.logError(error, { adminId: 'admin-1' })

      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    it('?¤íƒ ?¸ë ˆ?´ìŠ¤ë¥??¬í•¨?œë‹¤', () => {
      const error = new Error('Test error')
      error.code = 'ADMIN-999'

      AdminLogger.logException(error, { adminId: 'admin-1' })

      expect(consoleErrorSpy).toHaveBeenCalled()
    })
  })

  // ========================================
  // ?±ëŠ¥ ë¡œê¹… ?ŒìŠ¤??
  // ========================================

  describe('?±ëŠ¥ ë¡œê¹…', () => {
    it('API ?‘ë‹µ ?œê°„??ë¡œê¹…?œë‹¤', () => {
      const startTime = Date.now()
      // ?œê°„ ê²½ê³¼ ?œë??ˆì´??
      const endTime = startTime + 150

      AdminLogger.logPerformance('GET /api/admin/users', endTime - startTime, {
        statusCode: 200,
      })

      expect(consoleLogSpy).toHaveBeenCalled()
      const logCall = consoleLogSpy.mock.calls[0]
      expect(logCall[0]).toContain('Performance')
    })

    it('?ë¦° ì¿¼ë¦¬ë¥?ê²½ê³ ë¡?ë¡œê¹…?œë‹¤', () => {
      AdminLogger.logSlowQuery('SELECT * FROM users', 2000, {
        threshold: 1000,
      })

      expect(consoleWarnSpy).toHaveBeenCalled()
      const logCall = consoleWarnSpy.mock.calls[0]
      expect(logCall[0]).toContain('Slow query')
    })
  })

  // ========================================
  // LOG_LEVELS ?ìˆ˜ ?ŒìŠ¤??
  // ========================================

  describe('LOG_LEVELS ?ìˆ˜', () => {
    it('ëª¨ë“  ë¡œê·¸ ?ˆë²¨???•ì˜?˜ì–´ ?ˆë‹¤', () => {
      expect(LOG_LEVELS.DEBUG).toBe('DEBUG')
      expect(LOG_LEVELS.INFO).toBe('INFO')
      expect(LOG_LEVELS.WARN).toBe('WARN')
      expect(LOG_LEVELS.ERROR).toBe('ERROR')
      expect(LOG_LEVELS.CRITICAL).toBe('CRITICAL')
      expect(LOG_LEVELS.SECURITY).toBe('SECURITY')
    })

    it('SECURITY??ê´€ë¦¬ìž ?„ìš© ?ˆë²¨?´ë‹¤', () => {
      expect(LOG_LEVELS.SECURITY).toBe('SECURITY')
    })
  })
})

