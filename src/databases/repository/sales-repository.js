import { PrismaClient } from "@prisma/client";
import { APIError, STATUS_CODE } from "../../Utils/app-error.js";
const prisma = new PrismaClient();
class Sales {
  async createnewMobilesales(salesDetails) {
    try {
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
  // In your repository
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
}

export { Sales };
