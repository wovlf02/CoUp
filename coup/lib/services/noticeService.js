import prisma from '@/lib/db/prisma';
import { createNotification } from './notificationService';

export async function createNotice(studyGroupId, authorId, title, content) {
  const notice = await prisma.notice.create({
    data: {
      studyGroupId,
      authorId,
      title,
      content,
    },
  });

  // Notify study members about the new notice
  const members = await prisma.studyMember.findMany({
    where: { studyGroupId, status: 'ACTIVE' },
    select: { userId: true },
  });

  for (const member of members) {
    if (member.userId !== authorId) { // Don't notify the author
      await createNotification(
        member.userId,
        'NEW_NOTICE',
        `새로운 공지사항이 등록되었습니다: ${title}`,
        `/studies/${studyGroupId}/notices`
      );
    }
  }

  return notice;
}

export async function getNoticesByStudyGroup(studyGroupId) {
  return prisma.notice.findMany({
    where: { studyGroupId },
    orderBy: { createdAt: 'desc' },
    include: { author: true },
  });
}

export async function updateNotice(noticeId, data) {
  const updatedNotice = await prisma.notice.update({
    where: { id: noticeId },
    data,
  });

  // Notify study members about the updated notice
  const members = await prisma.studyMember.findMany({
    where: { studyGroupId: updatedNotice.studyGroupId, status: 'ACTIVE' },
    select: { userId: true },
  });

  for (const member of members) {
    if (member.userId !== updatedNotice.authorId) { // Don't notify the author
      await createNotification(
        member.userId,
        'UPDATED_NOTICE',
        `공지사항이 수정되었습니다: ${updatedNotice.title}`,
        `/studies/${updatedNotice.studyGroupId}/notices`
      );
    }
  }

  return updatedNotice;
}

export async function deleteNotice(noticeId) {
  const deletedNotice = await prisma.notice.delete({
    where: { id: noticeId },
  });

  // Notify study members about the deleted notice
  const members = await prisma.studyMember.findMany({
    where: { studyGroupId: deletedNotice.studyGroupId, status: 'ACTIVE' },
    select: { userId: true },
  });

  for (const member of members) {
    if (member.userId !== deletedNotice.authorId) { // Don't notify the author
      await createNotification(
        member.userId,
        'DELETED_NOTICE',
        `공지사항이 삭제되었습니다: ${deletedNotice.title}`,
        `/studies/${deletedNotice.studyGroupId}/notices`
      );
    }
  }

  return deletedNotice;
}
