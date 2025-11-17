// src/lib/utils/logger.js
import winston from 'winston'
import { join } from 'path'

const { combine, timestamp, printf, colorize, errors } = winston.format

// 로그 포맷 정의
const logFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`
  
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`
  }
  
  if (stack) {
    msg += `\n${stack}`
  }
  
  return msg
})

// 로거 생성
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  defaultMeta: { service: 'coup-api' },
  transports: [
    // 콘솔 출력
    new winston.transports.Console({
      format: combine(
        colorize(),
        logFormat
      )
    }),
    
    // 에러 로그 파일
    new winston.transports.File({
      filename: join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // 전체 로그 파일
    new winston.transports.File({
      filename: join(process.cwd(), 'logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
})

// 개발 환경에서는 더 자세한 로그
if (process.env.NODE_ENV === 'development') {
  logger.level = 'debug'
}

// 헬퍼 함수
export const log = {
  info: (message, meta = {}) => logger.info(message, meta),
  warn: (message, meta = {}) => logger.warn(message, meta),
  error: (message, error = null, meta = {}) => {
    if (error instanceof Error) {
      logger.error(message, { ...meta, error: error.message, stack: error.stack })
    } else {
      logger.error(message, meta)
    }
  },
  debug: (message, meta = {}) => logger.debug(message, meta),
}

export default logger

