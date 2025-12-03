/**
 * /api/groups/[id]/route.js
 *
 * 그룹 상세 조회, 수정, 삭제 API
 *
 * @routes
 * - GET    /api/groups/[id] - 그룹 상세 조회
 * - PATCH  /api/groups/[id] - 그룹 수정 (ADMIN 이상)
 * - DELETE /api/groups/[id] - 그룹 삭제 (OWNER만)
 *
 * @author CoUp Team
 * @created 2025-12-03
 */

import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  GroupBusinessException,
  GroupPermissionException
} from '@/lib/exceptions/group';
import { GroupLogger } from '@/lib/logging/groupLogger';
import {
  formatGroupResponse,
  checkGroupExists,
  checkGroupAccess,
  checkGroupPermission,
  checkDuplicateGroupName
} from '@/lib/helpers/group-helpers';
import { validateGroupData } from '@/lib/validators/group-validators';

/**
 * GET /api/groups/[id]
 * 그룹 상세 조회
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

    // 그룹 존재 확인 및 조회
    await checkGroupExists(groupId, prisma);

    // 접근 권한 확인 (비공개 그룹의 경우)
    await checkGroupAccess(groupId, session.user.id, prisma);

    // 상세 정보 조회
    const detailedGroup = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        _count: {
          select: {
            members: { where: { status: 'ACTIVE' } }
          }
        },
        members: {
          where: { status: 'ACTIVE' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          },
          orderBy: [
            { role: 'desc' },
            { joinedAt: 'asc' }
          ]
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    // 현재 사용자의 멤버십 정보
    const myMembership = detailedGroup.members.find(m => m.userId === session.user.id);

    GroupLogger.info('Group detail retrieved', {
      groupId,
      userId: session.user.id
    });

    return Response.json({
      success: true,
      data: {
        ...formatGroupResponse(detailedGroup),
        currentMembers: detailedGroup._count.members,
        members: detailedGroup.members.map(m => ({
          id: m.id,
          role: m.role,
          status: m.status,
          joinedAt: m.joinedAt,
          user: m.user
        })),
        creator: detailedGroup.creator,
        myRole: myMembership?.role || null,
        myStatus: myMembership?.status || null,
        isMember: !!myMembership
      }
    });

  } catch (error) {
    if (error.code?.startsWith('GROUP-')) {
      GroupLogger.warn('Failed to retrieve group detail', {
        error: error.toJSON()
      });
      return Response.json(
        { success: false, error: error.toJSON() },
        { status: error.statusCode }
      );
    }

    GroupLogger.error('Failed to retrieve group detail', {
      error: error.message,
      stack: error.stack
    });
    return Response.json(
      {
        success: false,
        error: {
          code: 'GROUP-INTERNAL-ERROR',
          message: '그룹 조회에 실패했습니다.'
        }
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/groups/[id]
 * 그룹 수정 (ADMIN 이상)
 *
 * @param {Request} request
 * @param {Object} context
 * @returns {Response}
 */
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      throw GroupBusinessException.authenticationRequired();
    }

    const groupId = params.id;
    const body = await request.json();

    // 그룹 존재 확인
    await checkGroupExists(groupId, prisma);

    // 수정 권한 확인 (ADMIN 이상)
    await checkGroupPermission(groupId, session.user.id, 'ADMIN', prisma);

    // 입력 검증 (부분 업데이트)
    const updateData = {};

    if (body.name !== undefined) {
      // 이름 변경 시 중복 확인
      await checkDuplicateGroupName(body.name, groupId, prisma);
      updateData.name = body.name;
    }

    if (body.description !== undefined) {
      updateData.description = body.description;
    }

    if (body.category !== undefined) {
      updateData.category = body.category;
    }

    if (body.isPublic !== undefined) {
      updateData.isPublic = body.isPublic;
    }

    if (body.maxMembers !== undefined) {
      // 현재 멤버 수 확인
      const currentMemberCount = await prisma.groupMember.count({
        where: {
          groupId,
          status: 'ACTIVE'
        }
      });

      if (body.maxMembers < currentMemberCount) {
        throw GroupBusinessException.invalidCapacity(
          `현재 멤버 수(${currentMemberCount})보다 작은 정원으로 변경할 수 없습니다.`
        );
      }

      updateData.maxMembers = body.maxMembers;
    }

    if (body.isRecruiting !== undefined) {
      updateData.isRecruiting = body.isRecruiting;
    }

    if (body.imageUrl !== undefined) {
      updateData.imageUrl = body.imageUrl;
    }

    // 업데이트할 내용이 없으면 에러
    if (Object.keys(updateData).length === 0) {
      throw GroupBusinessException.noUpdateData();
    }

    // 그룹 업데이트
    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: updateData
    });

    GroupLogger.logGroupUpdated(groupId, session.user.id, updateData);

    return Response.json({
      success: true,
      data: formatGroupResponse(updatedGroup),
      message: '그룹이 성공적으로 수정되었습니다.'
    });

  } catch (error) {
    if (error.code?.startsWith('GROUP-')) {
      GroupLogger.warn('Failed to update group', {
        error: error.toJSON()
      });
      return Response.json(
        { success: false, error: error.toJSON() },
        { status: error.statusCode }
      );
    }

    GroupLogger.error('Failed to update group', {
      error: error.message,
      stack: error.stack
    });
    return Response.json(
      {
        success: false,
        error: {
          code: 'GROUP-INTERNAL-ERROR',
          message: '그룹 수정에 실패했습니다.'
        }
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/groups/[id]
 * 그룹 삭제 (OWNER만)
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

    // 그룹 존재 확인
    await checkGroupExists(groupId, prisma);

    // 삭제 권한 확인 (OWNER만)
    await checkGroupPermission(groupId, session.user.id, 'OWNER', prisma);

    // 활성 멤버 확인 (OWNER 제외)
    const activeMemberCount = await prisma.groupMember.count({
      where: {
        groupId,
        status: 'ACTIVE',
        userId: { not: session.user.id }
      }
    });

    if (activeMemberCount > 0) {
      throw GroupBusinessException.groupHasActiveMembers(
        `그룹에 ${activeMemberCount}명의 활성 멤버가 있어 삭제할 수 없습니다. 먼저 모든 멤버를 제거해주세요.`
      );
    }

    // Soft delete
    await prisma.group.update({
      where: { id: groupId },
      data: {
        deletedAt: new Date()
      }
    });

    GroupLogger.logGroupDeleted(groupId, session.user.id);

    return Response.json({
      success: true,
      message: '그룹이 성공적으로 삭제되었습니다.'
    });

  } catch (error) {
    if (error.code?.startsWith('GROUP-')) {
      GroupLogger.warn('Failed to delete group', {
        error: error.toJSON()
      });
      return Response.json(
        { success: false, error: error.toJSON() },
        { status: error.statusCode }
      );
    }

    GroupLogger.error('Failed to delete group', {
      error: error.message,
      stack: error.stack
    });
    return Response.json(
      {
        success: false,
        error: {
          code: 'GROUP-INTERNAL-ERROR',
          message: '그룹 삭제에 실패했습니다.'
        }
      },
      { status: 500 }
    );
  }
}

