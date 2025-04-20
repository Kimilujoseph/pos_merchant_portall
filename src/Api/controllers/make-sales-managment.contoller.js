import { salesmanagment } from "../../services/sales-services.js";
import { AccessorySalesService } from "../../services/accessorysales-service.js";
import { MobileSalesService } from "../../services/mobileSales-services.js";
import { transformSales } from "../../helpers/transformsales.js";
import { getDateRange } from "../../helpers/dateUtils.js";
import { checkRole } from "../../helpers/authorisation.js";
import {
  handleError,
  handleSalesResponse,
} from "../../helpers/responseUtils.js";
import { APIError, STATUS_CODE } from "../../Utils/app-error.js";
import moment from "moment";

const salesService = new salesmanagment();
const mobileSales = new MobileSalesService();
const accessorySalesService = new AccessorySalesService();

const makesales = async (req, res) => {
  try {
    const { bulksales, customerdetails, shopName } = req.body;
    const user = req.user;
    const shopname = req.params.name;

    // Created a helper  function to process depending on product category
    const processSales = (sales, salesMethod) => {
      //flatMap() will hadle multiple itemId and ensure each
      //id is procesed as a separate sales
      return sales.flatMap((sale) => {
        const { items, ...salesDetail } = sale;
        // console.log("SDwe", salesDetail);

        return items.map((item) => {
          const salesDetails = {
            paymentmethod: salesDetail.paymentmethod,
            CategoryId: salesDetail.CategoryId,
            soldprice: item.soldprice,
            soldUnits: item.soldUnits,
            productId: item.productId,
            shopname: shopName,
            transferId: item?.transferId,
            seller: user.id,
            customerName: customerdetails.name,
            customerEmail: customerdetails.email,
            customerphonenumber: customerdetails.phonenumber,
          };
          return salesMethod(salesDetails);
        });
      });
    };
    const phonesales = bulksales.filter((sale) => sale.itemType === "mobiles");
    const processphonesales =
      phonesales.length > 0
        ? processSales(
            phonesales,
            mobileSales.processMobileSale.bind(mobileSales)
          )
        : [];
    // Process accessory sales
    const accessoriesSales = bulksales.filter(
      (sales) => sales.itemType == "accessories"
    );
    const processaccessoriesales =
      accessoriesSales.length > 0
        ? processSales(
            accessoriesSales,
            accessorySalesService.processAccessorySale.bind(
              accessorySalesService
            )
          )
        : [];

    // Use promises to wait for all sales to be processed
    const allPromises = [...processphonesales, ...processaccessoriesales];
    if (allPromises.length > 0) {
      const results = await Promise.allSettled(allPromises);

      const successfulSales = results.filter(
        (result) => result.status === "fulfilled"
      );
      const failedSales = results.filter(
        (result) => result.status === "rejected"
      );
      handleSalesResponse({
        res,
        message: "sales process completed",
        successfulSales: successfulSales,
        failedSales: failedSales,
      });
    } else {
      throw new APIError(
        "No distribution made",
        STATUS_CODE.BAD_REQUEST,
        "No sales made"
      );
    }
  } catch (err) {
    handleError(res, err);
  }
};

export { makesales };
