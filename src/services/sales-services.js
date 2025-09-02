import { PrismaClient } from "@prisma/client";
import { Sales } from "../databases/repository/sales-repository.js";
import { InventorymanagementRepository } from "../databases/repository/invetory-controller-repository.js";
import { usermanagemenRepository } from "../databases/repository/usermanagement-controller-repository.js";
import { ShopmanagementRepository } from "../databases/repository/shop-repository.js";
import { phoneinventoryrepository } from "../databases/repository/mobile-inventory-repository.js";
import { CategoryManagementRepository } from "../databases/repository/category-contoller-repository.js";
import { AnalyticsRepository } from "../databases/repository/analytics-repository.js";
import { transformSales } from "../helpers/transformsales.js";
import { APIError, STATUS_CODE } from "../Utils/app-error.js";
import CustomerRepository from "../databases/repository/customer-repository.js";

const prisma = new PrismaClient();

class salesmanagment {
  constructor() {
    this.user = new usermanagemenRepository();
    this.inventory = new InventorymanagementRepository();
    this.shop = new ShopmanagementRepository();
    this.sales = new Sales();
    this.analytics = new AnalyticsRepository();
    this.mobile = new phoneinventoryrepository();
    this.category = new CategoryManagementRepository();
    this.customer = CustomerRepository;
  }

  async createBulkSale(salePayload, user) {
    const { shopName, customerdetails, bulksales } = salePayload;
    const { id: sellerId } = user;

    const shop = await this.shop.findShop({ shopName });
    if (!shop) {
      throw new APIError("Shop not found", STATUS_CODE.NOT_FOUND, "The specified shop does not exist.");
    }

    let customer = await this.customer.findCustomerByPhone(customerdetails.phonenumber);
    if (!customer) {
      const customerData = {
        name: customerdetails.name,
        phoneNumber: customerdetails.phonenumber,
        email: customerdetails.email,
        address: customerdetails.address,
      };
      customer = await this.customer.createCustomer(customerData);
    }

    return prisma.$transaction(async (tx) => {
      const allSalesResults = [];

      for (const sale of bulksales) {
        const { itemType, items, paymentmethod, transactionId, CategoryId } = sale;

        const totalAmount = items.reduce((acc, item) => acc + (item.soldprice * item.soldUnits), 0);

        const payment = await tx.payment.create({
          data: {
            amount: totalAmount,
            paymentMethod: paymentmethod,
            status: 'completed',
            transactionId: transactionId,
            updatedAt: new Date(),
          },
        });

        for (const item of items) {
          const { productId, soldprice, soldUnits, itemId, financeAmount, financeStatus, financeId } = item;

          const itemToSell = itemType === 'mobiles'
            ? await tx.mobileItems.findUnique({ where: { id: parseInt(itemId) } })
            : await tx.accessoryItems.findUnique({ where: { id: parseInt(itemId) } });
          const transferId = itemToSell?.transferId;

          if (!itemToSell) {
            throw new APIError("Not Found", STATUS_CODE.NOT_FOUND, "Item not found.");
          }
          if (itemToSell.status === 'sold') {
            throw new APIError("Bad Request", STATUS_CODE.BAD_REQUEST, "Item has already been sold.");
          }

          const productDetails = itemType === 'mobiles'
            ? await tx.mobiles.findUnique({ where: { id: parseInt(productId) } })
            : await tx.accessories.findUnique({ where: { id: parseInt(productId) } });

          if (!productDetails) {
            throw new APIError("Not Found", STATUS_CODE.NOT_FOUND, `Product with ID ${productId} not found`);
          }

          const profit = soldprice - (productDetails.productCost * soldUnits);
          const commission = productDetails.commission * soldUnits;

          const saleData = {
            productID: parseInt(productId),
            shopID: shop.id,
            sellerId,
            soldPrice: soldprice,
            quantity: soldUnits,
            customerId: customer.id,
            paymentId: payment.id,
            categoryId: parseInt(CategoryId),
            profit,
            commission,
            financeAmount: financeAmount ? parseInt(financeAmount) : 0,
            financeStatus: financeStatus,
            financerId: financeId ? parseInt(financeId) : null,
          };

          let createdSale;
          if (itemType === 'mobiles') {
            createdSale = await tx.mobilesales.create({ data: saleData });
            await tx.mobileItems.update({
              where: { id: parseInt(transferId) },
              data: { status: 'sold' },
            });
          } else {
            createdSale = await tx.accessorysales.create({ data: saleData });
            await tx.accessoryItems.update({
              where: { id: parseInt(transferId) },
              data: { status: 'sold', quantity: { decrement: soldUnits } },
            });
          }

          // Upsert into DailySalesAnalytics
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const analyticsData = {
            date: today,
            productId: parseInt(productId),
            categoryId: parseInt(CategoryId),
            shopId: shop.id,
            sellerId: sellerId,
            financeStatus: financeStatus,
            financeId: financeId ? parseInt(financeId) : null,
            totalUnitsSold: soldUnits,
            totalRevenue: soldprice,
            totalCostOfGoods: productDetails.productCost * soldUnits,
            grossProfit: profit,
            totalCommission: commission,
            totalFinanceAmount: financeAmount ? parseInt(financeAmount) : 0,
          };

          await tx.dailySalesAnalytics.upsert({
            where: {
              date_productId_shopId_sellerId_financeStatus_financeId: {
                date: today,
                productId: parseInt(productId),
                shopId: shop.id,
                sellerId: sellerId,
                financeStatus: financeStatus,
                financeId: financeId ? parseInt(financeId) : null,
              },
            },
            update: {
              totalUnitsSold: { increment: soldUnits },
              totalRevenue: { increment: soldprice },
              totalCostOfGoods: { increment: productDetails.productCost * soldUnits },
              grossProfit: { increment: profit },
              totalCommission: { increment: commission },
              totalFinanceAmount: { increment: financeAmount ? parseInt(financeAmount) : 0 },
            },
            create: analyticsData,
          });

          allSalesResults.push({ status: 'fulfilled', value: createdSale });
        }
      }
      return allSalesResults;
    });
  }

  async _getHybridSalesData(filters) {
    const { startDate, endDate, page, limit, shopId, userId, categoryId, financerId, financeStatus } = filters;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);


    const historicalEndDate = parsedEndDate < today ? parsedEndDate : today;
    const historicalTotals = await this.analytics.getSalesAnalytics({
      startDate: parsedStartDate,
      endDate: historicalEndDate,
      shopId,
      sellerId: userId,
      categoryId,
      financerId,
      financeStatus,
    });


    let todaysTotals = { totalRevenue: 0, grossProfit: 0, totalCommission: 0, totalItems: 0, totalFinanceAmount: 0 };
    if (parsedEndDate >= today) {
      const todaySalesDetails = {
        startDate: today,
        endDate: parsedEndDate,
        shopId,
        userId,
        categoryId,
        financerId,
        financeStatus,
        page: 1,
        limit: 10000, // A large limit to get all of today's sales
      };

      const [mobileSales, accessorySales] = await Promise.all([
        this.sales.findSales({ ...todaySalesDetails, salesTable: 'mobilesales' }),
        this.sales.findSales({ ...todaySalesDetails, salesTable: 'accessorysales' }),
      ]);

      //console.log(mobileSales)

      todaysTotals = {
        totalRevenue: (mobileSales.totals.totalSales || 0) + (accessorySales.totals.totalSales || 0),
        grossProfit: (mobileSales.totals.totalProfit || 0) + (accessorySales.totals.totalProfit || 0),
        totalCommission: (mobileSales.totals.totalCommission || 0) + (accessorySales.totals.totalCommission || 0),
        totalItems: (mobileSales.totals.totalItems || 0) + (accessorySales.totals.totalItems || 0),
        totalFinanceAmount: (mobileSales.totals.financeAmount || 0) + (accessorySales.totals.financeAmount || 0),
      };
    }

    // 3. Get paginated sales data for the view (from transactional tables)
    const paginatedSalesDetails = {
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      shopId,
      userId,
      categoryId,
      financerId,
      financeStatus,
      page,
      limit,
    };

    const [paginatedMobileSales, paginatedAccessorySales] = await Promise.all([
      userId
        ? this.sales.findUserSales({ ...paginatedSalesDetails, salesTable: 'mobilesales' })
        : this.sales.findSales({ ...paginatedSalesDetails, salesTable: 'mobilesales' }),
      userId
        ? this.sales.findUserSales({ ...paginatedSalesDetails, salesTable: 'accessorysales' })
        : this.sales.findSales({ ...paginatedSalesDetails, salesTable: 'accessorysales' }),
    ]);

    const combinedSales = [...paginatedMobileSales.data, ...paginatedAccessorySales.data];
    combinedSales.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const paginatedSales = combinedSales.slice(0, limit);
    const totalItemsForPagination = (paginatedMobileSales.totals.totalItems || 0) + (paginatedAccessorySales.totals.totalItems || 0);

    // 4. Combine totals for the final analytics object
    const finalTotals = {
      totalSales: (historicalTotals.totalRevenue || 0) + (todaysTotals.totalRevenue || 0),
      totalProfit: (historicalTotals.grossProfit || 0) + (todaysTotals.grossProfit || 0),
      totalCommission: (historicalTotals.totalCommission || 0) + (todaysTotals.totalCommission || 0),
      totalFinanceAmount: (historicalTotals.totalFinanceAmount || 0) + (todaysTotals.totalFinanceAmount || 0),
    };

    return {
      sales: {
        sales: paginatedSales.map(transformSales),
        totalPages: Math.ceil(totalItemsForPagination / limit),
        currentPage: page,
        ...finalTotals,
      },
      analytics: finalTotals,
    };
  }

  async generategeneralsales(filters) {
    try {
      return await this._getHybridSalesData(filters);
    } catch (err) {
      this.handleServiceError(err);
    }
  }

  async getUserSales(filters) {
    try {
      return await this._getHybridSalesData(filters);
    } catch (err) {
      this.handleServiceError(err);
    }
  }

  async generateCategorySales(filters) {
    try {
      return await this._getHybridSalesData(filters);
    } catch (err) {
      this.handleServiceError(err);
    }
  }

  async generateShopSales(filters) {
    try {
      return await this._getHybridSalesData(filters);
    } catch (err) {
      this.handleServiceError(err);
    }
  }

  async generateFinancerSales(filters) {
    try {
      return await this._getHybridSalesData(filters);
    } catch (err) {
      this.handleServiceError(err);
    }
  }

  handleServiceError(err) {
    if (err instanceof APIError) {
      throw err;
    }
    throw new APIError(
      "internal_error",
      STATUS_CODE.INTERNAL_ERROR,
      err.message || "Internal server error"
    );
  }
}

export { salesmanagment };