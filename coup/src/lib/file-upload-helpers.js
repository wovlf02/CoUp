/**
 * 파일 업로드 유틸리티
 * @module lib/file-upload-helpers
 */

import { createStudyErrorResponse } from './exceptions/study-errors.js';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

/**
 * 허용된 파일 타입 및 MIME 타입
 */
export const ALLOWED_FILE_TYPES = {
  // 문서
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  'text/plain': ['.txt'],
  'text/csv': ['.csv'],

  // 이미지
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'image/svg+xml': ['.svg'],

  // 압축 파일
  'application/zip': ['.zip'],
  'application/x-rar-compressed': ['.rar'],
  'application/x-7z-compressed': ['.7z'],

  // 코드
  'text/javascript': ['.js'],
  'text/html': ['.html'],
  'text/css': ['.css'],
  'application/json': ['.json'],
  'text/markdown': ['.md'],
  'application/x-python': ['.py'],
  'text/x-java-source': ['.java']
};

/**
 * 위험한 파일 확장자 목록
 */
export const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.msi', '.scr',
  '.vbs', '.js', '.jar', '.app', '.deb', '.rpm',
  '.sh', '.ps1', '.dll', '.so', '.dylib'
];

/**
 * 파일 크기 제한 (바이트)
 */
export const FILE_SIZE_LIMITS = {
  DEFAULT: 50 * 1024 * 1024, // 50MB
  IMAGE: 10 * 1024 * 1024,   // 10MB
  DOCUMENT: 25 * 1024 * 1024, // 25MB
  ARCHIVE: 100 * 1024 * 1024  // 100MB
};

/**
 * 스터디별 저장 공간 제한 (바이트)
 */
export const STORAGE_LIMIT_PER_STUDY = 1 * 1024 * 1024 * 1024; // 1GB

/**
 * 파일 타입 검증
 * @param {string} filename - 파일 이름
 * @param {string} mimetype - MIME 타입
 * @returns {Object} { valid: boolean, error?: Object }
 */
export function validateFileType(filename, mimetype) {
  const ext = path.extname(filename).toLowerCase();

  // 위험한 확장자 확인
  if (DANGEROUS_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: createStudyErrorResponse('INVALID_FILE_TYPE', `보안상의 이유로 ${ext} 파일은 업로드할 수 없습니다`)
    };
  }

  // 허용된 MIME 타입 확인
  const allowedExtensions = ALLOWED_FILE_TYPES[mimetype];
  if (!allowedExtensions || !allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: createStudyErrorResponse('INVALID_FILE_TYPE', `${ext} 파일 형식은 지원되지 않습니다`)
    };
  }

  return { valid: true };
}

/**
 * 파일 크기 검증
 * @param {number} fileSize - 파일 크기 (바이트)
 * @param {string} mimetype - MIME 타입
 * @returns {Object} { valid: boolean, error?: Object }
 */
export function validateFileSize(fileSize, mimetype) {
  let limit = FILE_SIZE_LIMITS.DEFAULT;

  // MIME 타입별 크기 제한
  if (mimetype.startsWith('image/')) {
    limit = FILE_SIZE_LIMITS.IMAGE;
  } else if (mimetype.includes('document') || mimetype.includes('pdf')) {
    limit = FILE_SIZE_LIMITS.DOCUMENT;
  } else if (mimetype.includes('zip') || mimetype.includes('rar') || mimetype.includes('7z')) {
    limit = FILE_SIZE_LIMITS.ARCHIVE;
  }

  if (fileSize > limit) {
    const limitMB = Math.floor(limit / (1024 * 1024));
    return {
      valid: false,
      error: createStudyErrorResponse('FILE_TOO_LARGE', `파일 크기는 ${limitMB}MB를 초과할 수 없습니다`)
    };
  }

  return { valid: true };
}

/**
 * 파일 이름 안전화 (위험한 문자 제거)
 * @param {string} filename - 원본 파일 이름
 * @returns {string} 안전한 파일 이름
 */
export function sanitizeFilename(filename) {
  // 경로 구분자 및 위험한 문자 제거
  let safe = filename.replace(/[/\\?%*:|"<>]/g, '_');

  // 연속된 점 제거 (디렉토리 탐색 방지)
  safe = safe.replace(/\.{2,}/g, '.');

  // 앞뒤 공백 및 점 제거
  safe = safe.trim().replace(/^\.+|\.+$/g, '');

  // 길이 제한 (확장자 포함 100자)
  if (safe.length > 100) {
    const ext = path.extname(safe);
    const name = path.basename(safe, ext);
    safe = name.substring(0, 100 - ext.length) + ext;
  }

  return safe;
}

/**
 * 고유한 파일 이름 생성
 * @param {string} originalName - 원본 파일 이름
 * @returns {string} 고유한 파일 이름
 */
export function generateUniqueFilename(originalName) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);
  const safeName = sanitizeFilename(name);

  return `${safeName}_${timestamp}_${random}${ext}`;
}

/**
 * 스터디 파일 저장 경로 생성
 * @param {number} studyId - 스터디 ID
 * @returns {string} 저장 경로
 */
export function getStudyUploadPath(studyId) {
  return path.join(process.cwd(), 'public', 'uploads', 'studies', studyId.toString());
}

/**
 * 스터디 저장 공간 사용량 확인
 * @param {number} studyId - 스터디 ID
 * @returns {Promise<Object>} { used: number, limit: number, available: number }
 */
export async function checkStudyStorage(studyId) {
  const uploadPath = getStudyUploadPath(studyId);

  try {
    // 디렉토리가 없으면 0 사용 중
    if (!fs.existsSync(uploadPath)) {
      return {
        used: 0,
        limit: STORAGE_LIMIT_PER_STUDY,
        available: STORAGE_LIMIT_PER_STUDY,
        percentage: 0
      };
    }

    let totalSize = 0;
    const files = await readdir(uploadPath);

    for (const file of files) {
      const filePath = path.join(uploadPath, file);
      const stats = await stat(filePath);
      if (stats.isFile()) {
        totalSize += stats.size;
      }
    }

    return {
      used: totalSize,
      limit: STORAGE_LIMIT_PER_STUDY,
      available: STORAGE_LIMIT_PER_STUDY - totalSize,
      percentage: Math.round((totalSize / STORAGE_LIMIT_PER_STUDY) * 100)
    };
  } catch (error) {
    console.error('❌ [STORAGE] 저장 공간 확인 실패:', error);
    return {
      used: 0,
      limit: STORAGE_LIMIT_PER_STUDY,
      available: STORAGE_LIMIT_PER_STUDY,
      percentage: 0
    };
  }
}

/**
 * 저장 공간 여유 확인
 * @param {number} studyId - 스터디 ID
 * @param {number} fileSize - 업로드할 파일 크기
 * @returns {Promise<Object>} { hasSpace: boolean, error?: Object }
 */
export async function hasStorageSpace(studyId, fileSize) {
  const storage = await checkStudyStorage(studyId);

  if (storage.available < fileSize) {
    return {
      hasSpace: false,
      error: createStudyErrorResponse(
        'STORAGE_FULL',
        `저장 공간이 부족합니다 (사용 중: ${formatBytes(storage.used)} / ${formatBytes(storage.limit)})`
      )
    };
  }

  return { hasSpace: true };
}

/**
 * 악성 파일 패턴 검사 (간단한 검증)
 * @param {Buffer} fileBuffer - 파일 버퍼
 * @param {string} filename - 파일 이름
 * @returns {Object} { isSafe: boolean, error?: Object }
 */
export function checkMaliciousFile(fileBuffer, filename) {
  const ext = path.extname(filename).toLowerCase();

  // 실행 파일 시그니처 확인
  const magicNumbers = {
    exe: Buffer.from([0x4D, 0x5A]), // MZ
    elf: Buffer.from([0x7F, 0x45, 0x4C, 0x46]), // ELF
    macho: Buffer.from([0xFE, 0xED, 0xFA, 0xCE]) // Mach-O
  };

  // 파일 시작 부분 확인
  for (const [type, signature] of Object.entries(magicNumbers)) {
    if (fileBuffer.length >= signature.length) {
      const fileSignature = fileBuffer.slice(0, signature.length);
      if (fileSignature.equals(signature)) {
        return {
          isSafe: false,
          error: createStudyErrorResponse('MALICIOUS_FILE_DETECTED', `실행 파일(${type})은 업로드할 수 없습니다`)
        };
      }
    }
  }

  // 스크립트 패턴 확인 (이미지에 스크립트 삽입)
  if (ext.match(/\.(jpg|jpeg|png|gif)$/)) {
    const content = fileBuffer.toString('utf-8', 0, Math.min(1024, fileBuffer.length));
    const scriptPatterns = [
      /<script/i,
      /javascript:/i,
      /onclick=/i,
      /onerror=/i,
      /<iframe/i
    ];

    for (const pattern of scriptPatterns) {
      if (pattern.test(content)) {
        return {
          isSafe: false,
          error: createStudyErrorResponse('MALICIOUS_FILE_DETECTED', '이미지 파일에 스크립트가 포함되어 있습니다')
        };
      }
    }
  }

  return { isSafe: true };
}

/**
 * 바이트를 읽기 쉬운 형식으로 변환
 * @param {number} bytes - 바이트 수
 * @returns {string} 포맷된 문자열
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 파일 업로드 전체 검증
 * @param {Object} file - 파일 객체 { name, size, mimetype, buffer }
 * @param {number} studyId - 스터디 ID
 * @returns {Promise<Object>} { valid: boolean, errors?: Array }
 */
export async function validateFileUpload(file, studyId) {
  const errors = [];

  // 파일 존재 확인
  if (!file) {
    errors.push(createStudyErrorResponse('FILE_NOT_PROVIDED'));
    return { valid: false, errors };
  }

  // 파일 타입 검증
  const typeValidation = validateFileType(file.name, file.mimetype);
  if (!typeValidation.valid) {
    errors.push(typeValidation.error);
  }

  // 파일 크기 검증
  const sizeValidation = validateFileSize(file.size, file.mimetype);
  if (!sizeValidation.valid) {
    errors.push(sizeValidation.error);
  }

  // 저장 공간 확인
  const storageValidation = await hasStorageSpace(studyId, file.size);
  if (!storageValidation.hasSpace) {
    errors.push(storageValidation.error);
  }

  // 악성 파일 검사
  if (file.buffer) {
    const maliciousCheck = checkMaliciousFile(file.buffer, file.name);
    if (!maliciousCheck.isSafe) {
      errors.push(maliciousCheck.error);
    }
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true };
}

/**
 * 업로드 디렉토리 생성
 * @param {number} studyId - 스터디 ID
 * @returns {Promise<string>} 생성된 디렉토리 경로
 */
export async function ensureUploadDirectory(studyId) {
  const uploadPath = getStudyUploadPath(studyId);

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  return uploadPath;
}

