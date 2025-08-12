import { PrismaClient } from "@prisma/client";
import { Sales } from "../databases/repository/sales-repository.js";
import { InventorymanagementRepository } from "../databases/repository/invetory-controller-repository.js";
import { usermanagemenRepository } from "../databases/repository/usermanagement-controller-repository.js";
import { ShopmanagementRepository } from "../databases/repository/shop-repository.js";
import { phoneinventoryrepository } from "../databases/repository/mobile-inventory-repository.js";
import { CategoryManagementRepository } from "../databases/repository/category-contoller-repository.js";
import { analyseSalesMetric } from "../helpers/analyticmetric.js";
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
    // if (!shop.assignment.find(seller => seller.actors.id === sellerId)) {
    //   throw new APIError("unathorzed", STATUS_CODE.UNAUTHORIZED, "not authorised to make sales for this shop")
    // }

    let customer = await this.customer.findCustomerByPhone(customerdetails.phonenumber);
    if (!customer) {
      // Ensure email is passed correctly if it exists
      const customerData = {
        name: customerdetails.name,
        phoneNumber: customerdetails.phonenumber,
        email: customerdetails.email,
        address: customerdetails.address,
      };
      customer = await this.customer.createCustomer(customerData);
    }

    const allSalesResults = [];

    for (const sale of bulksales) {
      const { itemType, items, paymentmethod, transactionId, CategoryId } = sale;

      const totalAmount = items.reduce((acc, item) => acc + (item.soldprice * item.soldUnits), 0);

      try {
        const result = await prisma.$transaction(async (tx) => {
          const payment = await tx.payment.create({
            data: {
              amount: totalAmount,
              paymentMethod: paymentmethod,
              status: 'completed',
              transactionId: transactionId,
              updatedAt: new Date(),
            },
          });

          const successfulSales = [];

          for (const item of items) {
            const { productId, soldprice, soldUnits, itemId, financeAmount, financeStatus, financeId } = item;


            const itemToSell = itemType === 'mobiles'
              ? await tx.mobileItems.findUnique({ where: { id: parseInt(itemId) } })
              : await tx.accessoryItems.findUnique({ where: { id: parseInt(itemId) } });

            if (!itemToSell) {
              throw new APIError(`Item not found.`, STATUS_CODE.NOT_FOUND);
            }

            if (itemToSell.status === 'sold') {
              throw new APIError(`Item  already been sold.`, STATUS_CODE.BAD_REQUEST);
            }


            const productDetails = itemType === 'mobiles'
              ? await tx.mobiles.findUnique({ where: { id: parseInt(productId) } })
              : await tx.accessories.findUnique({ where: { id: parseInt(productId) } });

            if (!productDetails) {
              throw new APIError(`Product with ID ${productId} not found`, STATUS_CODE.NOT_FOUND);
            }

            const profit = (soldprice - productDetails.productCost) * soldUnits;
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
                data: { status: 'sold', quantity: { increment: soldUnits } },
              });
            }
            successfulSales.push({ status: 'fulfilled', value: createdSale });
          }

          return { successfulSales, customer, payment };
        });
        allSalesResults.push(result);

      } catch (err) {
        console.error(err);
        // Push a structured error to the results array
        allSalesResults.push({ status: 'rejected', reason: err.message });
      }
    }
    return allSalesResults;
  }

  async generategeneralsales({ startDate, endDate, page, limit }) {
    try {
      const SALES_TABLE = ["mobilesales", "accessorysales"];
      const skip = (page - 1) * limit;

      // Get all data in parallel
      const [salesResults, analyticsResults] = await Promise.all([
        // Existing sales data fetch
        Promise.all(
          SALES_TABLE.map((table) =>
            this.sales.findSales({
              salesTable: table,
              startDate,
              endDate,
              page: 1,
              limit: Number.MAX_SAFE_INTEGER,
            })
          )
        ),
        Promise.all(
          SALES_TABLE.flatMap((table) => [
            this.sales.getSalesAnalytics(table, startDate, endDate),
            this.sales.getSellerAnalytics(table, startDate, endDate),
          ])
        ),
      ]);

      //console.log("#$#$sales results", salesResults);

      // Process sales data (existing logic)
      let financeSales = 0;
      let totalProfit = 0;
      const allSales = [];

      for (const result of salesResults) {
        for (const sale of result.data) {
          const transformed = transformSales(sale);
          if (transformed.financeDetails.financeStatus === "pending") {
            financeSales += transformed.financeDetails.financeAmount;
          }
          if (transformed.financeDetails.financeStatus !== "pending") {
            totalProfit += transformed.netprofit;
          }
          allSales.push(transformed);
        }
      }

      // Process analytics results
      const [
        mobileProducts,
        mobileSellers,
        accessoryProducts,
        accessorySellers,
      ] = analyticsResults;

      const mergedProductAnalytics = this.mergeAnalytics([
        mobileProducts,
        accessoryProducts,
      ]);
      const mergedSellerAnalytics = this.mergeAnalytics([
        mobileSellers,
        accessorySellers,
      ]);
      const totals = salesResults.reduce(
        (acc, curr) => ({
          totalSales: acc.totalSales + curr.totals.totalSales,
          totalCommission: acc.totalCommission + curr.totals.totalCommission,
          totalProfit,
          financeSales,
        }),
        {
          totalSales: 0,
          totalCommission: 0,
          totalProfit: 0,
          financeSales: 0,
        }
      );

      // Pagination
      const paginatedSales = allSales.slice(skip, skip + limit);

      return [
        {
          sales: {
            sales: paginatedSales,
            totalSales: totals.totalSales,
            totalCommission: totals.totalCommission,
            totalProfit: totals.totalProfit,
            financeSales: totals.financeSales,
            totalPages: Math.ceil(allSales.length / limit),
            currentPage: page,
          },
          analytics: {
            analytics: {
              sellerAnalytics: mergedSellerAnalytics,
              productAnalytics: mergedProductAnalytics,
              totalProducts: mergedProductAnalytics.length,
              totalSellers: mergedSellerAnalytics.length,
            },
          },
        },
      ];
    } catch (err) {
      // console.log("err", err);
      this.handleServiceError(err);
    }
  }

  // Helper method to merge analytics from different tables
  mergeAnalytics(results) {
    const merged = new Map();

    for (const resultSet of results) {
      for (const item of resultSet) {
        const key = item.productName || item.sellerName;
        const existing = merged.get(key);

        if (existing) {
          existing.totalSales += Number(item.totalSales);
          existing.netprofit += Number(item.netprofit);
          existing.totaltransacted += Number(item.totaltransacted);
        } else {
          merged.set(key, {
            ...item,
            totalSales: Number(item.totalSales),
            netprofit: Number(item.netprofit),
            totaltransacted: Number(item.totaltransacted),
          });
        }
      }
    }
    return Array.from(merged.values())
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 10);
  }
  async getUserSales(salesDetails) {
    try {
      const { userId, startDate, endDate, page, limit } = salesDetails;
      const SALES_TABLES = ["mobilesales", "accessorysales"];
      const skip = (page - 1) * limit;

      // Parallel fetch of sales data and analytics
      const [salesResults, analyticsResults] = await Promise.all([
        // Sales data fetch
        Promise.all(
          SALES_TABLES.map((table) =>
            this.sales.findUserSales({
              salesTable: table,
              userId,
              startDate,
              endDate,
              page,
              limit,
            })
          )
        ),
        // Analytics fetch
        Promise.all(
          SALES_TABLES.flatMap((table) => [
            this.sales.getUserProductAnalytics(
              table,
              userId,
              startDate,
              endDate
            ),
            this.sales.getUserSellerAnalytics(
              table,
              userId,
              startDate,
              endDate
            ),
          ])
        ),
      ]);

      // Process sales data with streaming approach
      let financeSales = 0;
      let totalProfit = 0;
      const allSales = [];

      for (const result of salesResults) {
        for (const sale of result.data) {
          const transformed = transformSales(sale);
          // console.log("transformed sales", transformed);

          // Update financial metrics
          if (transformed.financeDetails.financeStatus === "pending") {
            financeSales += transformed.financeDetails.financeAmount;
          } else {
            totalProfit += transformed.netprofit;
          }

          allSales.push(transformed);
        }
      }

      // Process analytics results
      const [
        mobileProducts,
        mobileSellers,
        accessoryProducts,
        accessorySellers,
      ] = analyticsResults;

      const mergedProductAnalytics = this.mergeAnalytics([
        mobileProducts,
        accessoryProducts,
      ]);

      const mergedSellerAnalytics = this.mergeAnalytics([
        mobileSellers,
        accessorySellers,
      ]);
      const totals = salesResults.reduce(
        (acc, curr) => ({
          totalSales: acc.totalSales + Number(curr.totals.totalSales),
          totalCommission:
            acc.totalCommission + Number(curr.totals.totalCommission),
          totalProfit,
          financeSales,
          totalItems: acc.totalItems + Number(curr.totals.totalItems),
        }),
        {
          totalSales: 0,
          totalCommission: 0,
          totalProfit: 0,
          financeSales: 0,
          totalItems: 0,
        }
      );

      return {
        sales: {
          sales: allSales.slice(skip, skip + limit),
          totalSales: totals.totalSales,
          totalProfit: totals.totalProfit,
          totalCommission: totals.totalCommission,
          financeSales: totals.financeSales,
          totalPages: Math.ceil(totals.totalItems / limit),
          currentPage: page,
        },
        analytics: {
          analytics: {
            sellerAnalytics: mergedSellerAnalytics,
            productAnalytics: mergedProductAnalytics,
            totalProducts: mergedProductAnalytics.length,
            totalSellers: mergedSellerAnalytics.length,
          },
        },
      };
    } catch (error) {
      this.handleServiceError(error);
    }
  }

  async generateCategorySales(salesDetails) {
    try {
      const { categoryId, startDate, endDate, page, limit } = salesDetails;
      const skip = (page - 1) * limit;

      const generalSalesData = await this.generategeneralsales({
        startDate,
        endDate,
        page,
        limit,
      });

      const allSales = generalSalesData[0].sales.sales;

      const fullfilledSales = allSales.filter(
        (sale) => sale.categoryDetails.categoryId === categoryId
      );
      const filteredSales = fullfilledSales.filter((sale) => {
        return (
          sale.saleType !== "finance" ||
          sale.financeDetails.financeStatus !== "pending"
        );
      });
      const paginatedSales = fullfilledSales.slice(skip, skip + limit);
      const transformSales = (sales) => {
        return sales.map((sale) => ({
          soldprice: sale.soldprice,
          netprofit: sale.totalprofit,
          commission: sale.commission,
          productcost: sale.productDetails.productCost,
          productmodel: sale.categoryDetails.itemModel,
          productname: sale.categoryDetails.itemName,
          totalnetprice: sale.soldprice,
          totalsoldunits: sale.totaltransaction,
          totaltransaction: sale.totaltransaction,
          _id: {
            productId: sale.productDetails.productID,
            sellerId: sale.sellerDetails.id,
            shopId: sale.shopDetails.id,
          },
          financeDetails: sale.financeDetails,
          CategoryId: sale.categoryDetails.categoryId,
          createdAt: sale.createdAt,
          batchNumber: sale.productDetails.batchNumber,
          category: sale.productDetails.productType,
        }));
      };

      const transformedSales = transformSales(paginatedSales);

      const totalSales = fullfilledSales.reduce(
        (acc, sale) => acc + sale.soldprice,
        0
      );
      const totalCommission = fullfilledSales.reduce(
        (acc, sale) => acc + sale.commission,
        0
      );
      const totalProfit = filteredSales.reduce(
        (acc, sale) => acc + sale.totalprofit,
        0
      );
      const financeSales = fullfilledSales
        .filter(
          (sale) =>
            sale.saleType === "finance" &&
            sale.financeDetails.financeStatus === "pending"
        )
        .reduce((acc, sale) => acc + sale.financeDetails.financeAmount, 0);

      return {
        sales: {
          sales: transformedSales,
          totalSales,
          totalCommission,
          totalProfit,
          financeSales,
          totalPages: Math.ceil(fullfilledSales.length / limit),
          currentPage: page,
        },
        analytics: {
          analytics: await this.analyseSalesMetric(fullfilledSales),
        },
      };
    } catch (err) {
      // console.error("Error generating category sales:", err);
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Internal error",
        STATUS_CODE.INTERNAL_ERROR,
        err.message || "Internal server error"
      );
    }
  }
  async generateShopSales(salesDetails) {
    try {
      const { shopId, startDate, endDate, page, limit } = salesDetails;
      const skip = (page - 1) * limit;
      const generalSalesData = await this.generategeneralsales({
        startDate,
        endDate,
        page,
        limit,
      });

      const allSales = generalSalesData[0].sales.sales;
      //console.log("allsales", allSales);
      const fullfilledSales = allSales.filter(
        (sale) => sale.shopDetails.id === shopId
      );
      const filteredSales = fullfilledSales.filter((sale) => {
        return (
          sale.saleType !== "finance" ||
          sale.financeDetails.financeStatus !== "pending"
        );
      });
      //console.log("filterd", filteredSales);
      const paginatedSales = fullfilledSales.slice(skip, skip + limit);
      const transformSales = (sales) => {
        return sales.map((sale) => ({
          soldprice: sale.soldprice,
          netprofit: sale.totalprofit,
          commission: sale.commission,
          productcost: sale.productDetails.productCost,
          productmodel: sale.categoryDetails.itemModel,
          productname: sale.categoryDetails.itemName,
          totalnetprice: sale.soldprice,
          totalsoldunits: sale.totaltransaction,
          totaltransaction: sale.totaltransaction,
          _id: {
            productId: sale.productDetails.productID,
            sellerId: sale.sellerDetails.id,
            shopId: sale.shopDetails.id,
          },
          financeDetails: sale.financeDetails,
          CategoryId: sale.categoryDetails.categoryId,
          createdAt: sale.createdAt,
          batchNumber: sale.productDetails.batchNumber,
          category: sale.productDetails.productType,
        }));
      };

      const transformedSales = transformSales(paginatedSales);

      const totalSales = fullfilledSales.reduce(
        (acc, sale) => acc + sale.soldprice,
        0
      );
      const totalCommission = fullfilledSales.reduce(
        (acc, sale) => acc + sale.commission,
        0
      );
      const totalProfit = filteredSales.reduce(
        (acc, sale) => acc + sale.totalprofit,
        0
      );
      const financeSales = fullfilledSales
        .filter(
          (sale) =>
            sale.saleType === "finance" &&
            sale.financeDetails.financeStatus === "pending"
        )
        .reduce((acc, sale) => acc + sale.financeDetails.financeAmount, 0);

      return {
        sales: {
          sales: transformedSales,
          totalSales,
          totalProfit,
          totalCommission,
          financeSales,
          totalPages: Math.ceil(fullfilledSales.length / limit),
          currentPage: page,
        },
        analytics: {
          analytics: await this.analyseSalesMetric(fullfilledSales),
        },
      };
    } catch (err) {
      console.error("Error generating category sales:", err);
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Internal error",
        STATUS_CODE.INTERNAL_ERROR,
        err.message || "Internal server error"
      );
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
