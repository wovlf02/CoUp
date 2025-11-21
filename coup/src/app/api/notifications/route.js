// 알림 목록 조회 API
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const read = searchParams.get('read');

    const where = {
      userId: session.user.id,
    };

    if (read === 'true') {
      where.read = true;
    } else if (read === 'false') {
      where.read = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: notifications,
    });

  } catch (error) {
    console.error('알림 조회 오류:', error);
    return NextResponse.json(
      { error: '알림 조회 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

