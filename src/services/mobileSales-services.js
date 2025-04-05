import { Sales } from "../databases/repository/sales-repository.js";
import { InventorymanagementRepository } from "../databases/repository/invetory-controller-repository.js";
import { usermanagemenRepository } from "../databases/repository/usermanagement-controller-repository.js";
import { ShopmanagementRepository } from "../databases/repository/shop-repository.js";
import { phoneinventoryrepository } from "../databases/repository/mobile-inventory-repository.js";
import { CategoryManagementRepository } from "../databases/repository/category-contoller-repository.js";
import { APIError, STATUS_CODE } from "../Utils/app-error.js";

class mobileSales {
  constructor() {
    this.user = new usermanagemenRepository();
    this.inventory = new InventorymanagementRepository();
    this.shop = new ShopmanagementRepository();
    this.sales = new Sales();
    this.mobile = new phoneinventoryrepository();
    this.category = new CategoryManagementRepository();
  }
  async MobileSales(saledetail) {
    try {
      const {
        customerName,
        customerEmail,
        customerphonenumber,
        productId,
        shopname,
        soldprice,
        seller,
        paymentmethod,
        CategoryId,
      } = saledetail;

      const soldUnits = 1;
      const stockId = parseInt(productId, 10);
      const sellerId = parseInt(seller, 10);
      const soldPrice = parseInt(soldprice, 10);
      const categoryId = parseInt(CategoryId, 10);
      let [
        userfound,
        shopfound,
        productAvailability,
        assignedShop,
        financeDetails,
      ] = await Promise.all([
        this.user.findUserById({ id: sellerId }),
        this.shop.findShop({ name: shopname }),
        this.mobile.findItem(stockId),
        this.user.findAssignedShop(sellerId),
        this.mobile.findMobileFinance(stockId),
      ]);
      if (!userfound) {
        throw new APIError("seller not found", STATUS_CODE.NOT_FOUND, null);
      }

      if (!productAvailability) {
        throw new APIError(
          "not found",
          STATUS_CODE.NOT_FOUND,
          "product not found"
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
      if (userfound.workingstatus === "suspendend") {
        throw new APIError(
          "unauthorized",
          STATUS_CODE.UNAUTHORIZED,
          "you are currently suspendend"
        );
      } else if (userfound.workingstatus === "inactive") {
        throw new APIError(
          "unauthorized",
          STATUS_CODE.UNAUTHORIZED,
          "you currently inactive"
        );
      }
      const filteredPhoneItem = shopfound.mobileItems.filter((item) => {
        return item.mobileID !== null;
      });
      const stockItem = filteredPhoneItem.find(
        (item) => item.mobileID === stockId
      );
      console.log("stokc", stockItem);
      if (!stockItem) {
        throw new APIError(
          "product not available in the shop",
          STATUS_CODE.NOT_FOUND,
          `the product is not found in ${shopname} shop`
        );
      }
      console.log("soldunits", soldUnits);
      if (
        (stockItem.quantity < 1 && stockItem.status === "transferd") ||
        stockItem.status === "pending"
      ) {
        throw new APIError(
          "stock not available for sale",
          STATUS_CODE.BAD_REQUEST,
          `stock not available  in ${shopname}`
        );
      }
      //update shop inventory
      const shopId = parseInt(shopfound.id, 10);
      const updatedShopSales = await this.shop.updateSalesOfPhone(
        shopId,
        stockId,
        soldUnits
      );

      let typeofFinance =
        financeDetails.financer === "captech" ? "direct" : "finance";
      //update the overall products
      const updatesOnPhone = await Promise.all([
        this.mobile.updatesalesofaphone({
          id: stockId,
          sellerId: sellerId,
          status: "sold",
        }),
        this.mobile.updateSoldPhone(stockId),
      ]);

      const commissionAmount = parseInt(productAvailability.commission, 10);

      //calculate the profit
      const costperunit = productAvailability.productCost;
      const totalrevenue = soldUnits * soldPrice;
      const totalcost = soldUnits * costperunit;
      const profit = totalrevenue - totalcost - commissionAmount;
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
        finance: financeDetails.id,
        financer: financeDetails.financer,
        financeAmount: financeDetails.financeAmount,
        financeStatus: financeDetails.financeStatus,
        paymentmethod: paymentmethod,
        salesType: typeofFinance,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhoneNumber: customerphonenumber,
      };
      const recordSales = await this.sales.createnewMobilesales(confirmedSales);
      return recordSales;
    } catch (err) {
      console.log("errer", err);
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError("internal errror", STATUS_CODE.INTERNAL_ERROR, err);
    }
  }
}

export { mobileSales };
