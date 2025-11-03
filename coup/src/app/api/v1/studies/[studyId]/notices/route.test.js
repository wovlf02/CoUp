import { POST, PATCH } from '../route'; // Import the actual handlers
import { authorize } from '@/lib/utils/auth';
import prisma from '@/lib/db/prisma';

// Mock the authorize function
jest.mock('@/lib/utils/auth', () => ({
  authorize: jest.fn(),
  getCurrentUser: jest.fn(),
}));

// Mock Prisma Client
jest.mock('@/lib/db/prisma', () => ({
  notice: {
    create: jest.fn(),
    update: jest.fn(),
  },
}));

describe('API /api/v1/studies/[studyId]/notices', () => {
  const mockUser = { id: 'user-1', name: 'Test User' };
  const studyId = 'study-1';

  beforeEach(() => {
    jest.clearAllMocks();
    authorize.mockResolvedValue({ authorized: true, user: mockUser, message: 'Authorized' });
  });

  describe('POST /api/v1/studies/[studyId]/notices', () => {
    it('should create a new notice successfully', async () => {
      const newNoticeData = {
        title: 'New Notice',
        content: 'Notice Content',
      };
      const createdNotice = { id: 'notice-1', authorId: mockUser.id, studyGroupId: studyId, ...newNoticeData };
      prisma.notice.create.mockResolvedValue(createdNotice);

      const request = {
        json: async () => newNoticeData,
      };
      const context = { params: { studyId } };

      const response = await POST(request, context);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.message).toBe('Notice created successfully');
      expect(data.data).toEqual(createdNotice);
      expect(prisma.notice.create).toHaveBeenCalledWith({
        data: {
          ...newNoticeData,
          authorId: mockUser.id,
          studyGroupId: studyId,
        },
      });
    });

    it('should return 401 if not authorized', async () => {
      authorize.mockResolvedValue({ authorized: false, user: null, message: 'Unauthorized' });

      const request = {
        json: async () => ({ title: 'New Notice' }),
      };
      const context = { params: { studyId } };

      const response = await POST(request, context);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.message).toBe('Unauthorized');
      expect(prisma.notice.create).not.toHaveBeenCalled();
    });

    it('should return 500 on internal server error', async () => {
      prisma.notice.create.mockRejectedValue(new Error('Database error'));

      const request = {
        json: async () => ({ title: 'New Notice' }),
      };
      const context = { params: { studyId } };

      const response = await POST(request, context);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe('Failed to create notice');
    });
  });

  describe('PATCH /api/v1/studies/[studyId]/notices/[noticeId]', () => {
    const noticeId = 'notice-1';

    it('should update an existing notice successfully', async () => {
      const updateNoticeData = {
        title: 'Updated Notice',
        content: 'Updated Content',
      };
      const updatedNotice = { id: noticeId, authorId: mockUser.id, studyGroupId: studyId, ...updateNoticeData };
      prisma.notice.update.mockResolvedValue(updatedNotice);

      const request = {
        json: async () => updateNoticeData,
      };
      const context = { params: { studyId, noticeId } };

      const response = await PATCH(request, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Notice updated successfully');
      expect(data.data).toEqual(updatedNotice);
      expect(prisma.notice.update).toHaveBeenCalledWith({
        where: { id: noticeId, studyGroupId: studyId },
        data: updateNoticeData,
      });
    });

    it('should return 401 if not authorized', async () => {
      authorize.mockResolvedValue({ authorized: false, user: null, message: 'Unauthorized' });

      const request = {
        json: async () => ({ title: 'Updated Notice' }),
      };
      const context = { params: { studyId, noticeId } };

      const response = await PATCH(request, context);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.message).toBe('Unauthorized');
      expect(prisma.notice.update).not.toHaveBeenCalled();
    });

    it('should return 500 on internal server error', async () => {
      prisma.notice.update.mockRejectedValue(new Error('Database error'));

      const request = {
        json: async () => ({ title: 'Updated Notice' }),
      };
      const context = { params: { studyId, noticeId } };

      const response = await PATCH(request, context);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe('Failed to update notice');
    });
  });
});
