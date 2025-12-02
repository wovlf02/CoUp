// src/app/api/studies/[id]/members/[userId]/role/route.js
import { NextResponse } from "next/server";
import { requireStudyMember } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { withStudyErrorHandler, createSuccessResponse } from '@/lib/utils/study-utils';
import { StudyPermissionException, StudyMemberException, StudyValidationException } from '@/lib/exceptions/study';
import { StudyLogger } from '@/lib/logging/studyLogger';

/**
 * PATCH /api/studies/[id]/members/[userId]/role
 * 멤버 역할 변경 (OWNER만 가능)
 */
export const PATCH = withStudyErrorHandler(async (request, context) => {
  const { params } = context;
  const { id: studyId, userId } = await params;

  // 1. OWNER 권한 확인
  const result = await requireStudyMember(studyId);
  if (result instanceof NextResponse) return result;

  const { session, member: actorMember } = result;

  // OWNER만 역할 변경 가능
  if (actorMember.role !== 'OWNER') {
    throw StudyPermissionException.ownerOnlyAction('change_member_role', {
      studyId,
      actorId: session.user.id,
      actorRole: actorMember.role,
    });
  }

  // 2. 요청 본문 파싱
  const body = await request.json();
  const { role } = body;

  // 3. 역할 검증
  const validRoles = ['OWNER', 'ADMIN', 'MEMBER'];
  if (!role || !validRoles.includes(role)) {
    throw StudyValidationException.invalidRole(role, validRoles, { studyId, userId });
  }

  // 4. 대상 멤버 확인
  const targetMember = await prisma.studyMember.findUnique({
    where: {
      userId_studyId: {
        userId,
        studyId,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      study: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!targetMember) {
    throw StudyMemberException.memberNotFound(userId, studyId, {
      message: '해당 스터디 멤버를 찾을 수 없습니다',
    });
  }

  // 5. OWNER 역할 변경 불가 (자기 자신 포함)
  if (targetMember.role === 'OWNER' || role === 'OWNER') {
    throw StudyPermissionException.cannotChangeOwnerRole(userId, studyId, {
      message: 'OWNER 역할은 변경할 수 없습니다',
    });
  }

  // 6. 이미 같은 역할인 경우
  if (targetMember.role === role) {
    StudyLogger.logMemberRoleChanged(
      session.user.id,
      studyId,
      userId,
      targetMember.role,
      role,
      { noChange: true }
    );

    return createSuccessResponse(targetMember, '이미 해당 역할입니다');
  }

  // 7. 역할 변경
  const updatedMember = await prisma.studyMember.update({
    where: {
      userId_studyId: {
        userId,
        studyId,
      },
    },
    data: { role },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // 8. 로깅
  StudyLogger.logMemberRoleChanged(
    session.user.id,
    studyId,
    userId,
    targetMember.role,
    role
  );

  // 9. 알림 생성 (선택적 - 에러 발생 시 무시)
  try {
    // TODO: 알림 시스템 구현 시 추가
    // await createNotification(...)
  } catch (notifError) {
    StudyLogger.warn('Failed to create role change notification', {
      error: notifError.message,
      studyId,
      userId,
      role,
    });
  }

  return createSuccessResponse(updatedMember, '역할이 변경되었습니다');
});

