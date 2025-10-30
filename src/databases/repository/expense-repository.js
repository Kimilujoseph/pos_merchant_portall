import { PrismaClient } from '@prisma/client';

class ExpenseRepository {
    constructor() {
        this.prisma = new PrismaClient();
    }

    async createExpense(data) {
        return this.prisma.expense.create({
            data,
        });
    }

    async getExpenses({ shopId, employeeId, startDate, endDate, page, limit }) {
        const where = {
            ...(shopId && { shopId }),
            ...(employeeId && { processedById: employeeId }),
            ...(startDate && endDate && {
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            }),
        };

        const totalCount = await this.prisma.expense.count({ where });
        const totalPages = Math.ceil(totalCount / limit);

        const expenses = await this.prisma.expense.findMany({
            where,
            include: {
                actors: {
                    select: {
                        name: true,
                    },
                },
            },
            skip: (page - 1) * limit,
            take: limit,
        });

        const aggregation = await this.prisma.expense.aggregate({
            where,
            _sum: {
                amount: true,
            },
        });

        return {
            expenses,
            totalCount,
            totalPages,
            currentPage: page,
            totalAmount: aggregation._sum.amount || 0,
        };
    }
}

export { ExpenseRepository };
