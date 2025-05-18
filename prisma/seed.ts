import { PrismaClient } from '../generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  // Create categories
  await prisma.category.upsert({
    where: { name: 'Thuốc kháng sinh' },
    update: {},
    create: {
      name: 'Thuốc kháng sinh',
      slug: 'thuoc-khang-sinh',
    },
  });

  await prisma.category.upsert({
    where: { name: 'Thuốc giảm đau' },
    update: {},
    create: {
      name: 'Thuốc giảm đau',
      slug: 'thuoc-giam-dau',
    },
  });

  await prisma.category.upsert({
    where: { name: 'Thuốc hỗ trợ' },
    update: {},
    create: {
      name: 'Thuốc hỗ trợ',
      slug: 'thuoc-ho-tro',
    },
  });

  // Create articles
  await prisma.article.create({
    data: {
      title: 'Cách sử dụng thuốc kháng sinh an toàn',
      content: 'Bài viết về cách sử dụng thuốc kháng sinh an toàn...',
      author: 'Admin',
      slug: 'cach-su-dung-thuoc-khang-sinh-an-toan',
    },
  });

  await prisma.article.create({
    data: {
      title: 'Tầm quan trọng của Vitamin C',
      content: 'Bài viết về tầm quan trọng của Vitamin C...',
      author: 'Admin',
      slug: 'tam-quan-trong-cua-vitamin-c',
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
