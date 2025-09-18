import { APIError, STATUS_CODE } from "../Utils/app-error.js";
import { phoneinventoryrepository } from "../databases/repository/mobile-inventory-repository.js";
import { ShopmanagementRepository } from "../databases/repository/shop-repository.js";
import { InventorymanagementRepository } from "../databases/repository/invetory-controller-repository.js";
import prisma from "../databases/client.js";

class transferManagementService {
  constructor() {
    this.mobile = new phoneinventoryrepository();
    this.shop = new ShopmanagementRepository();
    this.repository = new InventorymanagementRepository();
  }
  async createNewMobileTransfer(transferDetails) {
    return prisma.$transaction(async (tx) => {
      const { mainShop, distributedShop, productId, productItemId, userId } = transferDetails;
      const parsedQuantity = 1;
      const mobileId = parseInt(productId, 10);
      if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        throw new APIError(
          "transfer error",
          STATUS_CODE.BAD_REQUEST,
          "please insert a number"
        );
      }
      let [ShopOwningtheItem, ShoptoOwntheItem, stockItem, mobileShopItem] = await Promise.all([
        this.shop.findShop({ name: mainShop }, tx),
        this.shop.findShop({ name: distributedShop }, tx),
        this.mobile.findItem(mobileId, tx),
        this.mobile.findMobileItem(productItemId, tx)

      ]);
      if (!ShopOwningtheItem || !ShoptoOwntheItem) {
        throw new APIError(
          "Shop not found",
          404,
          "One of the specified shops does not exist"
        );
      }

      const shopId = parseInt(ShopOwningtheItem.id, 10);
      const shopToId = parseInt(ShoptoOwntheItem.id, 10);
      //you cannot transfer to the same shop
      if (shopId === shopToId) {
        throw new APIError(
          "transfer error",
          STATUS_CODE.BAD_REQUEST,
          "you cannot tranfer to the same shop"
        );
      }
      if (!stockItem) {
        throw new APIError(
          "transfer error",
          STATUS_CODE.BAD_REQUEST,
          "stock not found"
        );
      } else if (stockItem.stockStatus === "faulty") {
        throw new APIError(
          "transfer error",
          STATUS_CODE.BAD_REQUEST,
          "stock is faulty"
        );
      }


      if (mobileShopItem.mobileID !== mobileId || mobileShopItem.status !== "confirmed") {
        throw new APIError(
          "transfer error",
          STATUS_CODE.BAD_REQUEST,
          `Stock not found in ${mainShop} or is not in a transferable state.`
        );
      }
      if (mobileShopItem.quantity < parsedQuantity) {
        throw new APIError(
          "transfer error",
          STATUS_CODE.BAD_REQUEST,
          `not enough stock to transfer ${parsedQuantity} units`
        );
      }
      const updateQuantity = await this.mobile.updateMobileItemsTransfer(
        productItemId,
        parsedQuantity,
        tx
      );
      const newTransfer = {
        quantity: parsedQuantity,
        fromShop: shopId,
        toShop: shopToId,
        transferdBy: userId,
        status: "pending",
        type: "transfer",
      };
      const newTransferHistory = await this.mobile.createTransferHistory(
        mobileId,
        newTransfer,
        tx
      );

      const distributionId = newTransferHistory.id;
      //check if the shop receiving contains the stock
      let shoptoOwntheItemExistingStock = await this.mobile.findProductExistInShop(mobileId, shopToId, tx)
      if (!shoptoOwntheItemExistingStock) {
        const phoneDetails = {
          productID: mobileId,
          categoryId: stockItem.CategoryId,
          quantity: parsedQuantity,
          status: "pending",
          shopID: shopToId,
          transferId: distributionId,
          productStatus: "new stock",
        };
        ShoptoOwntheItem = await this.shop.newAddedphoneItem(phoneDetails, tx);
      } else if (shoptoOwntheItemExistingStock.quantity === 0) {
        const phoneDetails = {
          productID: stockId,
          categoryId: stockItem.CategoryId,
          quantity: parsedQuantity,
          status: "pending",
          shopID: shopToId,
          transferId: distributionId,
          productStatus: "new stock",
          transferId: distributionId,
          productStatus: "return of product",
        };
        //const shopId = ShoptoOwntheItem.id;
        ShoptoOwntheItem = await this.mobile.newAddedphoneItem(phoneDetails, tx);
      } else {
        throw new APIError(
          "phone inserting error",
          STATUS_CODE.BAD_REQUEST,
          "phone already exist"
        );
      }
    });
  }
  async createnewAccessoryTransfer(transferDetails) {
    return prisma.$transaction(async (tx) => {
      const {
        mainShop,
        distributedShop,
        productId,
        productItemId,
        quantity,
        userId,
        transferId,
      } = transferDetails;
      const parsedQuantity = parseInt(quantity, 10);
      const accessory = parseInt(productId, 10);
      const accessoryItem = parseInt(productItemId, 10)
      const itemTransferId = parseInt(transferId, 10);
      const sellerId = parseInt(userId, 10);
      if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        throw new APIError(
          "transfer error",
          STATUS_CODE.BAD_REQUEST,
          "please insert a number"
        );
      }
      let [ShopOwningtheItem, ShoptoOwntheItem, stockItem, shopStockItem] = await Promise.all([
        this.shop.findShop({ name: mainShop }, tx),
        this.shop.findShop({ name: distributedShop }, tx),
        this.repository.findProductById(accessory, tx),
        this.repository.findAccessoryItemProduct(accessoryItem, tx)
      ]);
      if (!ShopOwningtheItem || !ShoptoOwntheItem) {
        throw new APIError(
          "Shop not found",
          404,
          "One of the specified shops does not exist"
        );
      }
      if (!stockItem) {
        throw new APIError("product not found", STATUS_CODE.NOT_FOUND);
      }

      if (
        stockItem.stockStatus === "deleted" ||
        stockItem.stockStatus === "suspended"
      ) {
        throw new APIError(
          "bad request",
          STATUS_CODE.BAD_REQUEST,
          `the product is ${stockItem.stockStatus}`
        );
      }
      const sellerAssinged = ShopOwningtheItem.assignment.find(
        (seller) => seller.actors.id === sellerId
      );
      if (!sellerAssinged) {
        throw new APIError(
          "Unauthorized",
          STATUS_CODE.UNAUTHORIZED,
          "You are not authorized to confirm arrival"
        );
      }
      const shopId = parseInt(ShopOwningtheItem.id, 10);
      const shopToId = parseInt(ShoptoOwntheItem.id, 10);
      //you cannot transfer to the same shop
      if (shopId === shopToId) {
        throw new APIError(
          "transfer error",
          STATUS_CODE.BAD_REQUEST,
          "you cannot tranfer to the same shop"
        );
      }

      if (shopStockItem.accessoryID !== productId && shopStockItem.transferId !== itemTransferId) {
        throw new APIError(
          "transfer error",
          STATUS_CODE.BAD_REQUEST,
          `stock not found in ${mainShop}`
        );
      }
      if (shopStockItem.quantity < parsedQuantity) {
        throw new APIError(
          "transfer error",
          STATUS_CODE.BAD_REQUEST,
          `not enough stock to transfer ${parsedQuantity} units`
        );
      }

      const newTransfer = {
        quantity: parsedQuantity,
        fromShop: shopId,
        toShop: shopToId,
        userId: sellerId,
        productId: parseInt(productId, 10),
        transferdBy: sellerId,
        status: "pending",
        type: "transfer",
      };
      // let shoptoOwntheItemExistingStock =
      //   await ShoptoOwntheItem.accessoryItems.filter((item) => {
      //     return item.accessoryID === productId;
      //   });

      // const AvailableQuantity = shoptoOwntheItemExistingStock?.reduce(
      //   (acc, item) => acc + item.quantity,
      //   0
      // );
      let shoptoOwntheItemExistingStock = await this.repository.findProductExistInShop(accessory, shopToId)
      if (!shoptoOwntheItemExistingStock) {
        const newTransferDone = await this.repository.createTransferHistory(
          accessory,
          newTransfer,
          tx
        );
        await this.repository.updateStockQuantityInAshop(
          accessoryItem,
          parsedQuantity,
          tx
        );
        const distributionId = newTransferDone.id;
        const stockDetails = {
          productID: accessory,
          quantity: parsedQuantity,
          status: "pending",
          transferId: distributionId,
          productStatus: "new stock",
        };

        await this.shop.addNewAccessory(
          shopToId,
          stockDetails,
          tx
        );
      } else if (shoptoOwntheItemExistingStock.quantity < 10) {
        const newTransferDone = await this.repository.createTransferHistory(
          accessory,
          newTransfer,
          tx
        );
        await this.repository.updateStockQuantityInAshop(
          accessoryItem,
          parsedQuantity,
          tx
        );
        const distributionId = newTransferDone.id;
        const stockDetails = {
          productID: accessory,
          quantity: parsedQuantity,
          status: "pending",
          transferId: distributionId,
          categoryId: stockItem.CategoryId,
          productStatus: "added sock",
        };

        await this.shop.addNewAccessory(
          shopToId,
          stockDetails,
          tx
        );
      } else {
        throw new APIError(
          "enough stock already available",
          STATUS_CODE.BAD_REQUEST,
          `enough stock already exist in ${distributedShop}`
        );
      }
    });
  }
}

export { transferManagementService };
