import prisma from '@/lib/db/prisma';

export class UserService {
  static async getUserById(userId) {
    return prisma.user.findUnique({
      where: { id: userId },
    });
  }

  static async updateUser(userId, data) {
    return prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  static async deleteUser(userId) {
    return prisma.user.delete({
      where: { id: userId },
    });
  }
}
