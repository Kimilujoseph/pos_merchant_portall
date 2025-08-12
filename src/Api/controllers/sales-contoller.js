import { salesmanagment } from "../../services/sales-services.js";
import { checkRole } from "../../helpers/authorisation.js";
import { handleError, handleResponse } from "../../helpers/responseUtils.js";
import { APIError, STATUS_CODE } from "../../Utils/app-error.js";

const salesService = new salesmanagment();

const handleGetSales = async (req, res, next) => {
  try {
    const { user, salesQuery } = req;
    const { shopId, categoryId, userId } = req.params;

    let serviceMethod;
    const servicePayload = { ...salesQuery };

    if (shopId) {
      if (!checkRole(user.role, ["manager", "superuser"])) {
        throw new APIError("Not authorized", STATUS_CODE.UNAUTHORIZED, "You are not authorized to view shop sales.");
      }
      serviceMethod = 'generateShopSales';
      servicePayload.shopId = parseInt(shopId, 10);
    } else if (categoryId) {
      if (!checkRole(user.role, ["manager", "superuser"])) {
        throw new APIError("Not authorized", STATUS_CODE.UNAUTHORIZED, "You are not authorized to view category sales.");
      }
      serviceMethod = 'generateCategorySales';
      servicePayload.categoryId = parseInt(categoryId, 10);
    } else if (userId) {
      const parsedUserId = parseInt(userId, 10);
      if (!checkRole(user.role, ["manager", "superuser"]) && user.id !== parsedUserId) {
        throw new APIError("Not authorized", STATUS_CODE.UNAUTHORIZED, "You are not authorized to view this user's sales.");
      }
      serviceMethod = 'getUserSales';
      servicePayload.userId = parsedUserId;
    } else {
      if (!checkRole(user.role, ["manager", "superuser"])) {
        throw new APIError("Not authorized", STATUS_CODE.UNAUTHORIZED, "You are not authorized to view general sales.");
      }
      serviceMethod = 'generategeneralsales';
    }

    const report = await salesService[serviceMethod](servicePayload);

    if (!report || (Array.isArray(report) && report.length === 0)) {
      throw new APIError("No sales found", STATUS_CODE.NOT_FOUND, "No sales found for the given criteria.");
    }

    const finalReport = Array.isArray(report) ? report[0] : report;
    const { sales, analytics } = finalReport;

    handleResponse({
      res,
      message: "Sales data retrieved successfully",
      data: {
        analytics: analytics || {},
        sales: sales?.sales || [],
        salesPerMonth: sales?.salesPerMonth || [],
        totalSales: sales?.totalSales || 0,
        totalProfit: sales?.totalProfit || 0,
        totalCommission: sales?.totalCommission || 0,
        totalfinancePending: sales?.financeSales || 0,
        totalPages: sales?.totalPages || 1,
        currentPage: sales?.currentPage || 1,
        itemsPerPage: salesQuery.limit,
      },
    });
  } catch (err) {
    next(err); // Pass errors to the global error handler
  }
};

const handleBulkSale = async (req, res, next) => {
  try {
    const { user } = req;
    const { ...salePayload } = req.body;
    const results = await salesService.createBulkSale(salePayload, user);

    const rejectedSales = results.filter(r => r.status === 'rejected');
    const fulfilledSales = results.filter(r => r.status !== 'rejected');

    if (rejectedSales.length > 0) {
      // If some sales failed, return 400 Bad Request with details
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        message: "Some sales could not be processed.",
        error: true,
        details: rejectedSales.map(r => r.reason),
        successfulSales: fulfilledSales.map(r => r.value),
      });
    } else {
      // All sales processed successfully
      handleResponse({
        res,
        message: "Bulk sale processed successfully",
        data: results.map(r => r.value),
      });
    }
  } catch (err) {
    next(err);
  }
};

export { handleGetSales, handleBulkSale };