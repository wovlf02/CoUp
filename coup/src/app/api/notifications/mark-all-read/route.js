// 모든 알림 읽음 처리 API
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    // 모든 읽지 않은 알림을 읽음 처리
    await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: '모든 알림이 읽음 처리되었습니다',
    });

  } catch (error) {
    console.error('알림 전체 읽음 처리 오류:', error);
    return NextResponse.json(
      { error: '알림 읽음 처리 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

