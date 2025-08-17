import { PrismaClient } from '@prisma/client';
import { APIError, STATUS_CODE } from '../../Utils/app-error.js';

const prisma = new PrismaClient();

class SalaryRepository {
  async createSalaryPayment(data) {
    try {
      return await prisma.salaryPayment.create({
        data,
      });
    } catch (err) {
      throw new APIError(
        'Database Error',
        STATUS_CODE.INTERNAL_ERROR,
        'Failed to create salary payment'
      );
    }
  }
}

export { SalaryRepository };
