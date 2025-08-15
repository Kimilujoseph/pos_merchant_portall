import { PrismaClient } from "@prisma/client";
import { APIError, STATUS_CODE } from "../../Utils/app-error.js";

const prisma = new PrismaClient();

class AnalyticsRepository {
  async getSalesAnalytics({ startDate, endDate, shopId, sellerId, categoryId, financeStatus }) {
    try {
      const whereClause = {
        date: {
          gte: startDate,
          lt: endDate,
        },
      };

      if (shopId) {
        whereClause.shopId = shopId;
      }
      if (sellerId) {
        whereClause.sellerId = sellerId;
      }
      if (categoryId) {
        whereClause.categoryId = categoryId;
      }
      if (financeStatus) {
        whereClause.financeStatus = financeStatus;
      }

      const result = await prisma.dailySalesAnalytics.aggregate({
        where: whereClause,
        _sum: {
          totalUnitsSold: true,
          totalRevenue: true,
          grossProfit: true,
          totalCommission: true,
          totalfinanceAmount: true,
        },
      });

      return {
        totalUnitsSold: Number(result._sum.totalUnitsSold) || 0,
        totalRevenue: Number(result._sum.totalRevenue) || 0,
        grossProfit: Number(result._sum.grossProfit) || 0,
        totalCommission: Number(result._sum.totalCommission) || 0,
        totalfinanceAmount: Number(result._sum.totalfinanceAmount) || 0,
      };
    } catch (err) {
      console.error("Analytics Repository Error:", err);
      throw new APIError(
        "Database Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Failed to retrieve sales analytics"
      );
    }
  }
}

export { AnalyticsRepository };
