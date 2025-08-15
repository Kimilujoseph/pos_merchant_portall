import { AnalyticsRepository } from '../databases/repository/analytics-repository.js';
import { Sales } from '../databases/repository/sales-repository.js';
import { APIError, STATUS_CODE } from '../Utils/app-error.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class AnalyticsService {
    constructor() {
        this.repository = new AnalyticsRepository();
        this.salesRepository = new Sales();
    }

    async getTopProductsAnalytics(options) {
        try {
            const topProductsData = await this.repository.getTopProducts(options);

            const productIds = topProductsData.map(p => p.productId);

            if (productIds.length === 0) {
                return [];
            }

            const mobiles = await prisma.mobiles.findMany({
                where: { id: { in: productIds } },
                select: { id: true, categories: { select: { itemName: true, brand: true } } },
            });

            const accessories = await prisma.accessories.findMany({
                where: { id: { in: productIds } },
                select: { id: true, categories: { select: { itemName: true, brand: true } } },
            });

            const productDetailsMap = new Map();
            mobiles.forEach(p => productDetailsMap.set(p.id, { name: p.categories.itemName, brand: p.categories.brand }));
            accessories.forEach(p => productDetailsMap.set(p.id, { name: p.categories.itemName, brand: p.categories.brand }));

            const enrichedData = topProductsData.map(p => {
                const details = productDetailsMap.get(p.productId);
                return {
                    productId: p.productId,
                    productName: details ? `${details.brand} ${details.name}` : 'Unknown',
                    totalRevenue: p._sum.totalRevenue,
                    grossProfit: p._sum.grossProfit,
                    totalUnitsSold: p._sum.totalUnitsSold,
                }
            });

            return enrichedData;
        } catch (err) {
            if (err instanceof APIError) {
                throw err;
            }
            throw new APIError(
                "Service Error",
                STATUS_CODE.INTERNAL_ERROR,
                "Failed to get top products analytics"
            );
        }
    }

    async getShopPerformanceSummary(options) {
        try {
            const summaryData = await this.repository.getShopPerformanceSummary(options);

            const shopIds = summaryData.map(s => s.shopId);

            if (shopIds.length === 0) {
                return [];
            }

            const shops = await prisma.shops.findMany({
                where: { id: { in: shopIds } },
                select: { id: true, shopName: true },
            });

            const shopsMap = new Map();
            shops.forEach(s => shopsMap.set(s.id, s.shopName));

            const enrichedData = summaryData.map(s => {
                return {
                    shopId: s.shopId,
                    shopName: shopsMap.get(s.shopId) || 'Unknown',
                    totalRevenue: s._sum.totalRevenue,
                    grossProfit: s._sum.grossProfit,
                    totalUnitsSold: s._sum.totalUnitsSold,
                    totalCommission: s._sum.totalCommission,
                    totalfinanceAmount: s._sum.totalfinanceAmount,
                }
            });

            return enrichedData;
        } catch (err) {
            if (err instanceof APIError) {
                throw err;
            }
            throw new APIError(
                "Service Error",
                STATUS_CODE.INTERNAL_ERROR,
                "Failed to get shop performance summary"
            );
        }
    }

    async getSalesByStatus(options) {
        try {
            const summaryData = await this.repository.getSalesByStatus(options);
            
            const enrichedData = summaryData.map(s => {
                return {
                    financeStatus: s.financeStatus,
                    totalRevenue: s._sum.totalRevenue,
                    grossProfit: s._sum.grossProfit,
                    totalUnitsSold: s._sum.totalUnitsSold,
                    totalCommission: s._sum.totalCommission,
                    totalfinanceAmount: s._sum.totalfinanceAmount,
                }
            });

            return enrichedData;
        } catch (err) {
            if (err instanceof APIError) {
                throw err;
            }
            throw new APIError(
                "Service Error",
                STATUS_CODE.INTERNAL_ERROR,
                "Failed to get sales by status"
            );
        }
    }
}

export { AnalyticsService };
