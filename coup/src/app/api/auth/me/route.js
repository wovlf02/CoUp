import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 현재 로그인한 사용자 정보 조회
 * GET /api/auth/me
 */
export async function GET() {
  try {
    // NextAuth 세션 확인
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // AdminRole 정보 조회
    const adminRole = await prisma.adminRole.findUnique({
      where: { userId: session.user.id },
      select: {
        role: true,
        expiresAt: true,
      }
    });

    // 사용자 정보 반환 (AdminRole 포함)
    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        avatar: session.user.avatar,
        role: session.user.role,
        status: 'ACTIVE' // NextAuth 세션이 있다면 ACTIVE 상태
      },
      adminRole: adminRole ? {
        role: adminRole.role,
        expiresAt: adminRole.expiresAt,
        isExpired: adminRole.expiresAt ? new Date(adminRole.expiresAt) < new Date() : false
      } : null
    });
  } catch (error) {
    console.error('[API /auth/me] Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

