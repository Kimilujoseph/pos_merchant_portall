import { AccessoryInventoryRepository } from "../databases/repository/accessory-inventory-repository.js";
import { ShopmanagementRepository } from "../databases/repository/shop-repository.js";
import { CategoryManagementRepository } from "../databases/repository/category-contoller-repository.js";
import { APIError, STATUS_CODE } from "../Utils/app-error.js";
import { validateUpdateInputs } from "../helpers/updateValidationHelper.js";
import prisma from "../databases/client.js";

class AccessoryManagementService {
  constructor() {
    this.accessory = new AccessoryInventoryRepository();
    this.shop = new ShopmanagementRepository();
    this.category = new CategoryManagementRepository();
  }

  async createNewAccessoryProduct(newAccessoryProduct) {
    return prisma.$transaction(async (tx) => {
      try {
        const { accessoryDetails, user } = newAccessoryProduct;
        const { CategoryId, supplierId } = accessoryDetails;
        console.log("Accessory Details:", accessoryDetails);
        const category = parseInt(CategoryId, 10);
        const categoryExist = await this.category.getCategoryById(category, tx);
        if (!categoryExist) {
          throw new APIError(
            "Invalid category",
            STATUS_CODE.BAD_REQUEST,
            "Invalid category"
          );
        }
        const shopFound = await this.shop.findShop({ name: "South B" }, tx);
        if (!shopFound) {
          throw new APIError(
            "Shop not found",
            STATUS_CODE.NOT_FOUND,
            "Shop not found"
          );
        }
        const shopId = shopFound.id;
        const payload = {
          ...accessoryDetails,
          shopId,
          user,
          supplierId: parseInt(supplierId, 10),
        };
        const newProduct = await this.accessory.createAccessoryWithFinanceDetails(
          payload,
          tx
        );
        return newProduct;
      } catch (err) {
        if (err instanceof APIError) {
          throw err;
        }
        throw new APIError("Service Error", STATUS_CODE.INTERNAL_ERROR, err);
      }
    });
  }

  async findSpecificAccessoryProduct(id) {
    try {
      const findSpecificProduct =
        await this.accessory.captureSpecificAccessoryForDetails(id);
      return findSpecificProduct;
    } catch (error) {
      throw new APIError(
        "Error finding specific accessory product",
        STATUS_CODE.INTERNAL_ERROR,
        "Internal server error"
      );
    }
  }

  async getProductTransferHistory({ id }) {
    try {
      const transferHistory =
        await this.accessory.captureSpecificAccessoryForTransferHistory({ id });
      return transferHistory;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Item Service Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Cannot find item"
      );
    }
  }

  async getProductHistory({ id }) {
    try {
      const history = await this.accessory.captureSpecificAccessoryForHistory({
        id,
      });
      if (history.length === 0) {
        throw new APIError(
          "No history found for this product",
          STATUS_CODE.NOT_FOUND,
          "No history found"
        );
      }
      return history;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Item Service Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Cannot find item"
      );
    }
  }

  // async confirmDistribution(confirmDeliveryDetails) {
  //   try {
  //     const { shopname, userId, stockId, transferID } = confirmDeliveryDetails;

  //     let [accessoryProduct, shopFound, transferDetails] = await Promise.all([
  //       this.accessory.findItem(stockId),
  //       this.shop.findShop({ name: "South B" }),
  //       this.accessory.findAccessoryTransferHistory(transferID),
  //     ]);

  //     if (!accessoryProduct) {
  //       throw new APIError(
  //         "Not Found",
  //         STATUS_CODE.NOT_FOUND,
  //         "PRODUCT NOT FOUND"
  //       );
  //     } else if (accessoryProduct.stockStatus === "deleted") {
  //       throw new APIError(
  //         "Not Found",
  //         STATUS_CODE.NOT_FOUND,
  //         "PRODUCT IS DELETED"
  //       );
  //     } else if (accessoryProduct.stockStatus === "sold") {
  //       throw new APIError(
  //         "Not Found",
  //         STATUS_CODE.NOT_FOUND,
  //         "PRODUCT IS SOLD"
  //       );
  //     }
  //     if (!transferDetails) {
  //       throw new APIError(
  //         "Not Found",
  //         STATUS_CODE.BAD_REQUEST,
  //         "TRANSFER HISTORY NOT FOUND"
  //       );
  //     }
  //     if (transferDetails.status === "confirmed") {
  //       throw new APIError(
  //         "Already Confirmed",
  //         STATUS_CODE.BAD_REQUEST,
  //         "Product already confirmed"
  //       );
  //     }
  //     if (transferDetails.productID !== stockId) {
  //       throw new APIError(
  //         "Mismatch Error",
  //         STATUS_CODE.BAD_REQUEST,
  //         "Appears a mismatch on product ID"
  //       );
  //     }
  //     if (!shopFound) {
  //       throw new APIError(
  //         "Not Found",
  //         STATUS_CODE.NOT_FOUND,
  //         "SHOP NOT FOUND"
  //       );
  //     }
  //     const shopId = shopFound.id;

  //     const sellerAssigned = shopFound.assignment.find((seller) => {
  //       return seller.actors.id === userId && seller.status === "assigned";
  //     });
  //     if (!sellerAssigned) {
  //       throw new APIError(
  //         "Unauthorized",
  //         STATUS_CODE.UNAUTHORIZED,
  //         "You are not authorized to confirm arrival"
  //       );
  //     }

  //     const distributionData = {
  //       id: transferID,
  //       status: "confirmed",
  //       userId: userId,
  //     };
  //     const confirmedData = {
  //       shopId: shopId,
  //       transferId: transferID,
  //       userId: userId,
  //       status: "confirmed",
  //     };
  //     await Promise.all([
  //       this.accessory.updateConfirmedAccessoryItem(confirmedData),
  //       this.accessory.updateTransferHistory(distributionData),
  //     ]);
  //   } catch (err) {
  //     if (err instanceof APIError) {
  //       throw err;
  //     }
  //     throw new APIError(
  //       "Distribution Service Error",
  //       STATUS_CODE.INTERNAL_ERROR,
  //       "Internal server error"
  //     );
  //   }
  // }

  async updateAccessoryStock(id, updates, userId) {
    try {
      const accessoryId = Number(id);
      const user = parseInt(userId, 10);
      if (isNaN(accessoryId)) {
        throw new APIError(
          "Service Error",
          STATUS_CODE.BAD_REQUEST,
          "Invalid value provided"
        );
      }
      const validUpdates = validateUpdateInputs(updates);
      const [shopFound, accessoryFound] = await Promise.all([
        this.shop.findShop({ name: "South B" }),
        this.accessory.findItem(accessoryId),
      ]);
      if (!shopFound) {
        throw new APIError(
          "Shop not found",
          STATUS_CODE.NOT_FOUND,
          "Shop not found"
        );
      }
      const shopId = shopFound.id;
      if (!accessoryFound) {
        throw new APIError(
          "Not Found",
          STATUS_CODE.NOT_FOUND,
          "Accessory not found"
        );
      }
      if (
        accessoryFound.stockStatus === "sold" &&
        validUpdates.stockStatus !== "sold"
      ) {
        throw new APIError(
          "Bad Request",
          STATUS_CODE.BAD_REQUEST,
          `Accessory ${accessoryFound.batchNumber} already sold, please contact the admin`
        );
      }
      if (validUpdates.productCost && validUpdates.commission) {
        if (validUpdates.commission > validUpdates.productCost * 0.2) {
          throw new APIError(
            "Commission cannot exceed 50% of product cost",
            STATUS_CODE.BAD_REQUEST,
            "Commission cannot exceed 50% of product cost"
          );
        }
      }
      const updatedAccessory = await this.accessory.updateTheAccessoryStock(
        accessoryId,
        validUpdates,
        user,
        shopId
      );
      return updatedAccessory;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Service Error",
        STATUS_CODE.INTERNAL_ERROR,
        err.message || "Unable to update accessory stock"
      );
    }
  }

  async findAllAccessoryProduct(page, limit) {
    try {
      const { stockAvailable, totalItems } =
        await this.accessory.findAllAccessoryStockAvailable(page, limit);
      const filteredItem = stockAvailable.filter(
        (item) =>
          item !== null ||
          item.history !== null ||
          item.stockStatus === "Deleted"
      );
      return { filteredItem, totalItems, page, limit };
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Item Service Error",
        STATUS_CODE.INTERNAL_ERROR,
        "Cannot find item"
      );
    }
  }

  async createNewSoftDeletion(itemId) {
    try {
      const deletedItem = await this.accessory.softCopyOfAccessoryItem({ id: itemId });
      return deletedItem;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Distribution Service Error",
        STATUS_CODE.INTERNAL_ERROR,
        err
      );
    }
  }

  async searchForAccessory(searchItem) {
    try {
      const searchResult = await this.accessory.searchAccessoryProducts(searchItem);
      return searchResult;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError("Search Error", STATUS_CODE.INTERNAL_ERROR, err);
    }
  }
}

export { AccessoryManagementService };
