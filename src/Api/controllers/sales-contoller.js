import { parse } from "dotenv";
import { salesmanagment } from "../../services/sales-services.js";
import { AccessorySalesService } from "../../services/accessorysales-service.js";
import { MobileSalesService } from "../../services/mobileSales-services.js";
import { transformSales } from "../../helpers/transformsales.js";
import { getDateRange } from "../../helpers/dateUtils.js";
import { checkRole } from "../../helpers/authorisation.js";
import { handleError, handleResponse } from "../../helpers/responseUtils.js";
import { APIError, STATUS_CODE } from "../../Utils/app-error.js";
import moment from "moment";
import {
  generatePdfMakeReport,
  generatePdfSalesReport,
} from "../../services/pdfGenerator.js";

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
        console.log("SDwe", salesDetail);

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

      if (failedSales.length > 0) {
        console.error("Some distributions failed:", failedSales);
      }
      return res.status(200).json({
        message: "sales process completed",
        successfulSales: successfulSales.length,
        failedSales: failedSales.length,
        error: failedSales.length > 0,
        details: failedSales.map((failure) => ({
          reason: failure.reason.message || "Unknown error",
        })),
      });
    } else {
      throw new APIError(
        "No distribution made",
        STATUS_CODE.BAD_REQUEST,
        "No sales made"
      );
    }
  } catch (err) {
    console.log("err", err);
    if (err instanceof APIError) {
      res.status(err.statusCode).json({
        error: err.message,
      });
    } else {
      res.status(STATUS_CODE.INTERNAL_ERROR).json({
        error: "Internal Server Error",
      });
    }
  }
};

const getgeneralsales = async (req, res) => {
  try {
    const { page, limit, date } = req.query;

    const period = req.query.period || "year";

    if (!checkRole(req.user.role, ["manager", "superuser"])) {
      throw new APIError(
        "not authorised",
        STATUS_CODE.UNAUTHORIZED,
        "not authorised to view the page"
      );
    }
    const [startDate, endDate] = getDateRange(period, date).map((m) =>
      m.toDate()
    );

    const generalSales = await salesService.generategeneralsales({
      startDate,
      endDate,
      limit: Math.min(100, parseInt(limit)) || 1000,
      page: Math.max(1, parseInt(page)) || 1,
    });
    if (!generalSales) {
      throw new APIError(
        "No sales found",
        STATUS_CODE.NOT_FOUND,
        "No sales found for the given period"
      );
    }
    const { sales, analytics } = generalSales[0];
    //console.log("analytics of general sales ", analytics);
    //console.log("@#", sales);
    const transformedSales = transformSales(sales);
    // console.log("##$%#%$^", transformedSales);
    handleResponse({
      res,
      message: "General sales data retrieved successfully",
      data: {
        analytics: analytics || {},
        sales: transformedSales || [],
        salesPerMonth: sales.salesPerMonth || [],
        totalSales: sales.totalSales || 0,
        totalProfit: sales.totalProfit || 0,
        totalCommission: sales.totalCommission || 0,
        totalfinancePending: sales.financeSales || 0,
        totalPages: sales.totalPages || 1,
        currentPage: sales.currentPage || 1,
        itemsPerPage: limit || 10,
      },
    });
  } catch (err) {
    handleError(res, err);
  }
};

const getCategorySales = async (req, res) => {
  try {
    const { date, page = 1, limit = 10 } = req.query;
    const period = req.query.period || "year";
    const categoryId = parseInt(req.params.categoryId, 10);
    const user = req.user;
    if (user.role !== "manager" && user.role !== "superuser") {
      throw new APIError("not authorised", 403, "not allowed to view sales");
    }

    // Helper functions for date ranges
    const getStartOfDay = (date) =>
      new Date(new Date(date).setHours(0, 0, 0, 0));
    const getEndOfDay = (date) =>
      new Date(new Date(date).setHours(23, 59, 59, 999));

    let startDate, endDate;

    if (date) {
      startDate = getStartOfDay(date);
      endDate = getEndOfDay(date);
    } else {
      const now = moment();
      switch (period) {
        case "week":
          startDate = now.startOf("week").toDate();
          endDate = now.endOf("week").toDate();
          break;
        case "month":
          startDate = now.startOf("month").toDate();
          endDate = now.endOf("month").toDate();
          break;
        case "year":
          startDate = now.startOf("year").toDate();
          endDate = now.endOf("year").toDate();
          break;
        default:
          startDate = now.startOf("day").toDate();
          endDate = now.endOf("day").toDate();
      }
    }
    const salesDetails = {
      categoryId,
      startDate,
      endDate,
      page: parseInt(page),
      limit: parseInt(limit),
    };

    const report = await salesService.generateCategorySales(salesDetails);

    if (!report) {
      return res
        .status(404)
        .json({ message: "No sales found for the given category." });
    }
    const { analytics, sales } = report;
    res.status(200).json({
      success: true,
      message: "General sales data retrieved successfully",
      data: {
        analytics: analytics || {},
        sales: sales.sales || [],
        salesPerMonth: sales.salesPerMonth || [],
        totalSales: sales.totalSales || 0,
        totalProfit: sales.totalProfit || 0,
        totalCommission: sales.totalCommission || 0,
        totalfinanceSalesPending: sales.financeSales || 0,
        totalPages: sales.totalPages || 1,
        currentPage: sales.currentPage || 1,
      },
    });
  } catch (err) {
    console.error(err);

    if (err instanceof APIError) {
      res.status(err.statusCode).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

const getShopSales = async (req, res) => {
  try {
    const { date, page, limit } = req.query;
    const period = req.query.period || "year";
    if (!["manager", "superuser"].includes(req.user.role)) {
      throw new APIError(
        "not authorised",
        STATUS_CODE.UNAUTHORIZED,
        "not allowed to view sales"
      );
    }
    const [startdate, endDate] = date
      ? [moment(date).startOf("day").toDate, moment(date).endOf("day").toDate]
      : getDateRange(period).map((m) => m.toDate);
    const shopId = parseInt(req.params.shopId, 10);
    const report = await salesService.generateShopSales({
      shopId: shopId,
      startDate: startdate,
      endDate: endDate,
      page: Math.max(1, parseInt(page)),
      limit: Math.min(100, parseInt(limit)),
    });
    if (!report) {
      res.status(404).json({ message: "Shop sales not found" });
      return;
    }
    const { analytics, sales } = report;
    res.status(report ? 200 : 404).json({
      success: true,
      message: report
        ? "General sales data retrieved successfully"
        : "shop sales not found",
      data: {
        analytics: analytics || {},
        sales: sales.sales || [],
        salesPerMonth: sales.salesPerMonth || [],
        totalSales: sales.totalSales || 0,
        totalProfit: sales.totalProfit || 0,
        totalCommission: sales.totalCommission || 0,
        totalfinanceSalesPending: sales.financeSales || 0,
        totalPages: sales.totalPages || 1,
        currentPage: sales.currentPage || 1,
      },
    });
  } catch (err) {
    if (err instanceof APIError) {
      res.status(err.statusCode).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

const getUserSales = async (req, res) => {
  try {
    const user = req.user;
    const page = parseInt(req.query.page) || 1;
    const date = req.query.date;
    const period = req.query.period || "year";
    const limit = parseInt(req.query.limit) || 10;
    const userId = parseInt(req.params.userId, 10);
    if (
      !checkRole(req.user.role, ["manager", "superuser"]) &&
      user.id !== userId
    ) {
      throw new APIError("not authorised", 403, "not allowed to view sales");
    }
    const [startDate, endDate] = getDateRange(period, date).map((m) =>
      m.toDate()
    );
    const report = await salesService.getUserSales({
      userId,
      startDate,
      endDate,
      page,
      limit,
    });
    // console.log("report", report);
    const { sales, analytics } = report;
    // console.log("#$usersales", analytics);
    const transformedSales = transformSales(sales);
    // console.log("##$%#%$^", transformedSales);
    handleResponse({
      res,
      message: "General sales data retrieved successfully",
      data: {
        analytics: analytics || {},
        sales: transformedSales || [],
        salesPerMonth: sales.salesPerMonth || [],
        totalSales: sales.totalSales || 0,
        totalProfit: sales.totalProfit || 0,
        totalCommission: sales.totalCommission || 0,
        totalfinancePending: sales.financeSales || 0,
        totalPages: sales.totalPages || 1,
        currentPage: sales.currentPage || 1,
        itemsPerPage: limit || 10,
      },
    });
  } catch (err) {
    if (err instanceof APIError) {
      res.status(err.statusCode).json({ message: err.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};
const payUsercommission = async (req, res) => {
  const { salesId, amount } = req.body;
  try {
    // const user = req.user;
    // if (user.role !== "manager") {
    //     throw new APIError("unauthorised", STATUS_CODE.UNAUTHORIZED, "not allowed to pay commission")
    // }
    const paycommission = await salesService.paymentofcommission(
      salesId,
      amount
    );
    return res
      .status(200)
      .json({ error: false, message: "successfully paid the commission" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "failed to pay commission" });
  }
};

const sendEmails = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const period = req.query.period;
    let startdate;
    let endDate;

    const getStartdate = (date) => {
      let start = new Date(date);
      start.setHours(0, 0, 0, 0);
      return start;
    };

    const getendDate = (date) => {
      let end = new Date(date);
      end.setHours(23, 59, 59, 999);
      return end;
    };

    if (req.query.date) {
      startdate = date ? getStartdate(date) : getStartdate(new Date());
      endDate = date ? getendDate(date) : getendDate(new Date());
    }
    const generalSales = await salesService.generategeneralsales({
      startdate: startdate,
      endDate: endDate,
      limit: limit,
      page: page,
    });

    res.status(200).json({ message: generalSales });
  } catch (err) {
    console.log("controller", err);
    if (err instanceof APIError) {
      res.status(err.statusCode).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

export {
  getCategorySales,
  getShopSales,
  getgeneralsales,
  getUserSales,
  payUsercommission,
  makesales,
};
