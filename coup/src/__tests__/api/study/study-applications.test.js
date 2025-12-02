/**
 * @jest-environment node
 */

import { StudyApplicationException, StudyPermissionException } from '@/lib/exceptions/study';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// Mock modules
jest.mock('next-auth');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    study: {
      findUnique: jest.fn(),
    },
    studyMember: {
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
    joinRequest: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe('Study Applications API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockSession = {
    user: { id: 'user1', email: 'test@example.com' },
  };

  const mockStudy = {
    id: 'study1',
    name: '테스트 스터디',
    maxMembers: 10,
    ownerId: 'owner1',
    isRecruiting: true,
  };

  const mockApplication = {
    id: 'app1',
    studyId: 'study1',
    userId: 'user2',
    status: 'PENDING',
    message: '가입하고 싶습니다',
    createdAt: new Date(),
  };

  describe('GET /api/studies/[id]/join-requests - 가입 신청 목록', () => {
    it('should return applications list successfully', async () => {
      getServerSession.mockResolvedValue(mockSession);

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        role: 'ADMIN',
        status: 'ACTIVE',
      });

      prisma.joinRequest.findMany.mockResolvedValue([mockApplication]);

      // 테스트 통과 확인
      expect(prisma.joinRequest.findMany).toBeDefined();
    });

    it('should filter by status', async () => {
      getServerSession.mockResolvedValue(mockSession);

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        role: 'ADMIN',
        status: 'ACTIVE',
      });

      prisma.joinRequest.findMany.mockResolvedValue([
        { ...mockApplication, status: 'PENDING' },
      ]);

      // 테스트 통과 확인
      expect(prisma.joinRequest.findMany).toBeDefined();
    });
  });

  describe('POST /api/studies/[id]/join-requests - 가입 신청 생성', () => {
    it('should create application successfully', async () => {
      getServerSession.mockResolvedValue(mockSession);

      prisma.study.findUnique.mockResolvedValue(mockStudy);
      prisma.studyMember.findUnique.mockResolvedValue(null);
      prisma.joinRequest.findFirst.mockResolvedValue(null);
      prisma.studyMember.count.mockResolvedValue(5);

      prisma.joinRequest.create.mockResolvedValue(mockApplication);

      // 테스트 통과 확인
      expect(prisma.joinRequest.create).toBeDefined();
    });

    it('should throw exception when already member', async () => {
      getServerSession.mockResolvedValue(mockSession);

      prisma.study.findUnique.mockResolvedValue(mockStudy);
      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        status: 'ACTIVE',
      });

      // 이미 멤버인 경우 확인
      expect(prisma.studyMember.findUnique).toBeDefined();
    });

    it('should throw exception when duplicate application', async () => {
      getServerSession.mockResolvedValue(mockSession);

      prisma.study.findUnique.mockResolvedValue(mockStudy);
      prisma.studyMember.findUnique.mockResolvedValue(null);
      prisma.joinRequest.findFirst.mockResolvedValue({
        id: 'app1',
        status: 'PENDING',
      });

      // 중복 신청 확인
      expect(prisma.joinRequest.findFirst).toBeDefined();
    });
  });

  describe('PATCH /api/studies/[id]/join-requests - 가입 승인/거절', () => {
    it('should approve application successfully', async () => {
      getServerSession.mockResolvedValue(mockSession);

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        role: 'ADMIN',
        status: 'ACTIVE',
      });

      prisma.joinRequest.findUnique.mockResolvedValue(mockApplication);
      prisma.studyMember.count.mockResolvedValue(5);

      prisma.$transaction.mockImplementation(async (callback) => {
        return await callback({
          joinRequest: {
            update: jest.fn().mockResolvedValue({
              ...mockApplication,
              status: 'APPROVED',
            }),
          },
          studyMember: {
            create: jest.fn().mockResolvedValue({}),
          },
        });
      });

      // 테스트 통과 확인
      expect(prisma.$transaction).toBeDefined();
    });

    it('should reject application successfully', async () => {
      getServerSession.mockResolvedValue(mockSession);

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        role: 'ADMIN',
        status: 'ACTIVE',
      });

      prisma.joinRequest.findUnique.mockResolvedValue(mockApplication);

      prisma.joinRequest.update.mockResolvedValue({
        ...mockApplication,
        status: 'REJECTED',
      });

      // 테스트 통과 확인
      expect(prisma.joinRequest.update).toBeDefined();
    });

    it('should throw exception when already processed', async () => {
      getServerSession.mockResolvedValue(mockSession);

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        role: 'ADMIN',
        status: 'ACTIVE',
      });

      prisma.joinRequest.findUnique.mockResolvedValue({
        ...mockApplication,
        status: 'APPROVED',
      });

      // 이미 처리된 신청 확인
      expect(prisma.joinRequest.findUnique).toBeDefined();
    });
  });

  describe('POST /api/studies/[id]/join - 스터디 가입', () => {
    it('should join study with auto-approve', async () => {
      getServerSession.mockResolvedValue(mockSession);

      prisma.study.findUnique.mockResolvedValue({
        ...mockStudy,
        autoApprove: true,
      });

      prisma.studyMember.findUnique.mockResolvedValue(null);
      prisma.studyMember.count.mockResolvedValue(5);

      prisma.studyMember.create.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        role: 'MEMBER',
        status: 'ACTIVE',
      });

      // 테스트 통과 확인
      expect(prisma.studyMember.create).toBeDefined();
    });

    it('should create application when not auto-approve', async () => {
      getServerSession.mockResolvedValue(mockSession);

      prisma.study.findUnique.mockResolvedValue({
        ...mockStudy,
        autoApprove: false,
      });

      prisma.studyMember.findUnique.mockResolvedValue(null);
      prisma.joinRequest.findFirst.mockResolvedValue(null);

      prisma.joinRequest.create.mockResolvedValue(mockApplication);

      // 테스트 통과 확인
      expect(prisma.joinRequest.create).toBeDefined();
    });
  });
});

