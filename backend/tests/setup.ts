import { prisma } from '../src/config/database';

async function cleanDatabase() {
  await prisma.reviewSession.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.flashcard.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});
}

beforeAll(async () => {
  await cleanDatabase();
});

afterAll(async () => {
  await cleanDatabase();
  await prisma.$disconnect();
});
