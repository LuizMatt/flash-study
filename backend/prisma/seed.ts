import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean the database
  await prisma.reviewSession.deleteMany();
  await prisma.flashcard.deleteMany();
  await prisma.category.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // Create standard user
  const passwordHash = await bcrypt.hash('password123', 12);
  const user = await prisma.user.create({
    data: {
      name: 'João Silva',
      email: 'joao@gmail.com',
      passwordHash: passwordHash,
    },
  });

  console.log(`👤 Created user: ${user.email}`);

  // Create Categories
  const categoryLanguages = await prisma.category.create({
    data: {
      userId: user.id,
      name: 'Idiomas',
      color: '#3B82F6', // Blue
      icon: 'language-outline',
    },
  });

  const categoryProgramming = await prisma.category.create({
    data: {
      userId: user.id,
      name: 'Programação',
      color: '#10B981', // Green
      icon: 'code-slash-outline',
    },
  });

  console.log('📁 Created categories');

  // Create Flashcards for Idiomas
  await prisma.flashcard.createMany({
    data: [
      {
        categoryId: categoryLanguages.id,
        front: 'Como se diz "bom dia" em japonês?',
        back: 'Ohayou Gozaimasu (おはようございます)',
        learned: false,
      },
      {
        categoryId: categoryLanguages.id,
        front: 'O que significa "break a leg" em inglês?',
        back: 'Uma expressão idiomática usada para desejar "boa sorte" a alguém, especialmente antes de uma apresentação teatral.',
        learned: true,
      },
      {
        categoryId: categoryLanguages.id,
        front: 'Como se diz "obrigado" em francês?',
        back: 'Merci',
        learned: false,
      },
    ],
  });

  // Create Flashcards for Programação
  await prisma.flashcard.createMany({
    data: [
      {
        categoryId: categoryProgramming.id,
        front: 'O que é uma Closure em JavaScript?',
        back: 'É a combinação de uma função com as referências ao estado adjacente (o escopo léxico). Em outras palavras, uma closure dá acesso ao escopo de uma função externa a partir de uma função interna.',
        learned: false,
      },
      {
        categoryId: categoryProgramming.id,
        front: 'Qual a diferença entre "==" e "===" em JavaScript?',
        back: '"==" compara apenas o valor após coerção de tipo. "===" compara o valor e o tipo, sem realizar coerção.',
        learned: false,
      },
      {
        categoryId: categoryProgramming.id,
        front: 'Para que serve o hook "useEffect" no React?',
        back: 'Serve para lidar com efeitos colaterais na aplicação (como chamadas de API, assinaturas, alteração direta do DOM) em componentes funcionais.',
        learned: false,
      },
    ],
  });

  console.log('⚡ Created flashcards');

  // Create a Review Session for this user
  await prisma.reviewSession.create({
    data: {
      userId: user.id,
      categoryId: categoryLanguages.id,
      date: new Date(),
      total: 3,
      correct: 1,
    },
  });

  console.log('📊 Created review session');

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
