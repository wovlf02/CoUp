import prisma from '@/lib/db/prisma';

export async function createStudyGroup(data, creatorId) {
  const { name, description, goal, category, rules, visibility, maxMembers } = data;
  const newStudy = await prisma.studyGroup.create({
    data: {
      name,
      description,
      goal,
      category,
      rules,
      visibility,
      maxMembers,
      creatorId,
      studyMembers: {
        create: { userId: creatorId, role: 'ADMIN', status: 'ACTIVE' }, // Creator is automatically an active ADMIN member
      },
    },
  });
  return newStudy;
}

export async function getStudyGroupById(studyId) {
  return prisma.studyGroup.findUnique({
    where: { id: studyId },
    include: { creator: true, studyMembers: { include: { user: true } } },
  });
}

export async function getStudyGroups(filters = {}, options = {}) {
  const { category, search } = filters;
  const { skip, take } = options;

  const where = {
    visibility: 'PUBLIC',
    ...(category && { category }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const studies = await prisma.studyGroup.findMany({
    where,
    include: { creator: true },
    skip,
    take,
    orderBy: { createdAt: 'desc' },
  });

  const totalStudies = await prisma.studyGroup.count({ where });

  return { studies, totalStudies };
}

export async function updateStudyGroup(studyId, data) {
  return prisma.studyGroup.update({
    where: { id: studyId },
    data,
  });
}

export async function deleteStudyGroup(studyId) {
  return prisma.studyGroup.delete({
    where: { id: studyId },
  });
}

export async function requestJoinStudyGroup(studyGroupId, userId, joinMessage = null) {
  const existingMember = await prisma.studyMember.findUnique({
    where: { userId_studyGroupId: { userId, studyGroupId } },
  });

  if (existingMember) {
    throw new Error('User is already a member or has a pending request for this study group');
  }

  const studyGroup = await prisma.studyGroup.findUnique({
    where: { id: studyGroupId },
    include: { studyMembers: { include: { user: true } } },
  });

  if (!studyGroup) {
    throw new Error('Study group not found');
  }

  const newMember = await prisma.studyMember.create({
    data: {
      studyGroupId,
      userId,
      role: 'MEMBER',
      status: 'PENDING',
      joinMessage,
    },
  });

  return { newMember, studyGroup };
}

export async function manageJoinRequest(studyGroupId, memberId, action, performingUserId) {
  const studyGroup = await prisma.studyGroup.findUnique({
    where: { id: studyGroupId },
    include: { studyMembers: { include: { user: true } } },
  });

  if (!studyGroup) {
    throw new Error('Study group not found');
  }

  const performingUserMember = studyGroup.studyMembers.find(m => m.userId === performingUserId);

  if (!performingUserMember || (performingUserMember.role !== 'ADMIN' && performingUserMember.userId !== studyGroup.creatorId)) {
    throw new Error('Forbidden: Only group owner or admin can manage join requests');
  }

  const existingMember = await prisma.studyMember.findUnique({
    where: { id: memberId },
  });

  if (!existingMember || existingMember.studyGroupId !== studyGroupId || existingMember.status !== 'PENDING') {
    throw new Error('Join request not found or already processed');
  }

  let updatedMember;
  if (action === 'APPROVE') {
    updatedMember = await prisma.studyMember.update({
      where: { id: memberId },
      data: { status: 'ACTIVE' },
    });
  } else if (action === 'REJECT') {
    updatedMember = await prisma.studyMember.update({
      where: { id: memberId },
      data: { status: 'REJECTED' },
    });
  } else {
    throw new Error('Invalid action');
  }

  return { updatedMember, studyGroup, existingMember };
}

export async function addStudyMember(studyGroupId, userId, role = 'MEMBER', joinMessage = null) {
  return prisma.studyMember.create({
    data: {
      studyGroupId,
      userId,
      role,
      status: 'PENDING',
      joinMessage,
    },
  });
}

export async function updateStudyMemberStatus(memberId, status) {
  return prisma.studyMember.update({
    where: { id: memberId },
    data: { status },
  });
}

export async function removeStudyMember(studyGroupId, memberId, performingUserId) {
  const memberToRemove = await prisma.studyMember.findUnique({
    where: { id: memberId },
  });

  if (!memberToRemove || memberToRemove.studyGroupId !== studyGroupId) {
    throw new Error('Study member not found in this group');
  }

  const performingUserMember = await prisma.studyMember.findUnique({
    where: { userId_studyGroupId: { userId: performingUserId, studyGroupId } },
  });

  if (!performingUserMember || performingUserMember.status !== 'ACTIVE') {
    throw new Error('Performing user is not an active member of this study group');
  }

  // A user can remove themselves
  if (memberToRemove.userId === performingUserId) {
    return prisma.studyMember.delete({
      where: { id: memberId },
    });
  }

  // Only ADMIN can remove other members
  const studyGroup = await prisma.studyGroup.findUnique({ where: { id: studyGroupId } });
  if (performingUserMember.role !== 'ADMIN') {
    throw new Error('Forbidden: Only administrators can remove other members');
  }

  // ADMIN cannot remove another ADMIN or the creator
  if (memberToRemove.role === 'ADMIN' || memberToRemove.userId === studyGroup.creatorId) {
    throw new Error('Forbidden: Cannot remove an administrator or the group creator');
  }

  return prisma.studyMember.delete({
    where: { id: memberId },
  });
}

export async function getStudyMembers(studyGroupId) {
  return prisma.studyMember.findMany({
    where: { studyGroupId },
    orderBy: { joinedAt: 'asc' },
    include: { user: true },
  });
}

export async function updateStudyMemberRole(studyGroupId, memberId, newRole, performingUserId) {
  const memberToUpdate = await prisma.studyMember.findUnique({
    where: { id: memberId },
  });

  if (!memberToUpdate || memberToUpdate.studyGroupId !== studyGroupId) {
    throw new Error('Study member not found in this group');
  }

  const performingUserMember = await prisma.studyMember.findUnique({
    where: { userId_studyGroupId: { userId: performingUserId, studyGroupId } },
  });

  if (!performingUserMember || performingUserMember.status !== 'ACTIVE') {
    throw new Error('Performing user is not an active member of this study group');
  }

  // Only ADMIN can change roles
  if (performingUserMember.role !== 'ADMIN') {
    throw new Error('Forbidden: Only administrators can change member roles');
  }

  // Cannot change the role of the group creator
  const studyGroup = await prisma.studyGroup.findUnique({ where: { id: studyGroupId } });
  if (memberToUpdate.userId === studyGroup.creatorId) {
    throw new Error('Forbidden: Cannot change the role of the group creator');
  }

  return prisma.studyMember.update({
    where: { id: memberId },
    data: { role: newRole },
  });
}
