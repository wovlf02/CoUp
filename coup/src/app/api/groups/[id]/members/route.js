/**
 * /api/groups/[id]/members/route.js
 *
 * 그룹 멤버 관리 API
 *
 * @routes
 * - GET    /api/groups/[id]/members - 멤버 목록 조회
 * - POST   /api/groups/[id]/members - 멤버 추가 (ADMIN 이상)
 * - DELETE /api/groups/[id]/members - 멤버 제거 (ADMIN 이상)
 *
 * @author CoUp Team
 * @created 2025-12-03
 */

import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  GroupBusinessException,
  GroupPermissionException,
  GroupMemberException
} from '@/lib/exceptions/group';
import { GroupLogger } from '@/lib/logging/groupLogger';
import {
  checkGroupExists,
  checkGroupPermission,
  checkMemberExists,
  canManageMember
} from '@/lib/helpers/group-helpers';

/**
 * GET /api/groups/[id]/members
 * 멤버 목록 조회
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
    const status = searchParams.get('status') || 'ACTIVE';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    // 그룹 존재 확인
    await checkGroupExists(groupId, prisma);

    const skip = (page - 1) * limit;

    // 멤버 목록 조회
    const [members, total] = await Promise.all([
      prisma.groupMember.findMany({
        where: {
          groupId,
          ...(status && { status })
        },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              bio: true
            }
          }
        },
        orderBy: [
          { role: 'desc' },
          { joinedAt: 'asc' }
        ]
      }),
      prisma.groupMember.count({
        where: {
          groupId,
          ...(status && { status })
        }
      })
    ]);

    const formattedMembers = members.map(member => ({
      id: member.id,
      role: member.role,
      status: member.status,
      joinedAt: member.joinedAt,
      leftAt: member.leftAt,
      user: member.user
    }));

    GroupLogger.info('Group members retrieved', {
      groupId,
      userId: session.user.id,
      total,
      status
    });

    return Response.json({
      success: true,
      data: {
        members: formattedMembers,
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

    GroupLogger.error('Failed to retrieve group members', {
      error: error.message,
      stack: error.stack
    });
    return Response.json(
      {
        success: false,
        error: {
          code: 'GROUP-INTERNAL-ERROR',
          message: '멤버 목록 조회에 실패했습니다.'
        }
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/groups/[id]/members
 * 멤버 추가 (ADMIN 이상)
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
    const { userId, role = 'MEMBER' } = body;

    if (!userId) {
      throw GroupMemberException.memberIdRequired();
    }

    // 그룹 존재 확인
    const group = await checkGroupExists(groupId, prisma);

    // 권한 확인 (ADMIN 이상)
    await checkGroupPermission(groupId, session.user.id, 'ADMIN', prisma);

    // 사용자 존재 확인
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw GroupMemberException.userNotFound();
    }

    // 이미 멤버인지 확인
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId
        }
      }
    });

    if (existingMember && existingMember.status === 'ACTIVE') {
      throw GroupMemberException.alreadyMember();
    }

    if (existingMember && existingMember.status === 'KICKED') {
      throw GroupMemberException.previouslyKicked();
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

    // 멤버 추가
    let member;
    if (existingMember) {
      // 이전에 나간 멤버 재가입
      member = await prisma.groupMember.update({
        where: { id: existingMember.id },
        data: {
          status: 'ACTIVE',
          role,
          joinedAt: new Date(),
          leftAt: null
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          }
        }
      });
    } else {
      // 신규 멤버 추가
      member = await prisma.groupMember.create({
        data: {
          groupId,
          userId,
          role,
          status: 'ACTIVE'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          }
        }
      });
    }

    GroupLogger.logMemberAdded(groupId, session.user.id, userId, role);

    return Response.json({
      success: true,
      data: {
        id: member.id,
        role: member.role,
        status: member.status,
        joinedAt: member.joinedAt,
        user: member.user
      },
      message: '멤버가 성공적으로 추가되었습니다.'
    }, { status: 201 });

  } catch (error) {
    if (error.code?.startsWith('GROUP-')) {
      return Response.json(
        { success: false, error: error.toJSON() },
        { status: error.statusCode }
      );
    }

    GroupLogger.error('Failed to add group member', {
      error: error.message,
      stack: error.stack
    });
    return Response.json(
      {
        success: false,
        error: {
          code: 'GROUP-INTERNAL-ERROR',
          message: '멤버 추가에 실패했습니다.'
        }
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/groups/[id]/members
 * 멤버 제거 (ADMIN 이상)
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
    const userId = searchParams.get('userId');
    const action = searchParams.get('action') || 'remove'; // remove, kick

    if (!userId) {
      throw GroupMemberException.memberIdRequired();
    }

    // 그룹 존재 확인
    await checkGroupExists(groupId, prisma);

    // 권한 확인 (ADMIN 이상)
    const myMembership = await checkGroupPermission(groupId, session.user.id, 'ADMIN', prisma);

    // 대상 멤버 확인
    const targetMember = await checkMemberExists(groupId, userId, prisma);

    // OWNER는 제거 불가
    if (targetMember.role === 'OWNER') {
      throw GroupPermissionException.cannotRemoveOwner();
    }

    // 자기 자신 제거 불가 (leave API 사용)
    if (userId === session.user.id) {
      throw GroupMemberException.cannotRemoveSelf();
    }

    // 역할 계층 확인
    if (!canManageMember(myMembership.role, targetMember.role)) {
      throw GroupPermissionException.insufficientRole(
        `${targetMember.role} 역할을 가진 멤버를 제거할 수 없습니다.`
      );
    }

    // 멤버 제거/강퇴
    const status = action === 'kick' ? 'KICKED' : 'LEFT';
    await prisma.groupMember.update({
      where: { id: targetMember.id },
      data: {
        status,
        leftAt: new Date()
      }
    });

    const logMessage = action === 'kick' ? '강퇴' : '제거';
    GroupLogger.logMemberRemoved(groupId, session.user.id, userId, logMessage);

    return Response.json({
      success: true,
      message: `멤버가 성공적으로 ${logMessage}되었습니다.`
    });

  } catch (error) {
    if (error.code?.startsWith('GROUP-')) {
      return Response.json(
        { success: false, error: error.toJSON() },
        { status: error.statusCode }
      );
    }

    GroupLogger.error('Failed to remove group member', {
      error: error.message,
      stack: error.stack
    });
    return Response.json(
      {
        success: false,
        error: {
          code: 'GROUP-INTERNAL-ERROR',
          message: '멤버 제거에 실패했습니다.'
        }
      },
      { status: 500 }
    );
  }
}

