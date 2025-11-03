import prisma from '@/lib/db/prisma';

export async function getUserById(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
  });
}

export async function updateUserProfile(userId, data) {
  return prisma.user.update({
    where: { id: userId },
    data: data,
  });
}

export async function deleteUser(userId) {
  return prisma.user.delete({
    where: { id: userId },
  });
}

export async function updateUserOnlineStatus(userId, isOnline) {
  return prisma.user.update({
    where: { id: userId },
    data: { isOnline },
  });
}
