const transformSales = (salesArray) => {
  if (!Array.isArray(salesArray.sales)) {
    console.warn("Invalid sales data passed to transformSales");
    return [];
  }
  //console.log("sales found", salesArray.sales);
  return salesArray.sales.map((sale) => ({
    soldprice: sale.soldprice,
    netprofit: sale.totalprofit,
    commission: sale.commission,
    productcost: sale.productDetails?.productCost || 0, // Added safe navigation
    productmodel: sale.categoryDetails?.itemModel || "N/A",
    productname: sale.categoryDetails?.itemName || "Unknown",
    totalnetprice: sale.soldprice,
    totalsoldunits: sale.totaltransaction,
    totaltransaction: sale.totaltransaction,
    _id: {
      productId: sale.productDetails?.productID || null,
      sellerId: sale.sellerDetails?.id || null,
      shopId: sale.shopDetails?.id || null,
    },
    financeDetails: sale.financeDetails || {},
    CategoryId: sale.categoryDetails?.categoryId || null,
    createdAt: sale.createdAt || new Date().toISOString(),
    batchNumber: sale.productDetails?.batchNumber || "N/A",
    category: sale.productDetails?.productType || "Uncategorized",
    sellername: sale.sellerDetails?.name || "Unknown Seller",
    shopname: sale.shopDetails?.name || "Unknown Shop",
  }));
};

export { transformSales };
