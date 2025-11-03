import prisma from '@/lib/db/prisma';

export async function createChatMessage(studyGroupId, senderId, content) {
  return prisma.chatMessage.create({
    data: {
      studyGroupId,
      senderId,
      content,
    },
  });
}

export async function getChatMessages(studyGroupId, cursor = null, limit = 50) {
  return prisma.chatMessage.findMany({
    where: { studyGroupId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
  });
}
