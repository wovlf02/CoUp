/**
 * User Stats API - 사용자 활동 통계
 *
 * GET /api/user/stats - 사용자 활동 통계 조회
 *
 * @module app/api/user/stats/route
 * @created 2025-12-05
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/user/stats
 * 사용자 활동 통계 조회
 */
export async function GET(request) {
  try {
    // 1. 세션 검증
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 2. 이번 주 시작/끝 날짜 계산
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // 일요일
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    // 3. 이번 주 통계 조회
    const [
      completedTasksThisWeek,
      createdNoticesThisWeek,
      uploadedFilesThisWeek,
      chatMessagesThisWeek
    ] = await Promise.all([
      // 이번 주 완료한 할 일
      prisma.task.count({
        where: {
          assigneeId: userId,
          status: 'COMPLETED',
          updatedAt: {
            gte: startOfWeek,
            lt: endOfWeek
          }
        }
      }),
      // 이번 주 작성한 공지
      prisma.notice.count({
        where: {
          authorId: userId,
          createdAt: {
            gte: startOfWeek,
            lt: endOfWeek
          }
        }
      }),
      // 이번 주 업로드한 파일
      prisma.file.count({
        where: {
          uploaderId: userId,
          createdAt: {
            gte: startOfWeek,
            lt: endOfWeek
          }
        }
      }),
      // 이번 주 채팅 메시지
      prisma.chatMessage.count({
        where: {
          userId: userId,
          createdAt: {
            gte: startOfWeek,
            lt: endOfWeek
          }
        }
      })
    ]);

    // 4. 전체 통계 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true }
    });

    const [
      totalStudyCount,
      totalCompletedTasks,
      attendanceRecords
    ] = await Promise.all([
      // 총 참여 스터디
      prisma.studyMember.count({
        where: {
          userId: userId,
          status: 'ACTIVE'
        }
      }),
      // 총 완료 할 일
      prisma.task.count({
        where: {
          assigneeId: userId,
          status: 'COMPLETED'
        }
      }),
      // 출석 기록
      prisma.attendance.findMany({
        where: { userId: userId },
        select: { status: true }
      })
    ]);

    // 평균 출석률 계산
    const totalAttendance = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(a => a.status === 'PRESENT').length;
    const averageAttendance = totalAttendance > 0 
      ? Math.round((presentCount / totalAttendance) * 100) 
      : 100;

    // 가입 기간 계산
    const joinedDays = user 
      ? Math.floor((now - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) + 1
      : 1;

    // 5. 배지 조회 (있는 경우)
    let badges = [];
    try {
      const userBadges = await prisma.userBadge.findMany({
        where: { userId: userId },
        include: { badge: true },
        take: 5
      });
      badges = userBadges.map(ub => ({
        id: ub.badge.id,
        name: ub.badge.name,
        icon: ub.badge.icon || '🏅',
        description: ub.badge.description
      }));
    } catch (e) {
      // 배지 테이블이 없을 수 있음 - 무시
    }

    // 6. 응답 구성
    const stats = {
      thisWeek: {
        completedTasks: completedTasksThisWeek,
        createdNotices: createdNoticesThisWeek,
        uploadedFiles: uploadedFilesThisWeek,
        chatMessages: chatMessagesThisWeek
      },
      total: {
        studyCount: totalStudyCount,
        completedTasks: totalCompletedTasks,
        averageAttendance: averageAttendance,
        joinedDays: joinedDays
      },
      badges: badges
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('[User Stats] Error:', error);
    return NextResponse.json(
      { error: '통계를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
