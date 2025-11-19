import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * 현재 로그인한 사용자 정보 조회
 * GET /api/auth/me
 */
export async function GET(request) {
  try {
    // NextAuth 세션 확인
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 사용자 정보 반환
    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        avatar: session.user.avatar,
        role: session.user.role,
        status: 'ACTIVE' // NextAuth 세션이 있다면 ACTIVE 상태
      }
    });
  } catch (error) {
    console.error('[API /auth/me] Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

