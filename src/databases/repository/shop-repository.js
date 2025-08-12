import prisma from "../client.js";
import { APIError, STATUS_CODE } from "../../Utils/app-error.js";

class ShopmanagementRepository {
  constructor() {
    this.prisma = prisma;
  }

  async createShop({ name, address }) {
    try {
      console.log("name", name);
      const shop = await this.prisma.shops.create({
        data: {
          shopName: name,
          address: address,
        },
      });
      return shop;
    } catch (err) {
      console.log("err", err);
      throw new APIError(
        "API Error",
        STATUS_CODE.INTERNAL_ERROR,
        "unable to Create Shop"
      );
    }
  }

  async findShopById(id) {
    try {
      const shopFound = await this.prisma.shops.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          shopName: true,
          address: true,
        },
      });
      if (!shopFound) {
        throw new APIError(
          "not found",
          STATUS_CODE.NOT_FOUND,
          "Shop not found"
        );
      }
      return shopFound;
    } catch (err) {
      console.log("finding shop error", err);
      throw new APIError(
        "API Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Unable to find Shop"
      );
    }
  }

  async findShop({ name }, tx) {
    const prismaClient = tx || this.prisma;
    try {
      const findShop = await prismaClient.shops.findFirst({
        where: {
          shopName: name,
        },
        select: {
          id: true,
          shopName: true,
          address: true,
          assignment: {
            select: {
              id: true,
              actors: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true
                },
              },
              fromDate: true,
              toDate: true,
              status: true,
            },
          },
          mobileItems: {
            select: {
              id: true,
              mobileID: true,
              shopID: true,
              status: true,
              confirmedBy: true,
              transferId: true,
              createdAt: true,
              productStatus: true,
              quantity: true,
              updatedAt: true,
              mobiles: {
                select: {
                  categories: true,
                  IMEI: true,
                  batchNumber: true,
                  color: true,
                  productCost: true,
                  discount: true,
                  stockStatus: true,
                },
              },
            },
          },
          accessoryItems: {
            select: {
              id: true,
              accessoryID: true,
              shopID: true,
              status: true,
              createdAt: true,
              quantity: true,
              productStatus: true,
              updatedAt: true,
              transferId: true,
              confirmedBy: true,
              accessories: {
                select: {
                  categories: true,
                  productCost: true,
                  discount: true,
                  stockStatus: true,
                  batchNumber: true,
                },
              },
            },
          },
        },
      });
      return findShop;
    } catch (err) {
      console.log(err);
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "API Error",
        STATUS_CODE.INTERNAL_ERROR,
        err.message || "Unable to find the shop"
      );
    }
  }

  async findShopsAvailable() {
    try {
      const findShop = await this.prisma.shops.findMany({
        select: {
          id: true,
          shopName: true,
          address: true,
        },
      });

      return findShop;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "API Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Unable to find the shop"
      );
    }
  }

  async findSpecificShopItem({ name, requestedItem, page = 1, limit = 10 }) {
    try {
      const shop = await this.prisma.shops.findFirst({
        where: { shopName: name },
        select: { id: true, shopName: true },
      });

      if (!shop) {
        throw new APIError(
          "Shop not found",
          STATUS_CODE.NOT_FOUND,
          "Shop not found"
        );
      }
      let items = [];
      if (requestedItem === "phoneItems") {
        items = await this.prisma.mobileItems.findMany({
          where: {
            shopID: shop.id,
            status: "confirmed",
          },
          include: {
            mobiles: {
              select: {
                itemName: true,
                brand: true,
                itemModel: true,
                minprice: true,
                maxprice: true,
              },
            },
          },
        });
      } else if (requestedItem === "stockItems") {
        items = await this.prisma.accessoryItems.findMany({
          where: {
            shopID: shop.id,
            status: "confirmed",
          },
          include: {
            accessories: {
              select: {
                itemName: true,
                brand: true,
                itemModel: true,
                minprice: true,
                maxprice: true,
              },
            },
          },
        });
      } else {
        throw new APIError(
          "Invalid requested item type",
          STATUS_CODE.BAD_REQUEST,
          "Invalid item type"
        );
      }

      items = items.filter(
        (item) => item.mobiles !== null || item.accessories !== null
      );

      const startIndex = (page - 1) * limit;
      const paginatedItems = items.slice(startIndex, startIndex + limit);

      return {
        totalItems: items.length,
        totalPages: Math.ceil(items.length / limit),
        currentPage: page,
        items: paginatedItems,
      };
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "API Error",
        STATUS_CODE.INTERNAL_ERROR,
        err.message || "Unable to find the shop"
      );
    }
  }
  
  async updateShopDetails(shopID, shopDetails) {
    try {
      const shop = await this.findShopById(shopID);
      if (!shop) {
        throw new APIError(
          "Shop not found",
          STATUS_CODE.NOT_FOUND,
          "Shop not found"
        );
      }
      const updatedShop = await this.prisma.shops.update({
        where: { id: shopID },
        data: shopDetails,
      });

      return updatedShop;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "API Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Unable to update Shop"
      );
    }
  }

  async updateSalesOfAccessory(shopId, transferId, soldUnits) {
    console.log("@@#soldunits", soldUnits);
    try {
      const accessoryItemUpdate = await this.prisma.accessoryItems.updateMany({
        where: {
          shopID: shopId,
          transferId: transferId,
        },
        data: {
          quantity: {
            increment: soldUnits,
          },
        },
      });
      return accessoryItemUpdate;
    } catch (err) {
      console.log(err);
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Update error",
        STATUS_CODE.INTERNAL_ERROR,
        "Server error"
      );
    }
  }

  async updateSalesOfPhone(shopId, productID, soldUnits) {
    try {
      const mobileItem = await this.prisma.mobileItems.findFirst({
        where: {
          shopID: shopId,
          mobileID: productID,
          status: "confirmed",
        },
      });
      if (!mobileItem) {
        throw new APIError(
          "not found",
          STATUS_CODE.BAD_REQUEST,
          "mobile item not found"
        );
      }

      const updateSalesOfPhone = await this.prisma.mobileItems.update({
        where: {
          id: mobileItem.id,
        },
        data: {
          quantity: {
            decrement: soldUnits,
          },
          status: "sold",
          updatedAt: new Date(),
        },
      });

      return updateSalesOfPhone;
    } catch (err) {
      console.log("error in updating", err);
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "update error",
        STATUS_CODE.INTERNAL_ERROR,
        "server error"
      );
    }
  }

  async searchProductName(productName, shopName) {
    console.log("#@#", shopName);

    try {
      const shop = await this.prisma.shops.findFirst({
        where: { shopName: shopName },
        select: { id: true },
      });

      if (!shop) {
        throw new APIError(`Shop with name ${shopName} not found`);
      }

      const searchTerm = productName.toLowerCase();

      const phoneItems = await this.prisma.mobileItems.findMany({
        where: {
          shopID: shop.id,
          mobiles: {
            categories: {
              OR: [
                { itemName: { contains: searchTerm } },
                { itemModel: { contains: searchTerm } },
                { brand: { contains: searchTerm } },
              ],
            },
          },
        },
        select: {
          mobiles: {
            select: {
              categories: {
                select: {
                  itemName: true,
                  itemModel: true,
                  brand: true,
                },
              },
              IMEI: true,
              color: true,
              stockStatus: true,
              commission: true,
            },
          },
        },
      });

      const matchingImei = await this.prisma.mobileItems.findMany({
        where: {
          shopID: shop.id,
          mobiles: {
            OR: [{ IMEI: { contains: searchTerm } }],
          },
        },
        select: {
          mobiles: {
            select: {
              categories: {
                select: {
                  itemName: true,
                  itemModel: true,
                  brand: true,
                },
              },
              IMEI: true,
              color: true,
              stockStatus: true,
              commission: true,
            },
          },
        },
      });

      const stockItems = await this.prisma.accessoryItems.findMany({
        where: {
          shopID: shop.id,
          accessories: {
            categories: {
              OR: [
                { itemName: { contains: searchTerm } },
                { itemModel: { contains: searchTerm } },
                { brand: { contains: searchTerm } },
              ],
            },
          },
        },
        select: {
          accessories: {
            select: {
              categories: {
                select: {
                  itemName: true,
                  itemModel: true,
                  brand: true,
                },
              },
            },
            select: {
              batchNumber: true,
              stockStatus: true,
              commission: true,
            },
          },
        },
      });

      return {
        phoneItems,
        stockItems,
        matchingImei,
      };
    } catch (err) {
      console.log("erroror", err);
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "err fetching products",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server errorr"
      );
    }
  }
  
  async newAddedphoneItem(newItem, tx) {
    const prismaClient = tx || this.prisma;
    try {
      const updatedShop = await prismaClient.mobileItems.create({
        data: {
          status: newItem.status,
          productStatus: newItem.productStatus,
          transferId: newItem.transferId,
          quantity: newItem.quantity,
          shops: {
            connect: { id: newItem.shopID },
          },
          mobiles: {
            connect: { id: newItem.productID },
          },
        },
      });
      return updatedShop;
    } catch (err) {
      console.error("Error in newAddedphoneItem:", err);
      throw new APIError(
        "database error",
        STATUS_CODE.INTERNAL_ERROR,
        "database error"
      );
    }
  }

  async updateConfirmationOfProduct(shopId, newPhoneItemId, userName) {
    try {
      const updatedNewPhoneItem = await this.prisma.mobileItems.update({
        where: {
          id: newPhoneItemId,
        },
        data: {
          status: "confirmed",
          confirmedBy: userName,
          updatedAt: new Date.now(),
        },
      });

      return updatedNewPhoneItem;
    } catch (err) {
      throw new APIError(
        "Database error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }

  async addNewAccessory(shopId, newItem) {
    try {
      const newAccessoryItem = await this.prisma.accessoryItems.create({
        data: {
          accessoryID: newItem.productID,
          quantity: newItem.quantity,
          shopID: shopId,
          status: newItem.status || "pending",
          transferId: newItem.transferId,
          productStatus: newItem.productStatus || "new stock",
          confirmedBy: null,
          createdAt: new Date(),
        },
      });

      return newAccessoryItem;
    } catch (err) {
      console.error("Error adding new accessory item:", err);
      throw new APIError(
        "Database error",
        STATUS_CODE.INTERNAL_ERROR,
        "Unable to add new accessory item"
      );
    }
  }

  async updateConfirmationOfAccessory(
    shopId,
    transferproductId,
    userId,
    accessoryId
  ) {
    try {
      const updatedNewAccessoryItem = await this.prisma.accessoryItems.update({
        where: {
          accessoryID_shopID_transferId: {
            accessoryID: accessoryId,
            shopID: shopId,
            transferId: transferproductId,
          },
        },
        data: {
          status: "confirmed",
          confirmedBy: userId,
          updatedAt: new Date(),
        },
      });
      return updatedNewAccessoryItem;
    } catch (err) {
      console.log("err", err);
      throw new APIError(
        "Database error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }

  async updateAccessoryQuantity(shopId, accessoryId, quantity) {
    try {
      const updatedNewAccessoryItem = await this.prisma.accessoryItems.updateMany({
        where: {
          shopID: shopId,
          accessoryID: accessoryId,
        },
        data: {
          quantity: {
            increment: quantity,
          },
        },
      });
      return updatedNewAccessoryItem;
    } catch (err) {
      throw new APIError(
        "Database error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }
}

export { ShopmanagementRepository };
