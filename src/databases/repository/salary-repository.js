import { PrismaClient } from '@prisma/client';
import { APIError, STATUS_CODE } from '../../Utils/app-error.js';

const prisma = new PrismaClient();

class SalaryRepository {
  async findSalaryPayments({ page = 1, limit = 10 } = {}) {
    try {
      const skip = (page - 1) * limit;
      const [payments, total] = await prisma.$transaction([
        prisma.salaryPayment.findMany({
          skip,
          take: limit,
          orderBy: { paymentDate: 'desc' },
          include: {
            actors_SalaryPayment_employeeIdToactors: {
              select: { id: true, name: true, email: true },
            },
            actors_SalaryPayment_processedByIdToactors: {
              select: { id: true, name: true, email: true },
            },
          },
        }),
        prisma.salaryPayment.count(),
      ]);

      const formattedPayments = payments.map(p => {
        const {
          actors_SalaryPayment_employeeIdToactors,
          actors_SalaryPayment_processedByIdToactors,
          ...rest
        } = p;
        return {
          ...rest,
          employee: actors_SalaryPayment_employeeIdToactors,
          processedBy: actors_SalaryPayment_processedByIdToactors,
        };
      });

      return {
        payments: formattedPayments,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };
    } catch (err) {
      throw new APIError(
        'Database Error',
        STATUS_CODE.INTERNAL_ERROR,
        'Failed to retrieve salary payments'
      );
    }
  }

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
