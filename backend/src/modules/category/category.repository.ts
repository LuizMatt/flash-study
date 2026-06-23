import { prisma } from '../../config/database';

export class CategoryRepository {
  async create(data: { name: string; color: string; icon: string; userId: string }) {
    return prisma.category.create({
      data,
    });
  }

  async update(id: string, data: { name?: string; color?: string; icon?: string }) {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.category.delete({
      where: { id },
    });
  }

  async findRawById(id: string) {
    return prisma.category.findUnique({
      where: { id },
    });
  }

  async findByNameAndUserId(name: string, userId: string) {
    return prisma.category.findFirst({
      where: {
        userId,
        name: {
          equals: name,
          mode: 'insensitive', // Garante busca case-insensitive para evitar nomes duplicados com capitalizações diferentes
        },
      },
    });
  }

  async findByIdAndUserId(id: string, userId: string) {
    const category = await prisma.category.findFirst({
      where: { id, userId },
      include: {
        _count: {
          select: {
            flashcards: true,
          },
        },
        flashcards: {
          select: {
            learned: true,
          },
        },
      },
    });

    if (!category) {
      return null;
    }

    return {
      id: category.id,
      name: category.name,
      color: category.color,
      icon: category.icon,
      userId: category.userId,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      totalCards: category._count.flashcards,
      learnedCards: category.flashcards.filter((f) => f.learned).length,
    };
  }

  async findManyWithCounts(userId: string) {
    const categories = await prisma.category.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            flashcards: true,
          },
        },
        flashcards: {
          select: {
            learned: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      icon: c.icon,
      userId: c.userId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      totalCards: c._count.flashcards,
      learnedCards: c.flashcards.filter((f) => f.learned).length,
    }));
  }
}
