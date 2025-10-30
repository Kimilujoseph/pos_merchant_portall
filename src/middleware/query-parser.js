import { getDateRange } from '../helpers/dateUtils.js';
import { APIError } from '../Utils/app-error.js';

const parseSalesQuery = (req, res, next) => {
  try {
    const { page, limit, date, period, startDate: queryStartDate, endDate: queryEndDate } = req.query;

    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);

    req.salesQuery = {
      page: !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1,
      limit: !isNaN(parsedLimit) && parsedLimit > 0 ? Math.min(100, parsedLimit) : 10,
    };

    if (queryStartDate && queryEndDate) {
      console.log("queryStartDate", queryStartDate)
      req.salesQuery.startDate = new Date(queryStartDate);
      req.salesQuery.endDate = new Date(queryEndDate);
    } else {
      req.salesQuery.period = date ? 'day' : period;
      const [startDate, endDate] = getDateRange(req.salesQuery.period, date).map((m) => m.toDate());
      console.log("startdate", endDate)
      req.salesQuery.startDate = startDate;
      req.salesQuery.endDate = endDate;
    }

    next();
  } catch (error) {
    // Forwarding the error to the global error handler
    next(new APIError("Invalid query parameters.", 400, "The query parameters provided are invalid."));
  }
};

export { parseSalesQuery };
