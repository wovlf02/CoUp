// src/app/api/studies/[id]/notices/[noticeId]/route.js
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  withStudyErrorHandler,
  createSuccessResponse
} from '@/lib/utils/study-utils'
import { requireStudyMember } from "@/lib/auth-helpers"
import { StudyFeatureException, StudyPermissionException } from '@/lib/exceptions/study'
import { StudyLogger } from '@/lib/logging/studyLogger'
import { invalidateNoticesCache } from "@/lib/cache-helpers"

/**
 * GET /api/studies/[id]/notices/[noticeId]
 * 공지사항 상세 조회
 */
export const GET = withStudyErrorHandler(async (request, context) => {
  const { params } = context;
  const { id: studyId, noticeId } = await params;

  // 1. 멤버 권한 확인
  const result = await requireStudyMember(studyId);
  if (result instanceof NextResponse) return result;

  // 2. 공지사항 조회
  const notice = await prisma.notice.findUnique({
    where: { id: noticeId },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatar: true
        }
      }
    }
  });

  // 3. 존재 여부 및 스터디 일치 확인
  if (!notice) {
    throw StudyFeatureException.noticeTitleMissing({
      noticeId,
      studyId,
      userMessage: '공지사항을 찾을 수 없습니다'
    });
  }

  if (notice.studyId !== studyId) {
    throw StudyPermissionException.notStudyMember(result.session.user.id, studyId);
  }

  // 4. 조회수 증가
  await prisma.notice.update({
    where: { id: noticeId },
    data: { views: { increment: 1 } }
  });

  // 5. 로깅
  StudyLogger.logNoticeView(noticeId, studyId, result.session.user.id);

  // 6. 응답
  return createSuccessResponse(notice);
});

/**
 * PATCH /api/studies/[id]/notices/[noticeId]
 * 공지사항 수정
 */
export const PATCH = withStudyErrorHandler(async (request, context) => {
  const { params } = context;
  const { id: studyId, noticeId } = await params;

  // 1. ADMIN 권한 확인
  const result = await requireStudyMember(studyId, 'ADMIN');
  if (result instanceof NextResponse) return result;
  const { session, member } = result;

  // 2. 요청 본문 파싱
  const body = await request.json();

  // 3. 공지사항 확인
  const notice = await prisma.notice.findUnique({
    where: { id: noticeId }
  });

  if (!notice) {
    throw StudyFeatureException.noticeTitleMissing({
      noticeId,
      studyId,
      userMessage: '공지사항을 찾을 수 없습니다'
    });
  }

  if (notice.studyId !== studyId) {
    throw StudyPermissionException.notStudyMember(session.user.id, studyId);
  }

  // 4. 작성자 또는 ADMIN+ 권한 확인
  if (notice.authorId !== session.user.id && member.role === 'MEMBER') {
    throw StudyPermissionException.insufficientPermission(
      session.user.id,
      member.role,
      'ADMIN',
      { action: 'update_notice', noticeId }
    );
  }

  // 5. 입력 검증
  if (body.title !== undefined) {
    if (!body.title || !body.title.trim()) {
      throw StudyFeatureException.noticeTitleMissing({ studyId, noticeId });
    }
    if (body.title.length < 2 || body.title.length > 100) {
      throw StudyFeatureException.invalidNoticeTitleLength(body.title, { min: 2, max: 100 });
    }
  }

  if (body.content !== undefined) {
    if (!body.content || !body.content.trim()) {
      throw StudyFeatureException.noticeContentMissing({ studyId, noticeId });
    }
    if (body.content.length < 10 || body.content.length > 10000) {
      throw StudyFeatureException.invalidNoticeContentLength(body.content, { min: 10, max: 10000 });
    }
  }

  // 6. 비즈니스 로직 - 공지사항 수정
  const updated = await prisma.notice.update({
    where: { id: noticeId },
    data: {
      ...(body.title && { title: body.title }),
      ...(body.content && { content: body.content }),
      ...(body.isPinned !== undefined && { isPinned: body.isPinned }),
      ...(body.isImportant !== undefined && { isImportant: body.isImportant })
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatar: true
        }
      }
    }
  });

  // 7. 캐시 무효화
  invalidateNoticesCache(`${studyId}_p1_l10_pinall`);
  invalidateNoticesCache(`${studyId}_p1_l20_pinall`);

  // 8. 로깅
  StudyLogger.logNoticeUpdate(noticeId, studyId, session.user.id, body);

  // 9. 응답
  return createSuccessResponse(updated, '공지사항이 수정되었습니다');
});

/**
 * DELETE /api/studies/[id]/notices/[noticeId]
 * 공지사항 삭제
 */
export const DELETE = withStudyErrorHandler(async (request, context) => {
  const { params } = context;
  const { id: studyId, noticeId } = await params;

  // 1. ADMIN 권한 확인
  const result = await requireStudyMember(studyId, 'ADMIN');
  if (result instanceof NextResponse) return result;
  const { session, member } = result;

  // 2. 공지사항 확인
  const notice = await prisma.notice.findUnique({
    where: { id: noticeId }
  });

  if (!notice) {
    throw StudyFeatureException.noticeTitleMissing({
      noticeId,
      studyId,
      userMessage: '공지사항을 찾을 수 없습니다'
    });
  }

  if (notice.studyId !== studyId) {
    throw StudyPermissionException.notStudyMember(session.user.id, studyId);
  }

  // 3. 작성자 또는 ADMIN+ 권한 확인
  if (notice.authorId !== session.user.id && member.role === 'MEMBER') {
    throw StudyPermissionException.insufficientPermission(
      session.user.id,
      member.role,
      'ADMIN',
      { action: 'delete_notice', noticeId }
    );
  }

  // 4. 비즈니스 로직 - 공지사항 삭제
  await prisma.notice.delete({
    where: { id: noticeId }
  });

  // 5. 캐시 무효화
  invalidateNoticesCache(`${studyId}_p1_l10_pinall`);
  invalidateNoticesCache(`${studyId}_p1_l20_pinall`);

  // 6. 로깅
  StudyLogger.logNoticeDelete(noticeId, studyId, session.user.id);

  // 7. 응답
  return createSuccessResponse(null, '공지사항이 삭제되었습니다');
});

