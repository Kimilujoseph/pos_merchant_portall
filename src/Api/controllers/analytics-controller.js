import { AnalyticsService } from '../../services/analytics-service.js';
import { checkRole } from '../../helpers/authorisation.js';
import { handleResponse } from '../../helpers/responseUtils.js';
import { APIError, STATUS_CODE } from '../../Utils/app-error.js';

const analyticsService = new AnalyticsService();

const getTopProducts = async (req, res, next) => {
    try {
        if (!checkRole(req.user.role, ['manager', 'superuser'])) {
            throw new APIError("Not authorized", STATUS_CODE.UNAUTHORIZED, "You are not authorized to view analytics.");
        }

        const { metric, limit, startDate, endDate } = req.query;
        const data = await analyticsService.getTopProductsAnalytics({ metric, limit, startDate, endDate });

        handleResponse({
            res,
            message: "Top products analytics retrieved successfully",
            data,
        });
    } catch (err) {
        next(err);
    }
};

const getShopPerformanceSummary = async (req, res, next) => {
    try {
        if (!checkRole(req.user.role, ['manager', 'superuser'])) {
            throw new APIError("Not authorized", STATUS_CODE.UNAUTHORIZED, "You are not authorized to view analytics.");
        }

        const { startDate, endDate } = req.query;
        const data = await analyticsService.getShopPerformanceSummary({ startDate, endDate });

        handleResponse({
            res,
            message: "Shop performance summary retrieved successfully",
            data,
        });
    } catch (err) {
        next(err);
    }
};

const getSalesByStatus = async (req, res, next) => {
    try {
        if (!checkRole(req.user.role, ['manager', 'superuser'])) {
            throw new APIError("Not authorized", STATUS_CODE.UNAUTHORIZED, "You are not authorized to view analytics.");
        }

        const { startDate, endDate, status } = req.query;
        const data = await analyticsService.getSalesByStatus({ startDate, endDate, status });

        handleResponse({
            res,
            message: "Sales by status summary retrieved successfully",
            data,
        });
    } catch (err) {
        next(err);
    }
};

export { getTopProducts, getShopPerformanceSummary, getSalesByStatus };
