import prisma from '@/lib/db/prisma';
import { createNotification } from './notificationService';

export async function createEvent(studyGroupId, creatorId, title, description, startTime, endTime) {
  const event = await prisma.event.create({
    data: {
      studyGroupId,
      creatorId,
      title,
      description,
      startTime,
      endTime,
    },
  });

  // Notify study members about the new event
  const members = await prisma.studyMember.findMany({
    where: { studyGroupId, status: 'ACTIVE' },
    select: { userId: true },
  });

  for (const member of members) {
    if (member.userId !== creatorId) { // Don't notify the creator
      await createNotification(
        member.userId,
        'NEW_EVENT',
        `새로운 일정이 등록되었습니다: ${title}`,
        `/studies/${studyGroupId}/calendar`
      );
    }
  }

  return event;
}

export async function getEventsByStudyGroup(studyGroupId) {
  return prisma.event.findMany({
    where: { studyGroupId },
    orderBy: { startTime: 'asc' },
  });
}

export async function updateEvent(eventId, data) {
  const updatedEvent = await prisma.event.update({
    where: { id: eventId },
    data,
  });

  // Notify study members about the updated event
  const members = await prisma.studyMember.findMany({
    where: { studyGroupId: updatedEvent.studyGroupId, status: 'ACTIVE' },
    select: { userId: true },
  });

  for (const member of members) {
    if (member.userId !== updatedEvent.creatorId) { // Don't notify the creator
      await createNotification(
        member.userId,
        'UPDATED_EVENT',
        `일정이 수정되었습니다: ${updatedEvent.title}`,
        `/studies/${updatedEvent.studyGroupId}/calendar`
      );
    }
  }

  return updatedEvent;
}

export async function deleteEvent(eventId) {
  const deletedEvent = await prisma.event.delete({
    where: { id: eventId },
  });

  // Notify study members about the deleted event
  const members = await prisma.studyMember.findMany({
    where: { studyGroupId: deletedEvent.studyGroupId, status: 'ACTIVE' },
    select: { userId: true },
  });

  for (const member of members) {
    if (member.userId !== deletedEvent.creatorId) { // Don't notify the creator
      await createNotification(
        member.userId,
        'DELETED_EVENT',
        `일정이 삭제되었습니다: ${deletedEvent.title}`,
        `/studies/${deletedEvent.studyGroupId}/calendar`
      );
    }
  }

  return deletedEvent;
}
