import { parse } from "dotenv";
import { salesmanagment } from "../../services/sales-services.js";
import { transformSales } from "../../helpers/transformsales.js";
import { getDateRange } from "../../helpers/dateUtils.js";
import { checkRole } from "../../helpers/authorisation.js";
import { handleError, handleResponse } from "../../helpers/responseUtils.js";
import { APIError, STATUS_CODE } from "../../Utils/app-error.js";
import moment from "moment";
const salesService = new salesmanagment();

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

    // console.log("##$%#%$^", transformedSales);
    handleResponse({
      res,
      message: "General sales data retrieved successfully",
      data: {
        analytics: analytics || {},
        sales: sales || [],
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
    if (
      !checkRole(req.user.role, ["manager", "superuser"]) &&
      user.id !== req.user.id
    ) {
      throw new APIError("not authorised", 403, "not allowed to view sales");
    }

    const [startDate, endDate] = getDateRange(period, date).map((m) =>
      m.toDate()
    );
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

export { getCategorySales, getShopSales, getgeneralsales, getUserSales };
