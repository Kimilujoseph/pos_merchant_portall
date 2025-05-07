import { APIError, STATUS_CODE } from "../Utils/app-error.js";
const analyseSalesMetric = (salesData) => {
  try {
    const productMetric = {};
    const sellerMetric = {};

    // Iterate through the sales dat
    salesData.forEach((sale) => {
      const {
        soldprice,
        totalprofit,
        totaltransaction,
        productDetails,
        categoryDetails,
        sellerDetails,
        financeStatus,
        productName,
        sellerName,
        _id,
      } = sale;
      //did some twisting so we can have transcation counted in terms of category
      const productId = productName;
      const sellerId = _id.sellerId;
      const itemName = productName;
      const sellerNameFound = sellerName;

      if (financeStatus === "pending") return;

      // Update product metrics
      if (!productMetric[productId]) {
        productMetric[productId] = {
          productName: itemName,
          totalSales: 0,
          totaltransacted: 0,
          netprofit: 0,
        };
      }

      productMetric[productId].totalSales += soldprice;
      productMetric[productId].totaltransacted += totaltransaction;
      productMetric[productId].netprofit += totalprofit;

      if (!sellerMetric[sellerId]) {
        sellerMetric[sellerId] = {
          sellerName: sellerNameFound,
          totalSales: 0,
          netprofit: 0,
          totaltransacted: 0,
        };
      }

      sellerMetric[sellerId].totalSales += Number(soldprice);
      sellerMetric[sellerId].netprofit += totalprofit;
      sellerMetric[sellerId].totaltransacted += totaltransaction;
    });

    // Sort and get top 5 products
    const productAnalytics = Object.values(productMetric)
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 10);

    // Get total number of products
    const totalProducts = Object.keys(productMetric).length;

    // Sort and get top 5 sellers
    const sellerAnalytics = Object.values(sellerMetric)
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 10);

    // Get total number of sellers
    const totalSellers = Object.keys(sellerMetric).length;

    return { sellerAnalytics, productAnalytics, totalProducts, totalSellers };
  } catch (err) {
    if (err instanceof APIError) {
      throw err;
    }
    throw new APIError(
      "internal error",
      STATUS_CODE.INTERNAL_ERROR,
      err.message || "internal server error"
    );
  }
};

export { analyseSalesMetric };
