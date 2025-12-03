/**
 * /api/groups/[id]/invites/route.js
 *
 * 그룹 초대 관리 API
 *
 * @routes
 * - GET    /api/groups/[id]/invites - 초대 목록 조회 (멤버만)
 * - POST   /api/groups/[id]/invites - 초대 생성 (ADMIN 이상)
 * - DELETE /api/groups/[id]/invites - 초대 취소 (생성자 또는 ADMIN)
 *
 * @author CoUp Team
 * @created 2025-12-03
 */

import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  GroupBusinessException,
  GroupInviteException
} from '@/lib/exceptions/group';
import { GroupLogger } from '@/lib/logging/groupLogger';
import {
  checkGroupExists,
  checkGroupPermission,
  checkMemberExists,
  generateInviteCode
} from '@/lib/helpers/group-helpers';
import { validateEmailFormat } from '@/lib/validators/group-validators';

/**
 * GET /api/groups/[id]/invites
 * 초대 목록 조회 (멤버만)
 *
 * @param {Request} request
 * @param {Object} context
 * @returns {Response}
 */
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      throw GroupBusinessException.authenticationRequired();
    }

    const groupId = params.id;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PENDING';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    // 그룹 존재 확인
    await checkGroupExists(groupId, prisma);

    // 멤버 확인
    await checkMemberExists(groupId, session.user.id, prisma);

    const skip = (page - 1) * limit;

    // 초대 목록 조회
    const [invites, total] = await Promise.all([
      prisma.groupInvite.findMany({
        where: {
          groupId,
          ...(status && { status })
        },
        skip,
        take: limit,
        include: {
          inviter: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.groupInvite.count({
        where: {
          groupId,
          ...(status && { status })
        }
      })
    ]);

    const formattedInvites = invites.map(invite => ({
      id: invite.id,
      email: invite.email,
      code: invite.code,
      status: invite.status,
      createdAt: invite.createdAt,
      expiresAt: invite.expiresAt,
      usedAt: invite.usedAt,
      inviter: invite.inviter,
      user: invite.user
    }));

    GroupLogger.info('Group invites retrieved', {
      groupId,
      userId: session.user.id,
      total,
      status
    });

    return Response.json({
      success: true,
      data: {
        invites: formattedInvites,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    if (error.code?.startsWith('GROUP-')) {
      return Response.json(
        { success: false, error: error.toJSON() },
        { status: error.statusCode }
      );
    }

    GroupLogger.error('Failed to retrieve group invites', {
      error: error.message,
      stack: error.stack
    });
    return Response.json(
      {
        success: false,
        error: {
          code: 'GROUP-INTERNAL-ERROR',
          message: '초대 목록 조회에 실패했습니다.'
        }
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/groups/[id]/invites
 * 초대 생성 (ADMIN 이상)
 *
 * @param {Request} request
 * @param {Object} context
 * @returns {Response}
 */
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      throw GroupBusinessException.authenticationRequired();
    }

    const groupId = params.id;
    const body = await request.json();
    const { email, expiresInDays = 7 } = body;

    // 그룹 존재 확인
    const group = await checkGroupExists(groupId, prisma);

    // 권한 확인 (ADMIN 이상)
    await checkGroupPermission(groupId, session.user.id, 'ADMIN', prisma);

    // 이메일 형식 확인 (선택적)
    if (email) {
      validateEmailFormat(email);

      // 해당 이메일의 사용자가 이미 멤버인지 확인
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        const existingMember = await prisma.groupMember.findUnique({
          where: {
            groupId_userId: {
              groupId,
              userId: existingUser.id
            }
          }
        });

        if (existingMember && existingMember.status === 'ACTIVE') {
          throw GroupInviteException.alreadyMember();
        }

        if (existingMember && existingMember.status === 'KICKED') {
          throw GroupInviteException.cannotInviteKickedUser();
        }
      }
    }

    // 정원 확인
    const currentMemberCount = await prisma.groupMember.count({
      where: {
        groupId,
        status: 'ACTIVE'
      }
    });

    if (currentMemberCount >= group.maxMembers) {
      throw GroupBusinessException.groupFull();
    }

    // 초대 코드 생성
    const code = generateInviteCode();

    // 만료 시간 계산
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // 초대 생성
    const invite = await prisma.groupInvite.create({
      data: {
        groupId,
        invitedBy: session.user.id,
        email: email || null,
        code,
        status: 'PENDING',
        expiresAt
      },
      include: {
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    GroupLogger.logInviteCreated(groupId, session.user.id, invite.id, email);

    return Response.json({
      success: true,
      data: {
        id: invite.id,
        email: invite.email,
        code: invite.code,
        status: invite.status,
        createdAt: invite.createdAt,
        expiresAt: invite.expiresAt,
        inviter: invite.inviter
      },
      message: '초대가 성공적으로 생성되었습니다.'
    }, { status: 201 });

  } catch (error) {
    if (error.code?.startsWith('GROUP-')) {
      return Response.json(
        { success: false, error: error.toJSON() },
        { status: error.statusCode }
      );
    }

    GroupLogger.error('Failed to create group invite', {
      error: error.message,
      stack: error.stack
    });
    return Response.json(
      {
        success: false,
        error: {
          code: 'GROUP-INTERNAL-ERROR',
          message: '초대 생성에 실패했습니다.'
        }
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/groups/[id]/invites
 * 초대 취소 (생성자 또는 ADMIN)
 *
 * @param {Request} request
 * @param {Object} context
 * @returns {Response}
 */
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      throw GroupBusinessException.authenticationRequired();
    }

    const groupId = params.id;
    const { searchParams } = new URL(request.url);
    const inviteId = searchParams.get('inviteId');

    if (!inviteId) {
      throw GroupInviteException.inviteIdRequired();
    }

    // 그룹 존재 확인
    await checkGroupExists(groupId, prisma);

    // 초대 확인
    const invite = await prisma.groupInvite.findUnique({
      where: { id: inviteId }
    });

    if (!invite) {
      throw GroupInviteException.inviteNotFound();
    }

    if (invite.groupId !== groupId) {
      throw GroupInviteException.inviteNotBelongToGroup();
    }

    if (invite.status !== 'PENDING') {
      throw GroupInviteException.inviteAlreadyUsed();
    }

    // 권한 확인: 생성자이거나 ADMIN 이상
    let hasPermission = invite.invitedBy === session.user.id;

    if (!hasPermission) {
      try {
        await checkGroupPermission(groupId, session.user.id, 'ADMIN', prisma);
        hasPermission = true;
      } catch (error) {
        hasPermission = false;
      }
    }

    if (!hasPermission) {
      throw GroupInviteException.cannotCancelInvite();
    }

    // 초대 취소
    await prisma.groupInvite.update({
      where: { id: inviteId },
      data: {
        status: 'CANCELLED'
      }
    });

    GroupLogger.logInviteCancelled(groupId, session.user.id, inviteId);

    return Response.json({
      success: true,
      message: '초대가 성공적으로 취소되었습니다.'
    });

  } catch (error) {
    if (error.code?.startsWith('GROUP-')) {
      return Response.json(
        { success: false, error: error.toJSON() },
        { status: error.statusCode }
      );
    }

    GroupLogger.error('Failed to cancel group invite', {
      error: error.message,
      stack: error.stack
    });
    return Response.json(
      {
        success: false,
        error: {
          code: 'GROUP-INTERNAL-ERROR',
          message: '초대 취소에 실패했습니다.'
        }
      },
      { status: 500 }
    );
  }
}

