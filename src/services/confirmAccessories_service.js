import { InventorymanagementRepository } from "../databases/repository/invetory-controller-repository.js";
import { ShopmanagementRepository } from "../databases/repository/shop-repository.js";
import { APIError, STATUS_CODE } from "../Utils/app-error.js";
import prisma from "../databases/client.js";

class ConfirmAccessorymanagementService {
  constructor(repository = {}) {
    this.repository = {
      inventory: repository.inventory || new InventorymanagementRepository(),
      shop: repository.shop || new ShopmanagementRepository(),
    };
  }
  async confirmDistribution(confirmdeliverydetails) {
    try {
      const { id, shopname, userId, productId, quantity, transferId } =
        confirmdeliverydetails;

      const [
        accessoryItemId,
        stockId,
        transferproductId,
        parsedQuantity,
        parsedTransferId,
        parsedUserId,
      ] = [
          parseInt(id, 10),
          parseInt(productId, 10),
          parseInt(transferId, 10),
          parseInt(quantity, 10),
          parseInt(transferId, 10),
          parseInt(userId, 10),
        ];

      if (
        [accessoryItemId,
          stockId,
          transferproductId,
          parsedQuantity,
          parsedTransferId,
          parsedUserId,
        ].some(isNaN)
      ) {
        throw new APIError(
          "bad request",
          STATUS_CODE.BAD_REQUEST,
          "Invalid values provided"
        );
      }

      await prisma.$transaction(async (tx) => {
        let [accessoryProduct, shopFound] = await Promise.all([
          this.repository.inventory.findProductById(stockId, tx),
          this.repository.shop.findShop({ name: shopname }, tx),
        ]);

        this.validationProcess(accessoryProduct, shopFound, parsedUserId);
        const newAccessory = this.findTheAccessory(
          shopFound,
          parsedTransferId,
          parsedQuantity
        );
        const shopId = parseInt(shopFound.id);
        const accessoryId = newAccessory.accessoryID;
        await this.transferProcess(
          parsedTransferId,
          parsedUserId,
          shopId,
          accessoryItemId,
          tx
        );
      });
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        "Distribution service error",
        STATUS_CODE.INTERNAL_ERROR,
        "Internal server error"
      );
    }
  }

  validationProcess(accessoryProduct, shopFound, parsedUserId) {
    if (!accessoryProduct) {
      throw new APIError(
        "Product not found",
        STATUS_CODE.NOT_FOUND,
        "Product not found"
      );
    }
    if (["deleted", "suspended"].includes(accessoryProduct.stockStatus)) {
      throw new APIError(
        "Bad Request",
        STATUS_CODE.BAD_REQUEST,
        `this product is ${accessoryProduct.stockStatus}`
      );
    }
    if (!shopFound) {
      throw new APIError("not found", STATUS_CODE.NOT_FOUND, "SHOP NOT FOUND");
    }
    if (
      !shopFound.assignment.some((seller) => seller.actors.id === parsedUserId)
    ) {
      throw new APIError(
        "Unauthorized",
        STATUS_CODE.UNAUTHORIZED,
        "You are not authorized to confirm arrival"
      );
    }
  }

  findTheAccessory(shopFound, parsedTransferId, quantity) {
    const newAccessory = shopFound.accessoryItems.find((item) => {
      return item.accessoryID !== null && item.transferId === parsedTransferId;
    });
    if (!newAccessory) {
      throw new APIError(
        "not found",
        STATUS_CODE.NOT_FOUND,
        " NEW ACCESSORY  NOT FOUND"
      );
    }
    if (newAccessory.status === "confirmed") {
      throw new APIError(
        "Bad Request",
        STATUS_CODE.BAD_REQUEST,
        "Accessory has already been confirmed."
      );
    }
    if (newAccessory.quantity < quantity) {
      throw new APIError(
        "Bad Request",
        STATUS_CODE.BAD_REQUEST,
        "The quantity being confirmed exceeds the quantity that was transferred."
      );
    }
    return newAccessory;
  }

  async transferProcess(parsedTransferId, parsedUserId, shopId, accessoryId, tx) {
    const updates = {
      status: "confirmed",
      confirmedBy: parsedUserId,
      updatedAt: new Date(),
    };
    await Promise.all([
      this.repository.inventory.updateTransferHistory(
        parsedTransferId,
        updates,
        tx
      ),
      this.repository.shop.updateConfirmationOfAccessory(
        shopId,
        parsedTransferId,
        parsedUserId,
        accessoryId,
        tx
      ),
    ]);
  }
}

export { ConfirmAccessorymanagementService };
