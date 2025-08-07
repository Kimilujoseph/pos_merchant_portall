import { getDateRange } from '../helpers/dateUtils.js';
import { APIError } from '../Utils/app-error.js';

const parseSalesQuery = (req, res, next) => {
  try {
    const { page, limit, date, period } = req.query;

    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);

    req.salesQuery = {
      page: !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1,
      limit: !isNaN(parsedLimit) && parsedLimit > 0 ? Math.min(100, parsedLimit) : 10,
      period: date ? 'day' : period || 'year',
    };

    const [startDate, endDate] = getDateRange(req.salesQuery.period, date).map((m) => m.toDate());
    req.salesQuery.startDate = startDate;
    req.salesQuery.endDate = endDate;

    next();
  } catch (error) {
    // Forwarding the error to the global error handler
    next(new APIError("Invalid query parameters.", 400, "The query parameters provided are invalid."));
  }
};

export { parseSalesQuery };
