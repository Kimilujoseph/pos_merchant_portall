import { Sales } from "../databases/repository/sales-repository.js";
import { InventorymanagementRepository } from "../databases/repository/invetory-controller-repository.js";
import { usermanagemenRepository } from "../databases/repository/usermanagement-controller-repository.js";
import { ShopmanagementRepository } from "../databases/repository/shop-repository.js";
import { phoneinventoryrepository } from "../databases/repository/mobile-inventory-repository.js";
import { CategoryManagementRepository } from "../databases/repository/category-contoller-repository.js";
import { APIError, STATUS_CODE } from "../Utils/app-error.js";

class MobileSalesService {
  constructor(repositories = {}) {
    this.repositories = {
      user: repositories.user || new usermanagemenRepository(),
      inventory: repositories.inventory || new InventorymanagementRepository(),
      shop: repositories.shop || new ShopmanagementRepository(),
      sales: repositories.sales || new Sales(),
      mobile: repositories.mobile || new phoneinventoryrepository(),
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
        STATUS_CODE.UNAUTHORIZED
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
        STATUS_CODE.UNAUTHORIZED
      );
    }

    return user;
  }

  async validateProductAvailability(stockId, shopName) {
    const [product, shop] = await Promise.all([
      this.repositories.mobile.findItem(stockId),
      this.repositories.shop.findShop({ name: shopName }),
    ]);

    if (!product) {
      throw new APIError("Product not found", STATUS_CODE.NOT_FOUND);
    }

    const shopStockItem = shop.mobileItems.find(
      (item) =>
        item.mobileID === stockId &&
        item.quantity >= 1 &&
        item.status === "available"
    );

    if (!shopStockItem) {
      throw new APIError(
        `Product not available in ${shopName}`,
        STATUS_CODE.BAD_REQUEST
      );
    }

    return { product, shop };
  }

  async recordSaleTransaction(saleData) {
    const { product, soldPrice, costPerUnit, commission } = saleData;
    const totalRevenue = soldPrice * saleData.quantity;
    const totalCost = costPerUnit * saleData.quantity;
    const profit = totalRevenue - totalCost - commission;

    return this.repositories.sales.createnewMobilesales({
      ...saleData,
      profit,
      salesType: ["cash", "mpesa"].includes(saleData.paymentmethod)
        ? "direct"
        : "finance",
    });
  }

  async processMobileSale(saleDetails) {
    try {
      const {
        productId,
        shopname,
        soldprice,
        seller,
        CategoryId,
        ...customerDetails
      } = saleDetails;

      const stockId = parseInt(productId, 10);
      const sellerId = parseInt(seller, 10);
      const soldPrice = parseInt(soldprice, 10);
      const categoryId = parseInt(CategoryId, 10);
      const soldUnits = 1;

      // Parallel validation checks
      const [user, { product, shop }] = await Promise.all([
        this.validateSeller(sellerId, shopname),
        this.validateProductAvailability(stockId, shopname),
      ]);

      // Update inventory
      await Promise.all([
        this.repositories.shop.updateSalesOfPhone(shop.id, stockId, soldUnits),
        this.repositories.mobile.updatesalesofaphone({
          id: stockId,
          sellerId,
          status: "sold",
        }),
        this.repositories.mobile.updateSoldPhone(stockId),
      ]);

      // Record sale
      return this.recordSaleTransaction({
        productId: stockId,
        shopId: shop.id,
        sellerId,
        soldPrice,
        quantity: soldUnits,
        commission: parseInt(product.commission, 10),
        categoryId,
        costPerUnit: product.productCost,
        ...customerDetails,
        ...(await this.repositories.mobile.findMobileFinance(stockId)),
      });
    } catch (error) {
      if (!(error instanceof APIError)) {
        console.error("Sale processing error:", error);
        throw new APIError(
          "Internal server error",
          STATUS_CODE.INTERNAL_ERROR,
          error.message
        );
      }
      throw error;
    }
  }
}

export { MobileSalesService };
