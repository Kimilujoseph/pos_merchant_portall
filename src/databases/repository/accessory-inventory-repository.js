import { PrismaClient } from "@prisma/client";
import { APIError, STATUS_CODE } from "../../Utils/app-error.js";

const prisma = new PrismaClient();

class AccessoryInventoryRepository {
  async createAccessoryWithFinanceDetails(payload) {
    try {
      const { accessoryDetails, financeDetails, shopId, user, supplierId } = payload;
      const newAccessoryProduct = await this.createAccessoryStock({ ...accessoryDetails, supplierId });
      const createAccessoryMetaData = await Promise.all([
        this.createFinanceDetails(newAccessoryProduct.id, financeDetails),
        this.createHistory({
          user,
          shopId,
          productId: newAccessoryProduct.id,
          type: "new stock",
        }),
      ]);
      return newAccessoryProduct;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Server Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Unable to create new accessory"
      );
    }
  }

  async createAccessoryStock({
    CategoryId,
    batchNumber,
    productType,
    faultyItems,
    supplierName,
    availableStock,
    productCost,
    commission,
    color,
    discount,
    barcodePath,
    supplierId,
  }) {
    try {
      const category = parseInt(CategoryId, 10);
      const stock = await prisma.accessories.create({
        data: {
          CategoryId: category,
          batchNumber,
          productType,
          faultyItems,
          supplierName,
          availableStock,
          productCost,
          commission,
          color,
          discount,
          barcodePath,
          supplierId,
          createdAt: new Date(),
        },
      });
      return stock;
    } catch (err) {
      if (err.code === "P2002") {
        throw new APIError(
          "Duplicate Key Error",
          STATUS_CODE.BAD_REQUEST,
          `An accessory with the same ${err.meta.target[0]} already exists.`
        );
      }
      throw new APIError(
        "API Error",
        STATUS_CODE.INTERNAL_ERROR,
        err.message || "Unable to create new accessory stock"
      );
    }
  }

  async createFinanceDetails(productId, financeDetails) {
    try {
      const updatedFinanceDetails = await prisma.accessoryfinance.create({
        data: {
          financer: financeDetails.financer,
          financeAmount: financeDetails.financeAmount,
          financeStatus: financeDetails.financeStatus,
          productID: productId,
        },
      });
      return updatedFinanceDetails;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "API Error",
        STATUS_CODE.INTERNAL_ERROR,
        err.message || "Unable to create new finance details"
      );
    }
  }

  async createHistory({ productId, user, type, shopId }) {
    try {
      const createHistory = await prisma.accessoryHistory.create({
        data: {
          productID: productId,
          type: type,
          shopId: shopId,
          addedBy: user,
        },
      });
      return createHistory;
    } catch (err) {
      throw new APIError(
        "Database Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Internal server error"
      );
    }
  }

  async updateSalesOfAccessory({ id, sellerId, status }) {
    try {
      const updatedSalesOfAccessory = await prisma.accessoryHistory.updateMany({
        where: {
          productID: id,
        },
        data: {
          sellerId: sellerId,
          type: status,
          updatedAt: new Date(),
        },
      });
      return updatedSalesOfAccessory;
    } catch (err) {
      throw new APIError(
        "Database Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Internal server error"
      );
    }
  }

  async updateSoldAccessory(id) {
    try {
      const updateSoldAccessory = await prisma.accessories.update({
        where: {
          id: id,
        },
        data: {
          stockStatus: "sold",
          updatedAt: new Date(),
        },
      });
      return updateSoldAccessory;
    } catch (err) {
      throw new APIError(
        "Database Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Internal server error"
      );
    }
  }

  async updateConfirmedAccessoryItem(confirmedData) {
    try {
      const { status, userId, transferId, shopId } = confirmedData;
      const updatedTransfer = await prisma.accessoryItems.updateMany({
        where: {
          shopID: shopId,
          transferId: transferId,
        },
        data: {
          confirmedBy: userId,
          status: status,
          updatedAt: new Date(),
        },
      });
      return updatedTransfer;
    } catch (err) {
      throw new APIError(
        "Database Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Internal server error "
      );
    }
  }

  async updateTransferHistory(distributionData) {
    try {
      const { status, userId, id } = distributionData;
      const updatedTransferHistory = await prisma.accessorytransferhistory.update({
        where: {
          id: id,
        },
        data: {
          actors_accessorytransferhistory_confirmedByToactors: {
            connect: { id: userId },
          },
          status: status,
          updatedAt: new Date(),
        },
      });
      return updatedTransferHistory;
    } catch (err) {
      throw new APIError(
        "Internal Server Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Internal server error "
      );
    }
  }

  async updateAccessoryDistributionStatusQuantity(id, distributionData) {
    try {
      const { status, quantity } = distributionData;
      const updatedAccessory = await prisma.accessories.update({
        where: {
          id: id,
        },
        data: {
          availableStock: {
            decrement: quantity,
          },
          stockStatus: status,
          updatedAt: new Date(),
        },
      });
      return updatedAccessory;
    } catch (err) {
      throw new APIError(
        "Database Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Internal server error"
      );
    }
  }

  async updateTheAccessoryStock(accessoryId, updates, user, shopId) {
    try {
      const updatedAccessory = await prisma.accessories.update({
        where: {
          id: accessoryId,
        },
        data: {
          ...updates,
          updatedAt: new Date(),
        },
      });
      await this.createHistory({
        user,
        shopId,
        productId: accessoryId,
        type: "update",
      });
      return updatedAccessory;
    } catch (err) {
      if (err.code === "P2002") {
        throw new APIError(
          "Duplicate Key Error",
          STATUS_CODE.BAD_REQUEST,
          `An accessory with the same batch number already exists.`
        );
      }
      throw new APIError(
        "Database Error",
        STATUS_CODE.INTERNAL_ERROR,
        err.message || "Unable to update the accessory"
      );
    }
  }

  async findAccessoryTransferHistory(id) {
    try {
      const accessoryItems = await prisma.accessorytransferhistory.findUnique({
        where: {
          id: id,
        },
      });
      return accessoryItems;
    } catch (err) {
      throw new APIError(
        "Internal Server Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Internal server error"
      );
    }
  }

  async findItem(stockId) {
    try {
      const stockItem = await prisma.accessories.findUnique({
        where: {
          id: stockId,
        },
        select: {
          id: true,
          stockStatus: true,
          availableStock: true,
          CategoryId: true,
          productCost: true,
          commission: true,
          batchNumber: true,
        },
      });
      return stockItem;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Database Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Internal server error"
      );
    }
  }

  async findAccessoryFinance(productId) {
    try {
      const finance = await prisma.accessoryfinance.findFirst({
        where: {
          productID: productId,
        },
      });
      return finance;
    } catch (err) {
      throw new APIError(
        "Database Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Internal server error"
      );
    }
  }

  async findAllAccessoryStockAvailable(page, limit) {
    try {
      const stockAvailable = await prisma.accessories.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          id: "desc",
        },
        select: {
          id: true,
          stockStatus: true,
          batchNumber: true,
          productCost: true,
          color: true,
          commission: true,
          discount: true,
          supplierName: true,
          CategoryId: true,
          productType: true,
          updatedAt: true,
          createdAt: true,
          categories: {
            select: {
              itemName: true,
              itemModel: true,
              brand: true,
              minPrice: true,
              maxPrice: true,
            },
          },
          accessoryfinance: {
            select: {
              financeAmount: true,
              financeStatus: true,
              financer: true,
            },
          },
        },
      });

      const totalItems = await prisma.accessories.count({
        where: {
          stockStatus: "available",
        },
      });

      return { stockAvailable, totalItems };
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError("Database Error", STATUS_CODE.INTERNAL_ERROR);
    }
  }

  async captureSpecificAccessoryForDetails(id) {
    try {
      const productFound = await prisma.accessories.findUnique({
        where: {
          id: id,
        },
        include: {
          categories: {
            select: {
              itemName: true,
              itemModel: true,
              brand: true,
              minPrice: true,
              maxPrice: true,
              itemType: true,
            },
          },
          accessoryfinance: true,
        },
      });
      return productFound;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Database Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Internal server error"
      );
    }
  }

  async captureSpecificAccessoryForTransferHistory({ id }) {
    try {
      const productId = parseInt(id, 10);
      const productFound = await prisma.accessorytransferhistory.findMany({
        where: {
          productID: productId,
        },
        select: {
          shops_accessorytransferhistory_fromshopToshops: {
            select: {
              shopName: true,
            },
          },
          shops_accessorytransferhistory_toshopToshops: {
            select: {
              shopName: true,
            },
          },
          actors_accessorytransferhistory_confirmedByToactors: {
            select: {
              name: true,
            },
          },
          actors_accessorytransferhistory_transferdByToactors: {
            select: {
              name: true,
            },
          },
        },
      });
      if (!productFound) {
        throw new APIError("Not Found", STATUS_CODE.NOT_FOUND, "Not found");
      }
      return productFound;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Database Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Internal server error"
      );
    }
  }

  async captureSpecificAccessoryForHistory({ id }) {
    try {
      const productId = parseInt(id, 10);
      const productHistory = await prisma.accessoryHistory.findMany({
        where: {
          productID: productId,
        },
        include: {
          actors: {
            select: {
              name: true,
              email: true,
            },
          },
          shops: {
            select: {
              shopName: true,
              address: true,
            },
          },
        },
      });
      return productHistory;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Database Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Internal server error"
      );
    }
  }

  async updateAccessoryItemsTransfer(id, quantity) {
    try {
      const updatedTransfer = await prisma.accessoryItems.update({
        where: {
          id: id,
        },
        data: {
          quantity: {
            decrement: quantity,
          },
          status: "transferred",
        },
      });
      return updatedTransfer;
    } catch (err) {
      throw new APIError(
        "Database Transfer Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Internal server error"
      );
    }
  }

  async createAccessoryTransferHistory(id, transferData) {
    try {
      const createdTransferHistory = await prisma.accessorytransferhistory.create({
        data: {
          quantity: transferData.quantity,
          status: transferData.status,
          type: transferData.type,
          fromshop: transferData.fromShop,
          toshop: transferData.toShop,
          productID: id,
          transferdBy: transferData.transferdBy,
        },
      });

      await prisma.accessoryItems.create({
        data: {
          accessoryID: id,
          shopID: transferData.toShop,
          status: 'pending',
          quantity: transferData.quantity,
          transferId: createdTransferHistory.id,
        },
      });

      return createdTransferHistory;
    } catch (err) {
      throw new APIError(
        "Database Transfer Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Internal server error"
      );
    }
  }

  async searchAccessoryProducts(searchItem) {
    try {
      const lowercaseSearchItem = searchItem.toLowerCase();

      const batchNumberMatches = await prisma.accessories.findMany({
        where: {
          batchNumber: {
            contains: lowercaseSearchItem,
          },
        },
        select: {
          id: true,
          batchNumber: true,
          availableStock: true,
          productCost: true,
          commission: true,
          discount: true,
          stockStatus: true,
          categories: {
            select: {
              itemName: true,
              itemModel: true,
              brand: true,
            },
          },
        },
      });

      const categoryMatches = await prisma.accessories.findMany({
        where: {
          categories: {
            OR: [
              { itemName: { contains: lowercaseSearchItem } },
              { itemModel: { contains: lowercaseSearchItem } },
              { brand: { contains: lowercaseSearchItem } },
            ],
          },
        },
        select: {
          id: true,
          batchNumber: true,
          availableStock: true,
          productCost: true,
          commission: true,
          discount: true,
          stockStatus: true,
          categories: {
            select: {
              itemName: true,
              itemModel: true,
              brand: true,
            },
          },
        },
      });

      const combinedResults = [...batchNumberMatches, ...categoryMatches];

      const filteredResults = combinedResults.filter((accessory) => {
        const batchNumberMatch =
          accessory.batchNumber?.toLowerCase().includes(lowercaseSearchItem);
        const categoryMatch =
          accessory.categories.itemName
            ?.toLowerCase()
            .includes(lowercaseSearchItem) ||
          accessory.categories.itemModel
            ?.toLowerCase()
            .includes(lowercaseSearchItem) ||
          accessory.categories.brand?.toLowerCase().includes(lowercaseSearchItem);

        return batchNumberMatch || categoryMatch;
      });

      return filteredResults;
    } catch (err) {
      throw new APIError(
        "Database Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Internal server error"
      );
    }
  }

  async softCopyOfAccessoryItem({ id }) {
    try {
      const deletedAccessory = await prisma.accessories.update({
        where: { id: parseInt(id) },
        data: {
          stockStatus: "deleted",
          history: {
            create: {
              quantity: 1,
              type: "Deleted",
            },
          },
        },
      });

      if (!deletedAccessory) {
        throw new APIError(
          "Product not found",
          STATUS_CODE.NOT_FOUND,
          "Product not found"
        );
      }
      return deletedAccessory;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Database Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Internal server error"
      );
    }
  }
}

export { AccessoryInventoryRepository };
