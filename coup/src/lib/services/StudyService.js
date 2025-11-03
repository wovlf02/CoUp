import prisma, { StudyRole, StudyMemberStatus, StudyVisibility } from '@/lib/db/prisma';
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  },
});

export class StudyService {
  static async getStudyGroups(filters, pagination) {
    const { category, search } = filters;
    const { skip, take } = pagination;

    const where = {};
    if (category) {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const studies = await prisma.studyGroup.findMany({
      where,
      take,
      skip,
      include: {
        owner: { select: { id: true, name: true, imageUrl: true } },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    const totalStudies = await prisma.studyGroup.count({ where });

    return { studies, totalStudies };
  }

  static async getStudyGroupById(studyId) {
    return prisma.studyGroup.findUnique({
      where: {
        id: studyId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });
  }

  static async createStudyGroup(data, userId) {
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
        creatorId: userId,
        studyMembers: {
          create: { userId: userId, role: StudyRole.OWNER, status: StudyMemberStatus.ACTIVE }, // Owner is automatically an active member
        },
      },
    });
    return newStudy;
  }

  static async updateStudyGroup(studyId, data) {
    return prisma.studyGroup.update({
      where: {
        id: studyId,
      },
      data,
      include: {
        owner: {
          select: {
            id: true,
            name: true, 
            imageUrl: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });
  }

  static async deleteStudyGroup(studyId) {
    return prisma.studyGroup.delete({
      where: {
        id: studyId,
      },
    });
  }

  static async requestJoinStudyGroup(studyId, userId, joinMessage) {
    const studyGroup = await prisma.studyGroup.findUnique({
      where: { id: studyId },
      select: { visibility: true, maxMembers: true, studyMembers: { select: { id: true, status: true, userId: true, role: true } } },
    });

    if (!studyGroup) {
      throw new Error('Study group not found');
    }

    if (studyGroup.visibility === StudyVisibility.PRIVATE) {
      throw new Error('Cannot join a private study group directly');
    }

    const activeMembers = studyGroup.studyMembers.filter(member => member.status === StudyMemberStatus.ACTIVE).length;
    if (studyGroup.maxMembers && activeMembers >= studyGroup.maxMembers) {
      throw new Error('Study group is full');
    }

    const existingMembership = await prisma.studyMember.findFirst({
      where: {
        userId: userId,
        studyGroupId: studyId,
        status: { in: [StudyMemberStatus.PENDING, StudyMemberStatus.ACTIVE] },
      },
    });

    if (existingMembership) {
      throw new Error('You are already a member or your request is pending');
    }

    const newMember = await prisma.studyMember.create({
      data: {
        userId: userId,
        studyGroupId: studyId,
        role: StudyRole.MEMBER,
        status: StudyMemberStatus.PENDING,
        joinMessage: joinMessage || null,
      },
    });

    return { newMember, studyGroup };
  }

  static async manageJoinRequest(studyId, memberId, action) {
    const studyGroup = await prisma.studyGroup.findUnique({
      where: { id: studyId },
      select: { creatorId: true, maxMembers: true, name: true },
    });

    if (!studyGroup) {
      throw new Error('Study group not found');
    }

    const existingMember = await prisma.studyMember.findUnique({
      where: { id: memberId, studyGroupId: studyId },
      select: { userId: true, status: true },
    });

    if (!existingMember) {
      throw new Error('Study member not found');
    }

    if (existingMember.status !== StudyMemberStatus.PENDING) {
      throw new Error('Member status is not pending');
    }

    let updatedMember;
    if (action === 'APPROVE') {
      const currentMembersCount = await prisma.studyMember.count({
        where: { studyGroupId: studyId, status: StudyMemberStatus.ACTIVE },
      });

      if (studyGroup.maxMembers && currentMembersCount >= studyGroup.maxMembers) {
        throw new Error('Study group is already full');
      }

      updatedMember = await prisma.studyMember.update({
        where: { id: memberId },
        data: { status: StudyMemberStatus.ACTIVE },
      });
    } else if (action === 'REJECT') {
      updatedMember = await prisma.studyMember.update({
        where: { id: memberId },
        data: { status: StudyMemberStatus.REJECTED },
      });
    } else {
      throw new Error('Invalid action');
    }

    return { updatedMember, studyGroup, existingMember };
  }

  static async updateStudyMemberRole(studyId, memberId, role, requestingUserId) {
    const studyGroup = await prisma.studyGroup.findUnique({
      where: { id: studyId },
      select: { creatorId: true },
    });

    if (!studyGroup) {
      throw new Error('Study group not found');
    }

    const requestingMember = await prisma.studyMember.findFirst({
      where: { studyGroupId: studyId, userId: requestingUserId },
      select: { role: true },
    });

    const isOwner = studyGroup.creatorId === requestingUserId;
    const isAdmin = requestingMember && requestingMember.role === StudyRole.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new Error('You are not authorized to change member roles in this study group');
    }

    const targetMember = await prisma.studyMember.findUnique({
      where: { id: memberId },
      select: { userId: true, role: true },
    });

    if (!targetMember) {
      throw new Error('Target member not found');
    }

    if (targetMember.userId === studyGroup.creatorId && targetMember.userId !== requestingUserId) {
      throw new Error('Only the owner can change their own role');
    }

    if (targetMember.userId === studyGroup.creatorId && requestingUserId !== studyGroup.creatorId) {
      throw new Error('Only the owner can change the owner\'s role');
    }

    if (targetMember.role === StudyRole.ADMIN && role !== StudyRole.ADMIN) {
      const otherAdmins = await prisma.studyMember.count({
        where: {
          studyGroupId: studyId,
          role: StudyRole.ADMIN,
          userId: { not: targetMember.userId },
        },
      });
      const hasOtherOwner = studyGroup.creatorId !== targetMember.userId;

      if (otherAdmins === 0 && !hasOtherOwner) {
        throw new Error('Cannot demote the last admin/owner of the study group');
      }
    }

    const updatedMember = await prisma.studyMember.update({
      where: { id: memberId, studyGroupId: studyId },
      data: { role },
    });

    return updatedMember;
  }

  static async removeStudyMember(studyId, memberId, requestingUserId) {
    const studyGroup = await prisma.studyGroup.findUnique({
      where: { id: studyId },
      select: { creatorId: true },
    });

    if (!studyGroup) {
      throw new Error('Study group not found');
    }

    const requestingMember = await prisma.studyMember.findFirst({
      where: { studyGroupId: studyId, userId: requestingUserId },
      select: { role: true },
    });

    const isOwner = studyGroup.creatorId === requestingUserId;
    const isAdmin = requestingMember && requestingMember.role === StudyRole.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new Error('You are not authorized to remove members from this study group');
    }

    const memberToRemove = await prisma.studyMember.findUnique({
      where: { id: memberId },
      select: { userId: true, role: true },
    });

    if (!memberToRemove) {
      throw new Error('Study member not found');
    }

    if (memberToRemove.userId === requestingUserId && isOwner) {
      throw new Error('You cannot remove yourself as the owner');
    }

    if (memberToRemove.role === StudyRole.ADMIN || memberToRemove.userId === studyGroup.creatorId) {
      const totalAdmins = await prisma.studyMember.count({
        where: {
          studyGroupId: studyId,
          role: StudyRole.ADMIN,
        },
      });
      const totalOwners = await prisma.studyGroup.count({
        where: {
          id: studyId,
          creatorId: { not: null },
        },
      });

      if (memberToRemove.role === StudyRole.ADMIN && totalAdmins === 1 && !isOwner) {
        throw new Error('Cannot remove the last admin of the study group');
      }
      if (memberToRemove.userId === studyGroup.creatorId && totalOwners === 1 && totalAdmins === 0) {
        throw new Error('Cannot remove the last owner of the study group');
      }
    }

    await prisma.studyMember.delete({
      where: { id: memberId, studyGroupId: studyId },
    });
  }

  static async getNotices(studyId, userId) {
    const isMember = await prisma.studyMember.findFirst({
      where: { studyGroupId: studyId, userId: userId, status: StudyMemberStatus.ACTIVE },
    });

    if (!isMember) {
      throw new Error('You are not a member of this study group');
    }

    const notices = await prisma.notice.findMany({
      where: { studyGroupId: studyId },
      include: { author: { select: { id: true, name: true, imageUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return notices;
  }

  static async createNotice(studyId, userId, title, content) {
    const studyGroup = await prisma.studyGroup.findUnique({
      where: { id: studyId },
      select: { creatorId: true, name: true },
    });

    if (!studyGroup) {
      throw new Error('Study group not found');
    }

    const isCreator = studyGroup.creatorId === userId;

    const studyMember = await prisma.studyMember.findFirst({
      where: { studyGroupId: studyId, userId: userId, status: StudyMemberStatus.ACTIVE },
      select: { role: true },
    });

    const isAdmin = studyMember && studyMember.role === StudyRole.ADMIN;

    if (!isCreator && !isAdmin) {
      throw new Error('You are not authorized to create notices in this study group');
    }

    const newNotice = await prisma.notice.create({
      data: {
        studyGroupId: studyId,
        authorId: userId,
        title,
        content,
      },
    });

    return { newNotice, studyGroup };
  }

  static async updateNotice(studyId, noticeId, userId, title, content) {
    const studyGroup = await prisma.studyGroup.findUnique({
      where: { id: studyId },
      select: { creatorId: true },
    });

    if (!studyGroup) {
      throw new Error('Study group not found');
    }

    const isCreator = studyGroup.creatorId === userId;

    const studyMember = await prisma.studyMember.findFirst({
      where: { studyGroupId: studyId, userId: userId, status: StudyMemberStatus.ACTIVE },
      select: { role: true },
    });

    const isAdmin = studyMember && studyMember.role === StudyRole.ADMIN;

    if (!isCreator && !isAdmin) {
      throw new Error('You are not authorized to update notices in this study group');
    }

    const updatedNotice = await prisma.notice.update({
      where: { id: noticeId, studyGroupId: studyId },
      data: {
        title,
        content,
      },
    });

    return updatedNotice;
  }

  static async deleteNotice(studyId, noticeId, userId) {
    const studyGroup = await prisma.studyGroup.findUnique({
      where: { id: studyId },
      select: { creatorId: true },
    });

    if (!studyGroup) {
      throw new Error('Study group not found');
    }

    const isCreator = studyGroup.creatorId === userId;

    const studyMember = await prisma.studyMember.findFirst({
      where: { studyGroupId: studyId, userId: userId, status: StudyMemberStatus.ACTIVE },
      select: { role: true },
    });

    const isAdmin = studyMember && studyMember.role === StudyRole.ADMIN;

    if (!isCreator && !isAdmin) {
      throw new Error('You are not authorized to delete notices from this study group');
    }

    await prisma.notice.delete({
      where: { id: noticeId, studyGroupId: studyId },
    });
  }

  static async getFiles(studyId, userId) {
    const isMember = await prisma.studyMember.findFirst({
      where: { studyGroupId: studyId, userId: userId, status: StudyMemberStatus.ACTIVE },
    });

    if (!isMember) {
      throw new Error('You are not a member of this study group');
    }

    const files = await prisma.file.findMany({
      where: { studyGroupId: studyId },
      include: { uploader: { select: { id: true, name: true, imageUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return files;
  }

  static async createFile(studyId, userId, fileName, fileUrl, fileSize, fileType) {
    const studyMember = await prisma.studyMember.findFirst({
      where: { studyGroupId: studyId, userId: userId, status: StudyMemberStatus.ACTIVE },
    });

    if (!studyMember) {
      throw new Error('You are not a member of this study group');
    }

    const newFile = await prisma.file.create({
      data: {
        studyGroupId: studyId,
        uploaderId: userId,
        fileName,
        fileUrl,
        fileSize,
        fileType,
      },
    });

    return newFile;
  }

  static async deleteFile(studyId, fileId, userId) {
    const fileToDelete = await prisma.file.findUnique({
      where: { id: fileId, studyGroupId: studyId },
      select: { uploaderId: true, fileUrl: true },
    });

    if (!fileToDelete) {
      throw new Error('File not found');
    }

    const studyGroup = await prisma.studyGroup.findUnique({
      where: { id: studyId },
      select: { creatorId: true },
    });

    if (!studyGroup) {
      throw new Error('Study group not found');
    }

    const isCreator = studyGroup.creatorId === userId;

    const studyMember = await prisma.studyMember.findFirst({
      where: { studyGroupId: studyId, userId: userId, status: StudyMemberStatus.ACTIVE },
      select: { role: true },
    });

    const isAdmin = studyMember && studyMember.role === StudyRole.ADMIN;

    if (fileToDelete.uploaderId !== userId && !isCreator && !isAdmin) {
      throw new Error('You are not authorized to delete this file');
    }

    // Extract S3 Key from fileUrl
    const fileUrl = new URL(fileToDelete.fileUrl);
    const s3Key = fileUrl.pathname.substring(1); // Remove leading slash

    // Delete from S3
    await s3Client.send(new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: s3Key,
    }));

    // Delete from DB
    await prisma.file.delete({
      where: { id: fileId, studyGroupId: studyId },
    });
  }

  static async getEvents(studyId, userId) {
    const isMember = await prisma.studyMember.findFirst({
      where: { studyGroupId: studyId, userId: userId, status: StudyMemberStatus.ACTIVE },
    });

    if (!isMember) {
      throw new Error('You are not a member of this study group');
    }

    const events = await prisma.event.findMany({
      where: { studyGroupId: studyId },
      include: { creator: { select: { id: true, name: true, imageUrl: true } } },
      orderBy: { startTime: 'asc' },
    });

    return events;
  }

  static async createEvent(studyId, userId, title, description, startTime, endTime) {
    const studyGroup = await prisma.studyGroup.findUnique({
      where: { id: studyId },
      select: { creatorId: true, name: true },
    });

    if (!studyGroup) {
      throw new Error('Study group not found');
    }

    const isCreator = studyGroup.creatorId === userId;

    const studyMember = await prisma.studyMember.findFirst({
      where: { studyGroupId: studyId, userId: userId, status: StudyMemberStatus.ACTIVE },
      select: { role: true },
    });

    const isAdmin = studyMember && studyMember.role === StudyRole.ADMIN;

    if (!isCreator && !isAdmin) {
      throw new Error('You are not authorized to create events in this study group');
    }

    const newEvent = await prisma.event.create({
      data: {
        studyGroupId: studyId,
        creatorId: userId,
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
    });

    return { newEvent, studyGroup };
  }

  static async updateEvent(studyId, eventId, userId, title, description, startTime, endTime) {
    const studyGroup = await prisma.studyGroup.findUnique({
      where: { id: studyId },
      select: { creatorId: true },
    });

    if (!studyGroup) {
      throw new Error('Study group not found');
    }

    const isCreator = studyGroup.creatorId === userId;

    const studyMember = await prisma.studyMember.findFirst({
      where: { studyGroupId: studyId, userId: userId, status: StudyMemberStatus.ACTIVE },
      select: { role: true },
    });

    const isAdmin = studyMember && studyMember.role === StudyRole.ADMIN;

    if (!isCreator && !isAdmin) {
      throw new Error('You are not authorized to update events in this study group');
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId, studyGroupId: studyId },
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
    });

    return updatedEvent;
  }

  static async deleteEvent(studyId, eventId, userId) {
    const studyGroup = await prisma.studyGroup.findUnique({
      where: { id: studyId },
      select: { creatorId: true },
    });

    if (!studyGroup) {
      throw new Error('Study group not found');
    }

    const isCreator = studyGroup.creatorId === userId;

    const studyMember = await prisma.studyMember.findFirst({
      where: { studyGroupId: studyId, userId: userId, status: StudyMemberStatus.ACTIVE },
      select: { role: true },
    });

    const isAdmin = studyMember && studyMember.role === StudyRole.ADMIN;

    if (!isCreator && !isAdmin) {
      throw new Error('You are not authorized to delete events from this study group');
    }

    await prisma.event.delete({
      where: { id: eventId, studyGroupId: studyId },
    });
  }

  static async getTasks(studyId, userId) {
    const isMember = await prisma.studyMember.findFirst({
      where: { studyGroupId: studyId, userId: userId, status: StudyMemberStatus.ACTIVE },
    });

    if (!isMember) {
      throw new Error('You are not a member of this study group');
    }

    const tasks = await prisma.task.findMany({
      where: { studyGroupId: studyId },
      include: {
        creator: { select: { id: true, name: true, imageUrl: true } },
        assignee: { select: { id: true, name: true, imageUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tasks;
  }

  static async createTask(studyId, userId, title, description, dueDate, assigneeId) {
    const studyMember = await prisma.studyMember.findFirst({
      where: { studyGroupId: studyId, userId: userId, status: StudyMemberStatus.ACTIVE },
    });

    if (!studyMember) {
      throw new Error('You are not a member of this study group');
    }

    const newTask = await prisma.task.create({
      data: {
        studyGroupId: studyId,
        creatorId: userId,
        assigneeId: assigneeId || null,
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        isCompleted: false,
      },
    });

    return newTask;
  }

  static async updateTask(studyId, taskId, userId, data) {
    const { title, description, dueDate, assigneeId, isCompleted } = data;

    const existingTask = await prisma.task.findUnique({
      where: { id: taskId, studyGroupId: studyId },
      select: { creatorId: true, assigneeId: true },
    });

    if (!existingTask) {
      throw new Error('Task not found');
    }

    const studyGroup = await prisma.studyGroup.findUnique({
      where: { id: studyId },
      select: { creatorId: true },
    });

    if (!studyGroup) {
      throw new Error('Study group not found');
    }

    const isCreator = studyGroup.creatorId === userId;

    const studyMember = await prisma.studyMember.findFirst({
      where: { studyGroupId: studyId, userId: userId, status: StudyMemberStatus.ACTIVE },
      select: { role: true },
    });

    const isAdmin = studyMember && studyMember.role === StudyRole.ADMIN;

    if (existingTask.creatorId !== userId && existingTask.assigneeId !== userId && !isCreator && !isAdmin) {
      throw new Error('You are not authorized to update this task');
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId, studyGroupId: studyId },
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        assigneeId,
        isCompleted,
      },
    });

    return updatedTask;
  }

  static async deleteTask(studyId, taskId, userId) {
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId, studyGroupId: studyId },
      select: { creatorId: true },
    });

    if (!existingTask) {
      throw new Error('Task not found');
    }

    const studyGroup = await prisma.studyGroup.findUnique({
      where: { id: studyId },
      select: { creatorId: true },
    });

    if (!studyGroup) {
      throw new Error('Study group not found');
    }

    const isCreator = studyGroup.creatorId === userId;

    const studyMember = await prisma.studyMember.findFirst({
      where: { studyGroupId: studyId, userId: userId, status: StudyMemberStatus.ACTIVE },
      select: { role: true },
    });

    const isAdmin = studyMember && studyMember.role === StudyRole.ADMIN;

    if (existingTask.creatorId !== userId && !isCreator && !isAdmin) {
      throw new Error('You are not authorized to delete this task');
    }

    await prisma.task.delete({
      where: { id: taskId, studyGroupId: studyId },
    });
  }
}


