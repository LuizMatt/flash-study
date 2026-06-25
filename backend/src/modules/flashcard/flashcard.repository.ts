import { prisma } from '../../config/database';

export class FlashcardRepository {
  async create(data: { categoryId: string; front: string; back: string }) {
    return prisma.flashcard.create({
      data,
    });
  }

  async update(id: string, data: { front?: string; back?: string; learned?: boolean }) {
    return prisma.flashcard.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.flashcard.delete({
      where: { id },
    });
  }

  async findById(id: string) {
    return prisma.flashcard.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
    });
  }

  async findMany(filters: { userId: string; categoryId?: string; learned?: boolean }) {
    const where: any = {
      category: {
        userId: filters.userId,
      },
    };

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.learned !== undefined) {
      where.learned = filters.learned;
    }

    return prisma.flashcard.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async resetLearnedStatus(categoryId: string) {
    return prisma.flashcard.updateMany({
      where: { categoryId },
      data: { learned: false },
    });
  }
}
