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

    async getExpenses(shopId) {
        return this.prisma.expense.findMany({
            where: {
                shopId,
            },
            include: {
                actors: {
                    select: {
                        name: true,
                    },
                },
            },
        });
    }
}

export { ExpenseRepository };
