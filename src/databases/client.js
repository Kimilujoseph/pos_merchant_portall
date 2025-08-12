import { PrismaClient } from '@prisma/client';

/**
 * @type {PrismaClient}
 */
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    transactionOptions: {
      timeout: 20000, // 20 seconds for production
    },
  });
} else {
  // In development, use a global variable to avoid creating multiple clients during hot-reloading.
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      transactionOptions: {
        timeout: 20000, // 20 seconds for development
      },
    });
  }
  prisma = global.prisma;
}

export default prisma;
