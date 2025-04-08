import { Sales } from "../databases/repository/sales-repository.js";
import { InventorymanagementRepository } from "../databases/repository/invetory-controller-repository.js";
import { usermanagemenRepository } from "../databases/repository/usermanagement-controller-repository.js";
import { ShopmanagementRepository } from "../databases/repository/shop-repository.js";
import { phoneinventoryrepository } from "../databases/repository/mobile-inventory-repository.js";
import { CategoryManagementRepository } from "../databases/repository/category-contoller-repository.js";
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
      console.log(page, limit);
      const salesResult = await Promise.all(
        SALES_TABLE.map(async (table) => {
          return this.sales.findSales({
            salesTable: table,
            startDate,
            endDate,
          });
        })
      );

      if (!salesResult.some((result) => result.generalReport?.length)) {
        throw new APIError(
          "sales not found",
          STATUS_CODE.NOT_FOUND,
          "sales not found"
        );
      }

      const [transformedSales, total] = salesResult
        .flatMap((result) => result.generalReport)
        .reduce(
          ([sales, acc], sale) => {
            const transformed = this.transformgeneralSale(sale);
            sales.push(transformed);
            acc.totalSales += Number(sale._sum.soldPrice);
            acc.totalCommission += sale._sum.commission;
            acc.totalProfit += transformed.totalprofit;

            if (
              transformed.saleType === "finance" &&
              transformed.financeDetails.financeStatus === "pending"
            ) {
              acc.financeSales += transformed.financeDetails.financeAmount;
            }

            return [sales, acc];
          },
          [
            [],
            {
              totalSales: 0,
              totalCommission: 0,
              totalProfit: 0,
              financeSales: 0,
            },
          ]
        );

      //sconsole.log("transformed", transformedSales);

      const [analytics, paginatedSales] = await Promise.all([
        this.analyseSalesMetric(transformedSales),
        Promise.resolve(transformedSales.slice(skip, skip + limit)),
      ]);
      //console.log("@@", paginatedSales);
      return [
        {
          sales: {
            sales: paginatedSales,
            totalSales: total.totalSales,
            totalCommission: total.totalCommission,
            totalProfit: total.totalProfit,
            financeSales: total.financeSales,
            totalPages: Math.ceil(transformedSales.length / limit),
            currentPage: page,
          },
          analytics: {
            analytics: analytics,
          },
        },
      ];
    } catch (err) {
      console.log("err", err);
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "internal error",
        STATUS_CODE.INTERNAL_ERROR,
        err.message || "internal server error"
      );
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
          analytics: await this.analyseSalesMetric(combined.data),
        },
      };
    } catch (error) {
      //console.error("Error in getUserSales:", error);
      throw new APIError(
        "Failed to fetch sales data",
        STATUS_CODE.INTERNAL_ERROR,
        error.message
      );
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
    // Rest of the logic remains the same...
  }

  async analyseSalesMetric(salesData) {
    try {
      const productMetric = {};
      const sellerMetric = {};

      // Iterate through the sales data
      salesData.forEach((sale) => {
        const {
          soldprice,
          totalprofit,
          totaltransaction,
          productDetails,
          categoryDetails,
          sellerDetails,
        } = sale;
        //did some twisting so we can have transcation counted in terms of category
        const productId = categoryDetails.itemName;
        const sellerId = sellerDetails.id;
        const productName = categoryDetails.itemName;
        const sellerName = sellerDetails.name;

        // Update product metrics
        if (!productMetric[productId]) {
          productMetric[productId] = {
            productName: productName,
            totalSales: 0,
            totaltransacted: 0,
            netprofit: 0,
          };
        }

        productMetric[productId].totalSales += soldprice;
        productMetric[productId].totaltransacted += totaltransaction;
        productMetric[productId].netprofit += totalprofit;

        if (!sellerMetric[sellerId]) {
          sellerMetric[sellerId] = {
            sellerName: sellerName,
            totalSales: 0,
            netprofit: 0,
            totaltransacted: 0,
          };
        }

        sellerMetric[sellerId].totalSales += Number(soldprice);
        sellerMetric[sellerId].netprofit += totalprofit;
        sellerMetric[sellerId].totaltransacted += totaltransaction;
      });

      // Sort and get top 5 products
      const productAnalytics = Object.values(productMetric)
        .sort((a, b) => b.totalSales - a.totalSales)
        .slice(0, 5);

      // Get total number of products
      const totalProducts = Object.keys(productMetric).length;

      // Sort and get top 5 sellers
      const sellerAnalytics = Object.values(sellerMetric)
        .sort((a, b) => b.totalSales - a.totalSales)
        .slice(0, 5);

      // Get total number of sellers
      const totalSellers = Object.keys(sellerMetric).length;

      return { sellerAnalytics, productAnalytics, totalProducts, totalSellers };
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "internal error",
        STATUS_CODE.INTERNAL_ERROR,
        err.message || "internal server error"
      );
    }
  }

  async paymentofcommission(salesId, amount) {
    try {
      const sale = await this.sales.findSalesById(salesId);
      console.log("sales", sale);
      if (amount > sale.commission) {
        throw new Error("Amount exceeds the commission due");
      } else if (amount - sales.commision !== 0) {
        const updatedCommission = sale.commission - amount;
        sale.commission = updatedCommission;
        sale.commissionStatus = " still awaiting";
      }
      const updatedCommission = sale.commission - amount;
      sale.commission = updatedCommission;
      sale.commissionStatus = "paid";
      const updatedSale = await this.sales.payCommission(salesId, sale);

      // Record the commission paid in the category revenue
      await this.sales.updatecategoryrevenue(sale.category, amount);

      return updatedSale;
    } catch (err) {
      console.log("err", err);
      if (err instanceof APIError) {
        throw err;
      }
      throw new Error(`Error in service layer: ${err.message}`);
    }
  }
  async calculateRevenueByCategory() {
    try {
      const categoryRevenues = await salesRepository.getCategoryRevenues();

      const netIncome = categoryRevenues.map((categoryRevenue) => ({
        category: categoryRevenue.category,
        totalRevenue: categoryRevenue.totalRevenue,
        totalCommission: categoryRevenue.totalCommission,
        netIncome:
          categoryRevenue.totalRevenue - categoryRevenue.totalCommission,
      }));
      return netIncome;
    } catch (err) {
      console.log("err", err);
      if (err instanceof APIError) {
        throw err;
      }
      throw new Error(`Error in service layer: ${err.message}`);
    }
  }

  transformgeneralSale(sale) {
    //console.log("sales#$##$", sale);
    const financeStatus = sale.financeDetails.financeStatus;
    const isFinance = financeStatus !== "N/A";
    return {
      soldprice: Number(sale._sum.soldPrice),
      commission: sale._sum.commission,
      totalprofit: sale._sum.profit,
      totaltransaction: sale._count._all,
      productDetails: this.normalizedProduct(sale.productDetails),
      categoryDetails: this.normalizedCategoryDetails(sale.categoryDetails),
      shopDetails: this.normalizedShopDetails(sale.shopDetails),
      sellerDetails: {
        name: sale.sellerDetails?.name,
        id: sale.sellerDetails?.id,
      },
      saleType: isFinance ? "finance" : "direct",
      financeDetails: sale.financeDetails,
      createdAt: sale.createdAt,
    };
  }
  normalizedProduct(details) {
    return {
      productID: details?.id,
      batchNumber: details?.batchNumber,
      productCost: details?.productCost,
      productType: details?.itemType || details?.productType || "mobiles",
    };
  }
  normalizedCategoryDetails(details) {
    return {
      categoryId: details?.id,
      category: details?.itemType || "accessory",
      itemName: details?.itemName,
      itemModel: details?.itemModel,
      brand: details?.brand,
    };
  }
  normalizedShopDetails(details) {
    return details
      ? {
          id: details.id,
          name: details.shopName,
          address: details.address,
        }
      : null;
  }
  normalizedSellerDetails(details) {
    return details
      ? {
          id: details.id,
          name: details.sellerName,
        }
      : null;
  }
  handleServiceError(err) {
    if (err instanceof APIError) return err;
    return new APIError(
      "internal_error",
      STATUS_CODE.INTERNAL_ERROR,
      err.message || "Internal server error"
    );
  }
}

export { salesmanagment };
