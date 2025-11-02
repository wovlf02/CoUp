// C:/Project/CoUp/coup/src/lib/utils/validation.js

import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('유효한 이메일 주소를 입력해주세요.');
export const passwordSchema = z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다.');
export const nicknameSchema = z.string().min(2, '닉네임은 최소 2자 이상이어야 합니다.').max(20, '닉네임은 최대 20자까지 가능합니다.');
export const titleSchema = z.string().min(1, '제목을 입력해주세요.').max(100, '제목은 최대 100자까지 가능합니다.');
export const contentSchema = z.string().min(1, '내용을 입력해주세요.');
export const descriptionSchema = z.string().min(1, '설명을 입력해주세요.').max(500, '설명은 최대 500자까지 가능합니다.');

// Auth schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  nickname: nicknameSchema,
});

// Study schemas
export const createStudySchema = z.object({
  name: titleSchema.max(50, '스터디 이름은 최대 50자까지 가능합니다.'),
  description: descriptionSchema,
  goal: contentSchema.max(200, '스터디 목표는 최대 200자까지 가능합니다.'),
  category: z.string().min(1, '카테고리를 선택해주세요.'),
  rules: contentSchema.max(500, '스터디 규칙은 최대 500자까지 가능합니다.').optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE'], { message: '유효한 공개 범위를 선택해주세요.' }),
  maxMembers: z.number().min(2, '최소 2명 이상이어야 합니다.').max(20, '최대 20명까지 가능합니다.'),
});

export const updateStudySchema = createStudySchema.partial(); // All fields optional for update

// Notice schemas
export const createNoticeSchema = z.object({
  title: titleSchema,
  content: contentSchema,
});

export const updateNoticeSchema = createNoticeSchema.partial();

// Event schemas
export const createEventSchema = z.object({
  title: titleSchema,
  description: descriptionSchema.optional(),
  startTime: z.string().datetime('유효한 시작 시간을 입력해주세요.'),
  endTime: z.string().datetime('유효한 종료 시간을 입력해주세요.'),
});

export const updateEventSchema = createEventSchema.partial();

// Task schemas
export const createTaskSchema = z.object({
  title: titleSchema,
  description: descriptionSchema.optional(),
  dueDate: z.string().datetime('유효한 마감일을 입력해주세요.').optional().or(z.literal('')),
  assigneeId: z.string().optional().or(z.literal('')),
});

export const updateTaskSchema = createTaskSchema.partial();

// File schemas (for metadata)
export const uploadFileSchema = z.object({
  fileName: z.string().min(1, '파일 이름을 입력해주세요.'),
  fileUrl: z.string().url('유효한 파일 URL을 입력해주세요.'),
  fileSize: z.number().min(1, '파일 크기는 0보다 커야 합니다.'),
  fileType: z.string().min(1, '파일 타입을 입력해주세요.'),
});

// User profile schemas
export const updateUserProfileSchema = z.object({
  nickname: nicknameSchema.optional(),
  bio: z.string().max(500, '소개는 최대 500자까지 가능합니다.').optional(),
  imageUrl: z.string().url('유효한 이미지 URL을 입력해주세요.').optional(),
});