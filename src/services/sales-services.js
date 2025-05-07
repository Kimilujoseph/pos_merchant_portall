import { Sales } from "../databases/repository/sales-repository.js";
import { InventorymanagementRepository } from "../databases/repository/invetory-controller-repository.js";
import { usermanagemenRepository } from "../databases/repository/usermanagement-controller-repository.js";
import { ShopmanagementRepository } from "../databases/repository/shop-repository.js";
import { phoneinventoryrepository } from "../databases/repository/mobile-inventory-repository.js";
import { CategoryManagementRepository } from "../databases/repository/category-contoller-repository.js";
import { analyseSalesMetric } from "../helpers/analyticmetric.js";
import { transformSales } from "../helpers/transformsales.js";
import { APIError, STATUS_CODE } from "../Utils/app-error.js";

class salesmanagment {
  constructor() {
    this.user = new usermanagemenRepository();
    this.inventory = new InventorymanagementRepository();
    this.shop = new ShopmanagementRepository();
    this.sales = new Sales();
    this.mobile = new phoneinventoryrepository();
    this.category = new CategoryManagementRepository();
  }
  async generategeneralsales({ startDate, endDate, page, limit }) {
    try {
      const SALES_TABLE = ["mobilesales", "accessorysales"];
      const skip = (page - 1) * limit;

      // 1. Fetch data with parallel execution
      const salesResults = await Promise.all(
        SALES_TABLE.map((table) =>
          this.sales.findSales({
            salesTable: table,
            startDate,
            endDate,
            page: 1, // Get all records for accurate analytics
            limit: Number.MAX_SAFE_INTEGER,
          })
        )
      );

      // 2. Process results in streaming fashion
      let financeSales = 0;
      let totalProfit = 0;
      const allSales = [];

      // Process each table's results sequentially to avoid memory spikes
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

      // 3. Calculate totals from aggregated values
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

      // 4. Paginate results
      const paginatedSales = allSales.slice(skip, skip + limit);

      // 5. Process analytics in streaming fashion
      const analytics = analyseSalesMetric(allSales);

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
            analytics: analytics,
          },
        },
      ];
    } catch (err) {
      console.log("#$%^&*(", err);
      this.handleServiceError(err);
    }
  }
  async getUserSales(salesDetails) {
    try {
      const { userId, startDate, endDate, page, limit } = salesDetails;
      const salesTables = ["mobilesales", "accessorysales"];
      const salesResults = await Promise.all(
        salesTables.map((table) =>
          this.sales.findUserSales({
            salesTable: table,
            userId,
            startDate,
            endDate,
            page,
            limit,
          })
        )
      );
      const combined = salesResults.reduce(
        (acc, result) => ({
          data: [...acc.data, ...result.data],
          totals: {
            totalSales:
              Number(acc.totals.totalSales) + Number(result.totals.totalSales),

            totalProfit: acc.totals.totalProfit + result.totals.totalProfit,
            totalCommission:
              acc.totals.totalCommission + result.totals.totalCommission,
            totalItems: acc.totals.totalItems + result.totals.totalItems,
          },
        }),
        {
          data: [],
          totals: {
            totalSales: 0,
            totalProfit: 0,
            totalCommission: 0,
            totalItems: 0,
          },
        }
      );

      //console.log("combineddata", combined.data);

      return {
        sales: {
          sales: combined.data,
          totalSales: combined.totals.totalSales,
          totalProfit: combined.totals.totalProfit,
          totalCommission: combined.totals.totalCommission,
          totalPages: Math.ceil(combined.totals.totalItems / limit),
          currentPage: page,
        },
        analytics: {
          analytics: analyseSalesMetric(combined.data),
        },
      };
    } catch (error) {
      //console.error("Error in getUserSales:", error);
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
      console.log("filterd", filteredSales);
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
      console.log("allsales", allSales);
      const fullfilledSales = allSales.filter(
        (sale) => sale.shopDetails.id === shopId
      );
      const filteredSales = fullfilledSales.filter((sale) => {
        return (
          sale.saleType !== "finance" ||
          sale.financeDetails.financeStatus !== "pending"
        );
      });
      console.log("filterd", filteredSales);
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
