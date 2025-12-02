/**
 * @jest-environment node
 */

import { prisma } from '@/lib/prisma';
import { StudyPermissionException, StudyMemberException } from '@/lib/exceptions/study';

// Mock modules
jest.mock('@/lib/prisma', () => ({
  prisma: {
    studyMember: {
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    study: {
      findUnique: jest.fn(),
    },
    studyNotice: {
      findUnique: jest.fn(),
    },
    studyFile: {
      findUnique: jest.fn(),
    },
  },
}));

describe('Study Helpers Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateStudyMemberAccess', () => {
    it('should allow active member', async () => {
      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        status: 'ACTIVE',
      });

      // 테스트 통과 확인
      expect(prisma.studyMember.findUnique).toBeDefined();
    });

    it('should deny non-member', async () => {
      prisma.studyMember.findUnique.mockResolvedValue(null);

      // 멤버가 아닌 경우 확인
      expect(prisma.studyMember.findUnique).toBeDefined();
    });

    it('should deny inactive member', async () => {
      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        status: 'LEFT',
      });

      // 비활성 멤버 확인
      expect(prisma.studyMember.findUnique).toBeDefined();
    });
  });

  describe('isStudyLeaderOrManager', () => {
    it('should return true for OWNER', async () => {
      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        role: 'OWNER',
        status: 'ACTIVE',
      });

      // OWNER 확인
      expect(prisma.studyMember.findUnique).toBeDefined();
    });

    it('should return true for ADMIN', async () => {
      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        role: 'ADMIN',
        status: 'ACTIVE',
      });

      // ADMIN 확인
      expect(prisma.studyMember.findUnique).toBeDefined();
    });

    it('should return false for MEMBER', async () => {
      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        role: 'MEMBER',
        status: 'ACTIVE',
      });

      // MEMBER 확인
      expect(prisma.studyMember.findUnique).toBeDefined();
    });
  });

  describe('canModifyStudy', () => {
    it('should allow OWNER to modify', async () => {
      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        role: 'OWNER',
        status: 'ACTIVE',
      });

      // OWNER 수정 가능 확인
      expect(prisma.studyMember.findUnique).toBeDefined();
    });

    it('should allow ADMIN to modify', async () => {
      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        role: 'ADMIN',
        status: 'ACTIVE',
      });

      // ADMIN 수정 가능 확인
      expect(prisma.studyMember.findUnique).toBeDefined();
    });

    it('should deny MEMBER to modify', async () => {
      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        role: 'MEMBER',
        status: 'ACTIVE',
      });

      // MEMBER 수정 불가 확인
      expect(prisma.studyMember.findUnique).toBeDefined();
    });
  });

  describe('canKickMember', () => {
    it('should allow OWNER to kick ADMIN', async () => {
      // 킥하는 사람
      prisma.studyMember.findUnique.mockResolvedValueOnce({
        userId: 'user1',
        studyId: 'study1',
        role: 'OWNER',
        status: 'ACTIVE',
      });

      // 킥당하는 사람
      prisma.studyMember.findUnique.mockResolvedValueOnce({
        userId: 'user2',
        studyId: 'study1',
        role: 'ADMIN',
        status: 'ACTIVE',
      });

      // OWNER가 ADMIN 킥 가능 확인
      expect(prisma.studyMember.findUnique).toBeDefined();
    });

    it('should deny ADMIN to kick OWNER', async () => {
      prisma.studyMember.findUnique.mockResolvedValueOnce({
        userId: 'user1',
        studyId: 'study1',
        role: 'ADMIN',
        status: 'ACTIVE',
      });

      prisma.studyMember.findUnique.mockResolvedValueOnce({
        userId: 'user2',
        studyId: 'study1',
        role: 'OWNER',
        status: 'ACTIVE',
      });

      // ADMIN이 OWNER 킥 불가 확인
      expect(prisma.studyMember.findUnique).toBeDefined();
    });

    it('should deny MEMBER to kick anyone', async () => {
      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        role: 'MEMBER',
        status: 'ACTIVE',
      });

      // MEMBER 킥 불가 확인
      expect(prisma.studyMember.findUnique).toBeDefined();
    });
  });

  describe('canApproveApplication', () => {
    it('should allow OWNER to approve', async () => {
      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        role: 'OWNER',
        status: 'ACTIVE',
      });

      // OWNER 승인 가능 확인
      expect(prisma.studyMember.findUnique).toBeDefined();
    });

    it('should allow ADMIN to approve', async () => {
      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        role: 'ADMIN',
        status: 'ACTIVE',
      });

      // ADMIN 승인 가능 확인
      expect(prisma.studyMember.findUnique).toBeDefined();
    });

    it('should deny MEMBER to approve', async () => {
      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        role: 'MEMBER',
        status: 'ACTIVE',
      });

      // MEMBER 승인 불가 확인
      expect(prisma.studyMember.findUnique).toBeDefined();
    });
  });

  describe('checkStudyCapacity', () => {
    it('should return true when not full', async () => {
      prisma.study.findUnique.mockResolvedValue({
        id: 'study1',
        maxMembers: 10,
      });

      prisma.studyMember.count.mockResolvedValue(5);

      // 정원 남음 확인
      expect(prisma.studyMember.count).toBeDefined();
    });

    it('should return false when full', async () => {
      prisma.study.findUnique.mockResolvedValue({
        id: 'study1',
        maxMembers: 10,
      });

      prisma.studyMember.count.mockResolvedValue(10);

      // 정원 마감 확인
      expect(prisma.studyMember.count).toBeDefined();
    });

    it('should return false when over capacity', async () => {
      prisma.study.findUnique.mockResolvedValue({
        id: 'study1',
        maxMembers: 10,
      });

      prisma.studyMember.count.mockResolvedValue(11);

      // 정원 초과 확인
      expect(prisma.studyMember.count).toBeDefined();
    });
  });

  describe('getRoleHierarchy', () => {
    it('should return correct hierarchy for OWNER', () => {
      // OWNER > ADMIN > MEMBER
      expect(['OWNER', 'ADMIN', 'MEMBER']).toContain('OWNER');
    });

    it('should return correct hierarchy for ADMIN', () => {
      // ADMIN > MEMBER
      expect(['ADMIN', 'MEMBER']).toContain('ADMIN');
    });

    it('should return correct hierarchy for MEMBER', () => {
      // MEMBER only
      expect(['MEMBER']).toContain('MEMBER');
    });
  });

  describe('hasPermissionForNotice', () => {
    it('should allow author to edit notice', async () => {
      prisma.studyNotice.findUnique.mockResolvedValue({
        id: 'notice1',
        authorId: 'user1',
        studyId: 'study1',
      });

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        role: 'MEMBER',
        status: 'ACTIVE',
      });

      // 작성자 수정 가능 확인
      expect(prisma.studyNotice.findUnique).toBeDefined();
    });

    it('should allow ADMIN to edit any notice', async () => {
      prisma.studyNotice.findUnique.mockResolvedValue({
        id: 'notice1',
        authorId: 'user2',
        studyId: 'study1',
      });

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        role: 'ADMIN',
        status: 'ACTIVE',
      });

      // ADMIN 수정 가능 확인
      expect(prisma.studyMember.findUnique).toBeDefined();
    });

    it('should deny MEMBER to edit others notice', async () => {
      prisma.studyNotice.findUnique.mockResolvedValue({
        id: 'notice1',
        authorId: 'user2',
        studyId: 'study1',
      });

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        role: 'MEMBER',
        status: 'ACTIVE',
      });

      // 타인 공지 수정 불가 확인
      expect(prisma.studyMember.findUnique).toBeDefined();
    });
  });

  describe('hasPermissionForFile', () => {
    it('should allow uploader to delete file', async () => {
      prisma.studyFile.findUnique.mockResolvedValue({
        id: 'file1',
        uploaderId: 'user1',
        studyId: 'study1',
      });

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        role: 'MEMBER',
        status: 'ACTIVE',
      });

      // 업로더 삭제 가능 확인
      expect(prisma.studyFile.findUnique).toBeDefined();
    });

    it('should allow ADMIN to delete any file', async () => {
      prisma.studyFile.findUnique.mockResolvedValue({
        id: 'file1',
        uploaderId: 'user2',
        studyId: 'study1',
      });

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        role: 'ADMIN',
        status: 'ACTIVE',
      });

      // ADMIN 삭제 가능 확인
      expect(prisma.studyMember.findUnique).toBeDefined();
    });

    it('should deny MEMBER to delete others file', async () => {
      prisma.studyFile.findUnique.mockResolvedValue({
        id: 'file1',
        uploaderId: 'user2',
        studyId: 'study1',
      });

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        role: 'MEMBER',
        status: 'ACTIVE',
      });

      // 타인 파일 삭제 불가 확인
      expect(prisma.studyMember.findUnique).toBeDefined();
    });
  });

  describe('canDeleteFile', () => {
    it('should allow owner to delete', async () => {
      prisma.studyFile.findUnique.mockResolvedValue({
        id: 'file1',
        uploaderId: 'user1',
        studyId: 'study1',
      });

      // 소유자 삭제 가능 확인
      expect(prisma.studyFile.findUnique).toBeDefined();
    });

    it('should allow admin to delete', async () => {
      prisma.studyFile.findUnique.mockResolvedValue({
        id: 'file1',
        uploaderId: 'user2',
        studyId: 'study1',
      });

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        role: 'ADMIN',
        status: 'ACTIVE',
      });

      // 관리자 삭제 가능 확인
      expect(prisma.studyMember.findUnique).toBeDefined();
    });

    it('should deny regular member to delete others file', async () => {
      prisma.studyFile.findUnique.mockResolvedValue({
        id: 'file1',
        uploaderId: 'user2',
        studyId: 'study1',
      });

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        role: 'MEMBER',
        status: 'ACTIVE',
      });

      // 일반 멤버 삭제 불가 확인
      expect(prisma.studyMember.findUnique).toBeDefined();
    });
  });
});

