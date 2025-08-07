
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash('password', salt);

  await prisma.actors.upsert({
    where: { email: 'testuser@example.com' },
    update: {},
    create: {
      name: 'Test User',
      email: 'testuser@example.com',
      password: hashedPassword,
      phone: '1234567890',
      nextofkinname: 'Test Next of Kin',
      nextofkinphonenumber: '0987654321',
      role: 'seller',
    },
  });

  const shop = await prisma.shops.findFirst({
    where: { shopName: 'Main Street' },
  });

  if (!shop) {
    await prisma.shops.create({
      data: {
        shopName: 'Main Street',
        address: '123 Main St',
      },
    });
  }

  await prisma.categories.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      itemName: 'Mobile Phones',
      itemModel: 'Smartphones',
      minPrice: 100,
      maxPrice: 1000,
      itemType: 'mobiles',
    },
  });

  await prisma.categories.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      itemName: 'Accessories',
      itemModel: 'Cases',
      minPrice: 10,
      maxPrice: 100,
      itemType: 'accessories',
    },
  });

  await prisma.mobiles.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      productCost: 10000,
      CategoryId: 1,
    },
  });

  await prisma.accessories.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      productCost: 500,
      CategoryId: 2,
      batchNumber: 'batch123',
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
