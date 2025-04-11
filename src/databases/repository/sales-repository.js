import { PrismaClient } from "@prisma/client";
import { APIError, STATUS_CODE } from "../../Utils/app-error.js";
const prisma = new PrismaClient();
class Sales {
  async createnewMobilesales(salesDetails) {
    try {
      console.log("#$#$", salesDetails);
      const successfullsale = await prisma.mobilesales.create({
        data: {
          ...salesDetails,
        },
      });
      return successfullsale;
    } catch (err) {
      console.log("creating sales error ", err);
      throw new APIError(
        "database error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }
  async createnewAccessoriesales(salesDetails) {
    try {
      console.log("@#$#$", salesDetails);
      const successfullsale = await prisma.accessorysales.create({
        data: {
          ...salesDetails,
        },
      });
      return successfullsale;
    } catch (err) {
      console.log("creating sales error ", err);
      throw new APIError(
        "database error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }
  async findSalesById(salesId) {
    try {
      const sales = await salesDatabase.findById(salesId).populate({
        path: "CategoryId",
        select: "itemModel itemName,brand",
      });

      if (!sales) {
        throw new APIError(
          "database error".STATUS_CODE.NOT_FOUND,
          "sales not found"
        );
      }
      console.log("@@", sales);
      return sales;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "database error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }

  async findSales({ salesTable, startDate, endDate }) {
    try {
      // Determine which Prisma model to use based on sales table

      const salesModel =
        salesTable === "mobilesales"
          ? prisma.mobilesales
          : prisma.accessorysales;

      const results = await salesModel.groupBy({
        by: [
          "productID",
          "shopID",
          "sellerId",
          "createdAt",
          "categoryId",
          "financeStatus",
          "financeAmount",
          "financer",
        ],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },

        _sum: {
          soldPrice: true,
          profit: true,
          commission: true,
        },
        _count: {
          _all: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      //lets create an object of unique so we can collect the data in batches
      let uniqueIds = {
        //with the new Set instatiation we won't have repeating values
        productID: results ? [...new Set(results.map((s) => s.productID))] : [],
        sellerId: results ? [...new Set(results.map((s) => s.sellerId))] : [],
        categoryId: results
          ? [...new Set(results.map((s) => s.categoryId))]
          : [],
        shopId: results ? [...new Set(results.map((r) => r.shopID))] : [],
      };

      //lets have a batch fetching of items

      const [products, shops, sellers, category] = await Promise.all([
        this.getProductDetails(salesTable, uniqueIds.productID),
        prisma.shops.findMany({ where: { id: { in: uniqueIds.shopId } } }),
        prisma.actors.findMany({ where: { id: { in: uniqueIds.sellerId } } }),
        prisma.categories.findMany({
          where: { id: { in: uniqueIds.categoryId } },
        }),
      ]);

      //create a  Map look up which improve effeciency to O(1);
      const productMap = new Map(products.map((p) => [p.id, p]));
      const shopMap = new Map(shops.map((s) => [s.id, s]));
      const sellerMap = new Map(sellers.map((s) => [s.id, s]));
      const categoryMap = new Map(category.map((c) => [c.id, c]));

      const withRelations = results.map((sale) => ({
        ...sale,
        productDetails: productMap.get(sale.productID) || null,
        shopDetails: shopMap.get(sale.shopID) || null,
        sellerDetails: sellerMap.get(sale.sellerId) || null,
        categoryDetails: categoryMap.get(sale.categoryId) || null,
        financeDetails: this.mapFinanceDetails(sale),
      }));
      //console.log("@@#withrelation", withRelations);
      return { generalReport: withRelations };
    } catch (err) {
      console.log("err", err);
      throw new APIError(
        "Database error",
        STATUS_CODE.INTERNAL_ERROR,
        "Failed to retrieve sales data"
      );
    }
  }

  async getProductDetails(salesTable, productID) {
    if (!Array.isArray(productID)) {
      throw new APIError(
        "internal server error",
        STATUS_CODE.INTERNAL_ERROR,
        "Invalid product ID"
      );
    }
    return salesTable === "mobilesales"
      ? prisma.mobiles.findMany({
          where: { id: { in: productID } },
          include: { categories: true },
        })
      : prisma.accessories.findMany({
          where: { id: { in: productID } },
        });
  }
  mapFinanceDetails(sale) {
    return {
      financeStatus: sale.financeStatus || "N/A",
      financeAmount: sale.financeAmount || 0,
      financer: sale.financer || "N/A",
    };
  }
  async findUserSales({ salesTable, userId, startDate, endDate, page, limit }) {
    try {
      // console.log("#$#$", salesTable);
      const salesModel = prisma[salesTable];
      const skip = (page - 1) * limit;

      // Build conditional where clause based on the table
      const whereClause = {
        sellerId: userId,
        createdAt: { gte: startDate, lte: endDate },
        OR:
          salesTable === "mobilesales"
            ? [
                { salesType: "direct" },
                {
                  salesType: "finance",
                  financeStatus: { not: "pending" },
                },
              ]
            : [
                { financeStatus: "N/A" },
                {
                  financeStatus: { not: "pending" },
                },
              ],
      };
      const includeClause =
        salesTable === "mobilesales"
          ? {
              mobiles: true,
              shops: true,
              categories: true,
              actors: true,
            }
          : {
              accessories: true,
              shops: true,
              categories: true,
              actors: true,
            };

      const results = await salesModel.findMany({
        where: whereClause,
        include: includeClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      });
      const totals = await salesModel.aggregate({
        where: whereClause,
        _sum: {
          soldPrice: true,
          profit: true,
          commission: true,
        },
        _count: true,
      });

      // const datareturned = results.map((sale) =>
      //   this.transformUserSale(sale, salesTable)
      // );
      // console.log("#$#$", datareturned);

      return {
        data: results.map((sale) => this.transformUserSale(sale, salesTable)),
        totals: {
          totalSales: Number(totals._sum.soldPrice) || 0,
          totalProfit: totals._sum.profit || 0,
          totalCommission: totals._sum.commission || 0,
          totalItems: totals._count || 0,
        },
      };
    } catch (err) {
      throw new APIError(
        "Database error",
        STATUS_CODE.INTERNAL_ERROR,
        "Failed to retrieve user sales"
      );
    }
  }

  async findCategorySales({ categoryId, startDate, endDate }) {
    return prisma.sales.findMany({
      where: {
        categoryId,
        createdAt: { gte: startDate, lte: endDate },
        OR: [
          { saleType: "direct" },
          {
            saleType: "finance",
            financeStatus: { not: "pending" },
          },
        ],
      },
      include: { categoryId: true },
    });
  }
  async payCommission(salesId, updatedData) {
    return await salesDatabase.findByIdAndUpdate(salesId, updatedData, {
      new: true,
    });
  }

  async updatecategoryrevenue(category, amount) {
    try {
      const categoryRevenue = await categoryrevenue.findOne({ category });
      if (categoryRevenue) {
        categoryRevenue.totalCommission += amount;
        await categoryRevenue.save();
      } else {
        await categoryrevenue.create({
          category,
          totalRevenue: 0,
          totalCommission: amount,
        });
      }
    } catch (err) {
      console.log("error", err);
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "database error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }
  transformUserSale(sale, tableName) {
    // Common properties
    const base = {
      soldprice: Number(sale.soldPrice),
      totalprofit: sale.profit,
      totaltransaction: sale.quantity || 1,
      productDetails: {
        productID: sale.productID,
        productCost:
          tableName === "mobilesales"
            ? sale.mobiles?.productCost
            : sale.accessories?.productCost,
        batchNumber:
          tableName === "mobilesales"
            ? sale.mobiles?.batchNumber
            : sale.accessories?.batchNumber,
        productType:
          tableName === "mobilesales"
            ? sale.mobiles?.itemType
            : sale.accessories?.productType,
      },
      categoryDetails: {
        categoryId: sale.categoryId,
        itemName: sale.categories?.itemName,
        itemModel: sale.categories?.itemModel,
        itemType: sale.categories?.itemType,
        brand: sale.categories?.brand,
      },
      sellerDetails: {
        id: sale.sellerId,
        name: sale.actors?.name,
        email: sale.actors?.email,
      },
      financeDetails: {
        status: sale.financeStatus,
        amount: sale.financeAmount,
        financer: sale.financer,
      },
      shopDetails: {
        id: sale.shopID,
        name: sale.shops?.shopName,
        address: sale.shops?.address,
      },
      createdAt: sale.createdAt,
    };

    // Add table-specific properties
    return tableName === "mobilesales"
      ? {
          ...base,
          saleType: sale.salesType,
          productDetails: {
            ...base.productDetails,
            storage: sale.mobiles?.storage,
            color: sale.mobiles?.color,
          },
        }
      : {
          ...base,
          saleType: sale.financeStatus === "N/A" ? "direct" : "finance",
          productDetails: {
            ...base.productDetails,
            color: sale.accessories?.color,
            stockStatus: sale.accessories?.stockStatus,
          },
        };
  }
}

export { Sales };
