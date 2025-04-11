import { Sales } from "../databases/repository/sales-repository.js";
import { InventorymanagementRepository } from "../databases/repository/invetory-controller-repository.js";
import { usermanagemenRepository } from "../databases/repository/usermanagement-controller-repository.js";
import { ShopmanagementRepository } from "../databases/repository/shop-repository.js";
import { CategoryManagementRepository } from "../databases/repository/category-contoller-repository.js";
import { APIError, STATUS_CODE } from "../Utils/app-error.js";

class AccessorySalesService {
  constructor(repositories = {}) {
    this.repositories = {
      user: repositories.user || new usermanagemenRepository(),
      inventory: repositories.inventory || new InventorymanagementRepository(),
      shop: repositories.shop || new ShopmanagementRepository(),
      sales: repositories.sales || new Sales(),
      category: repositories.category || new CategoryManagementRepository(),
    };
  }

  async validateSeller(sellerId, shopName) {
    const [user, assignedShops] = await Promise.all([
      this.repositories.user.findUserById({ id: sellerId }),
      this.repositories.user.findAssignedShop(sellerId),
    ]);

    if (!user) {
      throw new APIError("Seller not found", STATUS_CODE.NOT_FOUND);
    }

    if (user.workingstatus !== "active") {
      throw new APIError(
        `Unauthorized - Account ${user.workingstatus}`,
        STATUS_CODE.UNAUTHORIZED,
        `Unauthorized - Account ${user.workingstatus}`
      );
    }

    const activeAssignment = assignedShops.find(
      (assignment) =>
        assignment.status === "assigned" &&
        assignment.shops.shopName === shopName
    );

    if (!activeAssignment) {
      throw new APIError(
        "Unauthorized to make sales in this shop",
        STATUS_CODE.UNAUTHORIZED,
        "Unauthorized to make sales in this shop"
      );
    }

    return user;
  }

  async validateProduct(stockId, shopName, transferId, quantity) {
    const [product, shop] = await Promise.all([
      this.repositories.inventory.findProductById(stockId),
      this.repositories.shop.findShop({ name: shopName }),
    ]);

    if (!product) {
      throw new APIError(
        "Product not found",
        STATUS_CODE.NOT_FOUND,
        "product not found"
      );
    }

    if (!shop) {
      throw new APIError(
        "Shop not found",
        STATUS_CODE.NOT_FOUND,
        "shop not found"
      );
    }

    const stockItem = shop.accessoryItems.find(
      (item) =>
        item.accessoryID === stockId &&
        item.transferId === transferId &&
        item.quantity >= quantity &&
        item.status === "confirmed"
    );

    if (!stockItem) {
      throw new APIError(
        `Product not available in ${shopName}`,
        STATUS_CODE.BAD_REQUEST,
        `Product not available in ${shopName}`
      );
    }

    return { product, shop };
  }

  async updateInventory(shopId, transferId, soldUnits) {
    await this.repositories.shop.updateSalesOfAccessory(
      shopId,
      transferId,
      soldUnits
    );
  }

  async recordAccessorySaleTransaction(saleData) {
    return this.repositories.sales.createnewAccessoriesales({
      ...saleData,
    });
  }

  async processAccessorySale(saleDetails) {
    try {
      const {
        productId,
        shopname,
        soldprice,
        seller,
        transferId,
        soldUnits,
        CategoryId,
        ...otherDetails
      } = saleDetails;

      const numericFields = [
        productId,
        seller,
        soldprice,
        CategoryId,
        transferId,
      ];
      if (numericFields.some((field) => isNaN(parseInt(field, 10)))) {
        throw new APIError(
          "Invalid numeric input",
          STATUS_CODE.BAD_REQUEST,
          "invalid numeric values"
        );
      }

      const [stockId, sellerId, soldPrice, categoryId, productTransferId] =
        numericFields.map((f) => parseInt(f, 10));
      const quantity = parseInt(soldUnits, 10);

      const [user, { product, shop }] = await Promise.all([
        this.validateSeller(sellerId, shopname),
        this.validateProduct(stockId, shopname, productTransferId, quantity),
      ]);

      await this.updateInventory(shop.id, productTransferId, quantity);
      const profit =
        soldPrice -
        product.productCost * quantity -
        product.commission * quantity;
      return this.recordAccessorySaleTransaction({
        productID: stockId,
        shopID: shop.id,
        sellerId,
        soldPrice,
        paymentmethod: otherDetails.paymentmethod,
        quantity,
        commission: parseInt(product.commission, 10),
        categoryId,
        profit,
        finance: 0,
        financeAmount: 0,
        financer: "Captech limited",
        customerName: otherDetails.customerName,
        customerEmail: otherDetails.customerEmails,
        customerPhoneNumber: otherDetails.customerphonenumber,
      });
    } catch (error) {
      console.error("Accessory Sales Error:", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        "Internal server error",
        STATUS_CODE.INTERNAL_ERROR,
        "internal server error"
      );
    }
  }
}

export { AccessorySalesService };
