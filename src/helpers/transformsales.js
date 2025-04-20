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
    productcost: Number(sale.productDetails?.productCost) || 0,
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

const transformgeneralSale = (sale) => {
  //console.log("sales#$##$", sale);
  const financeStatus = sale.financeDetails.financeStatus;
  const isFinance = financeStatus !== "N/A";
  return {
    soldprice: Number(sale._sum.soldPrice),
    commission: sale._sum.commission,
    totalprofit: sale._sum.profit,
    totaltransaction: sale._count._all,
    productDetails: normalizedProduct(sale.productDetails),
    categoryDetails: normalizedCategoryDetails(sale.categoryDetails),
    shopDetails: normalizedShopDetails(sale.shopDetails),
    sellerDetails: {
      name: sale.sellerDetails?.name,
      id: sale.sellerDetails?.id,
    },
    saleType: isFinance ? "finance" : "direct",
    financeDetails: sale.financeDetails,
    createdAt: sale.createdAt,
    financeStatus: sale.financeStatus,
  };
};
const normalizedProduct = (details) => {
  return {
    productID: details?.id,
    batchNumber: details?.batchNumber,
    productCost: details?.productCost,
    productType: details?.itemType || details?.productType || "mobiles",
  };
};
const normalizedCategoryDetails = (details) => {
  return {
    categoryId: details?.id,
    category: details?.itemType || "accessory",
    itemName: details?.itemName,
    itemModel: details?.itemModel,
    brand: details?.brand,
  };
};
const normalizedShopDetails = (details) => {
  return details
    ? {
        id: details.id,
        name: details.shopName,
        address: details.address,
      }
    : null;
};
const normalizedSellerDetails = (details) => {
  return details
    ? {
        id: details.id,
        name: details.sellerName,
      }
    : null;
};

export { transformSales, transformgeneralSale };
