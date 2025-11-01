import { z } from 'zod';

// Example validation schema for user registration
export const userRegistrationSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력해주세요.'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다.'),
  // Add more fields as needed
});

// Generic function to validate data against a schema
export const validateData = (schema, data) => {
  try {
    schema.parse(data);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors };
    }
    return { success: false, errors: [{ message: '알 수 없는 유효성 검사 오류가 발생했습니다.' }] };
  }
};

// Add more validation schemas and helper functions as needed
