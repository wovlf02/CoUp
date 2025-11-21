// 알림 삭제 API
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const { id } = params;

    // 알림 소유권 확인
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!notification) {
      return NextResponse.json(
        { error: '알림을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 삭제
    await prisma.notification.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: '알림이 삭제되었습니다',
    });

  } catch (error) {
    console.error('알림 삭제 오류:', error);
    return NextResponse.json(
      { error: '알림 삭제 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

