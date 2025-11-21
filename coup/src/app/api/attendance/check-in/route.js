// 출석 체크인 API
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';

export async function POST(_req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 사용자가 속한 모든 스터디 조회
    const userStudies = await prisma.studyMember.findMany({
      where: {
        userId: userId,
        deletedAt: null,
      },
      select: {
        studyId: true,
      },
    });

    if (userStudies.length === 0) {
      return Response.json(
        { message: '참여 중인 스터디가 없습니다.', attendedStudies: 0 },
        { status: 200 }
      );
    }

    const studyIds = userStudies.map(us => us.studyId);

    // 오늘 이미 출석한 스터디 확인
    const existingAttendance = await prisma.attendance.findMany({
      where: {
        userId: userId,
        studyId: { in: studyIds },
        date: {
          gte: today,
        },
      },
      select: {
        studyId: true,
      },
    });

    const attendedStudyIds = existingAttendance.map(a => a.studyId);
    const studiesNeedAttendance = studyIds.filter(id => !attendedStudyIds.includes(id));

    // 출석 기록 생성
    if (studiesNeedAttendance.length > 0) {
      await prisma.attendance.createMany({
        data: studiesNeedAttendance.map(studyId => ({
          userId: userId,
          studyId: studyId,
          date: new Date(),
        })),
        skipDuplicates: true,
      });
    }

    return Response.json({
      message: '출석이 완료되었습니다.',
      attendedStudies: studiesNeedAttendance.length,
      totalStudies: studyIds.length,
      alreadyAttended: attendedStudyIds.length,
    });

  } catch (error) {
    console.error('출석 체크인 오류:', error);
    return Response.json(
      { error: '출석 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

