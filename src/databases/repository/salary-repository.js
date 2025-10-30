import { PrismaClient } from '@prisma/client';
import { APIError, STATUS_CODE } from '../../Utils/app-error.js';

const prisma = new PrismaClient();

class SalaryRepository {
  async findSalaryPayments({ page = 1, limit = 10, startDate, endDate, employeeId } = {}) {
    try {
      const skip = (page - 1) * limit;
      const whereClause = {};

      if (startDate && endDate) {
        whereClause.paymentDate = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }
      if (employeeId) {
        whereClause.employeeId = employeeId;
      }

      const [payments, total, summary] = await prisma.$transaction([
        prisma.salaryPayment.findMany({
          where: whereClause,
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
        prisma.salaryPayment.count({ where: whereClause }),
        prisma.salaryPayment.aggregate({
          where: whereClause,
          _sum: { amount: true },
          _count: { id: true },
        }),
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
        summary: {
          totalPaid: summary._sum.amount || 0,
          paymentCount: summary._count.id || 0,
        },
        payments: formattedPayments,
        pagination: {
          totalRecords: total,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
        }
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

  async voidSalaryPayment(paymentId) {
    try {
      return await prisma.salaryPayment.update({
        where: { id: paymentId },
        data: { status: 'VOIDED' },
      });
    } catch (err) {
      throw new APIError(
        'Database Error',
        STATUS_CODE.INTERNAL_ERROR,
        'Failed to void salary payment'
      );
    }
  }
}

export { SalaryRepository };
