import { prisma } from '../../config/database';

export class UserRepository {
  async findUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });
  }

  async findUserWithPassword(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        createdAt: true,
      },
    });
  }

  async updateUser(userId: string, data: { name?: string; passwordHash?: string }) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });
  }

  async getUserStats(userId: string) {
    const totalDecks = await prisma.category.count({
      where: { userId },
    });

    const totalCards = await prisma.flashcard.count({
      where: {
        category: {
          userId,
        },
      },
    });

    const learnedCards = await prisma.flashcard.count({
      where: {
        learned: true,
        category: {
          userId,
        },
      },
    });

    return {
      totalDecks,
      totalCards,
      learnedCards,
    };
  }
}
