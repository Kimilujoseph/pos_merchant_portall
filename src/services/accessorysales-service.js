import { Sales } from "../databases/repository/sales-repository.js";
import { InventorymanagementRepository } from "../databases/repository/invetory-controller-repository.js";
import { usermanagemenRepository } from "../databases/repository/usermanagement-controller-repository.js";
import { ShopmanagementRepository } from "../databases/repository/shop-repository.js";
import { phoneinventoryrepository } from "../databases/repository/mobile-inventory-repository.js";
import { CategoryManagementRepository } from "../databases/repository/category-contoller-repository.js";
import { APIError, STATUS_CODE } from "../Utils/app-error.js";

class accessorySales {
  constructor() {
    this.user = new usermanagemenRepository();
    this.inventory = new InventorymanagementRepository();
    this.shop = new ShopmanagementRepository();
    this.sales = new Sales();
    this.mobile = new phoneinventoryrepository();
    this.category = new CategoryManagementRepository();
  }
  async Accessorysales(salesDetail) {
    try {
      const {
        customerName,
        customerEmail,
        customerphonenumber,
        CategoryId,
        productId,
        shopname,
        soldUnits,
        soldprice,
        seller,
        transferId,
        paymentmethod,
      } = salesDetail;
      const stockId = parseInt(productId, 10);
      const sellerId = parseInt(seller, 10);
      const categoryId = parseInt(CategoryId, 10);
      const quantity = parseInt(soldUnits, 10);
      const soldPrice = parseInt(soldprice, 10);
      const productTransferId = parseInt(transferId);
      let [userfound, shopFound, productAvailability, assignedShop] =
        await Promise.all([
          this.user.findUserById({ id: sellerId }),
          this.shop.findShop({ name: shopname }),
          this.inventory.findProductById(stockId),
          this.user.findAssignedShop(sellerId),
        ]);
      let saleType;

      if (!shopFound) {
        throw new APIError(
          "not found",
          STATUS_CODE.NOT_FOUND,
          ` ${shopname} shop NOT FOUND`
        );
      }
      const shopId = parseInt(shopFound.id, 10);

      if (!userfound) {
        throw new APIError(
          "not found",
          STATUS_CODE.NOT_FOUND,
          "seller not found"
        );
      }
      const assigned = assignedShop.filter(
        (assignment) => assignment.status === "assigned"
      );

      if (assigned[0].shops.shopName !== shopname) {
        throw new APIError(
          "unauthorised to make sales",
          STATUS_CODE.UNAUTHORIZED,
          "not allowed to make sales in this shop"
        );
      }
      if (seller.workingstatus === "suspended") {
        throw new APIError(
          "unauthorised",
          STATUS_CODE.UNAUTHORIZED,
          "you are currently suspendend"
        );
      } else if (seller.workingstatus === "inactive") {
        throw new APIError(
          "unauthorised",
          STATUS_CODE.UNAUTHORIZED,
          "you are currently inactive"
        );
      }
      if (!productAvailability) {
        throw new APIError(
          "Product not found",
          STATUS_CODE.NOT_FOUND,
          "Product not found"
        );
      }

      const filteredAccessoryItem = shopFound.accessoryItems.filter((item) => {
        return item.accessoryID !== null;
      });
      const stockItem = filteredAccessoryItem.find(
        (item) =>
          item.accessoryID === stockId && item.transferId === productTransferId
      );
      if (!stockItem) {
        throw new APIError(
          "Product not available in the shop",
          STATUS_CODE.NOT_FOUND,
          `${productAvailability.categories.itemName} model ${productAvailability.categories.itemModel} not available in the shop`
        );
      }
      if (stockItem.quantity < quantity) {
        throw new APIError(
          "Insufficient accessory to sell",
          STATUS_CODE.BAD_REQUEST,
          `Not enough stock of ${productAvailability.categories.itemName} model ${productAvailability.categories.itemModel}`
        );
      }
      if (stockItem.status === "pending") {
        throw new APIError(
          "stock not available for sale",
          STATUS_CODE.BAD_REQUEST,
          "stock not available for sale"
        );
      }
      //update shop sales
      const updatedShop = await this.shop.updateSalesOfAccessory(
        shopId,
        productTransferId,
        soldUnits
      );
      //update the overall stock
      const commissionAmount = parseInt(productAvailability.commission, 10);
      //calculate the profit

      const totalrevenue = soldPrice;
      const costperunit = productAvailability.productCost;
      const totalcost = soldUnits * costperunit;
      const profit = totalrevenue - totalcost - commissionAmount;

      //update sales person sales history

      const confirmedSales = {
        productID: stockId,
        shopID: shopId,
        sellerId: sellerId,
        profit: profit,
        soldPrice: soldPrice,
        quantity: 1,
        commission: commissionAmount,
        commisssionStatus: "pending",
        shopID: shopId,
        categoryId: categoryId,
        finance: 1,
        financer: "captech",
        financeAmount: 0,
        financeStatus: "paid",
        paymentmethod: paymentmethod,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhoneNumber: customerphonenumber,
      };
      const recordSales = await this.sales.createnewAccessoriesales(
        confirmedSales
      );

      return recordSales;
    } catch (err) {
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError("internal server", STATUS_CODE.INTERNAL_ERROR, err);
    }
  }
}

export { accessorySales };
