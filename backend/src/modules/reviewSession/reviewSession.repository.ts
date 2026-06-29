import { prisma } from '../../config/database';

type CreateReviewSessionData = {
  userId: string;
  categoryId: string;
  total: number;
  correct: number;
  date: Date;
};

export class ReviewSessionRepository {
  async create(data: CreateReviewSessionData) {
    return prisma.reviewSession.create({
      data,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
    });
  }

  async findManyByUserId(userId: string) {
    return prisma.reviewSession.findMany({
      where: { userId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
      orderBy: [
        { date: 'asc' },
        { createdAt: 'asc' },
      ],
    });
  }
}

