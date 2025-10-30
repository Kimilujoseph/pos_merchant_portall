import { PrismaClient } from "@prisma/client";
import { APIError, STATUS_CODE } from "../../Utils/app-error.js";

const prisma = new PrismaClient();

class FinancialReportingRepository {

  async getAggregatedAnalytics({ startDate, endDate }) {
    try {
      return await prisma.dailySalesAnalytics.aggregate({
        where: {
          date: {
            gte: startDate,
            lt: endDate,
          },
        },
        _sum: {
          totalRevenue: true,
          grossProfit: true,
          totalCommission: true,
        },
      });
    } catch (err) {
      throw new APIError("Database Error", STATUS_CODE.INTERNAL_ERROR, "Could not fetch aggregated sales analytics.");
    }
  }

  async getCurrentDaySales(date) {
    try {
      const mobileSales = prisma.mobilesales.aggregate({
        where: {
          createdAt: {
            gte: date,
          },
        },
        _sum: {
          soldPrice: true,
          profit: true,
          commission: true,
        },
      });

      const accessorySales = prisma.accessorysales.aggregate({
        where: {
          createdAt: {
            gte: date,
          },
        },
        _sum: {
          soldPrice: true,
          profit: true,
          commission: true,
        },
      });

      const [mobileResult, accessoryResult] = await Promise.all([mobileSales, accessorySales]);

      return {
        totalRevenue: (mobileResult._sum.soldPrice || 0) + (accessoryResult._sum.soldPrice || 0),
        grossProfit: (mobileResult._sum.profit || 0) + (accessoryResult._sum.profit || 0),
        totalCommission: (mobileResult._sum.commission || 0) + (accessoryResult._sum.commission || 0),
      };
    } catch (err) {
      throw new APIError("Database Error", STATUS_CODE.INTERNAL_ERROR, "Could not fetch current day sales.");
    }
  }

  async getExpenses({ startDate, endDate }) {
    try {
      return await prisma.expense.groupBy({
        by: ['category'],
        where: {
          expenseDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          amount: true,
        },
      });
    } catch (err) {
      throw new APIError("Database Error", STATUS_CODE.INTERNAL_ERROR, "Could not fetch expenses.");
    }
  }

  async getSalaries({ startDate, endDate }) {
    try {
      return await prisma.salaryPayment.aggregate({
        where: {
          paymentDate: {
            gte: startDate,
            lte: endDate,
          },
          status: {
            not: "VOID"
          }
        },
        _sum: {
          amount: true,
        },
      });
    } catch (err) {
      throw new APIError("Database Error", STATUS_CODE.INTERNAL_ERROR, "Could not fetch salaries.");
    }
  }

  async getCommissionPayments({ startDate, endDate }) {
    try {
      return await prisma.commissionPayment.aggregate({
        where: {
          paymentDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          amountPaid: true,
        },
      });
    } catch (err) {
      throw new APIError("Database Error", STATUS_CODE.INTERNAL_ERROR, "Could not fetch commission payments.");
    }
  }

  async getAccountsReceivable() {
    try {
      const mobileReceivable = prisma.mobilesales.aggregate({
        where: {
          financeStatus: 'pending',
        },
        _sum: {
          financeAmount: true,
        },
      });

      const accessoryReceivable = prisma.accessorysales.aggregate({
        where: {
          financeStatus: 'pending',
        },
        _sum: {
          financeAmount: true,
        },
      });

      const [mobileResult, accessoryResult] = await Promise.all([mobileReceivable, accessoryReceivable]);

      return (mobileResult._sum.financeAmount || 0) + (accessoryResult._sum.financeAmount || 0);
    } catch (err) {
      throw new APIError("Database Error", STATUS_CODE.INTERNAL_ERROR, "Could not fetch accounts receivable.");
    }
  }
}

export default FinancialReportingRepository;
