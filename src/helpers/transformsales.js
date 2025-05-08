const transformSales = (rawSale) => {
  // Base transformation
  const base = {
    soldprice: Number(rawSale.soldPrice),
    netprofit: rawSale.profit,
    commission: rawSale.commission,
    IMEI: rawSale.mobiles?.IMEI || 0,
    productcost: Number(
      rawSale.mobiles?.productCost || rawSale.accessories?.productCost || 0
    ),
    productmodel: rawSale.categories?.itemModel || "N/A",
    productname: rawSale.categories?.itemName || "Unknown",
    totalnetprice: Number(rawSale.soldPrice),
    totalsoldunits: rawSale.quantity || 1,
    totaltransaction: 1,
    _id: {
      productId: rawSale.productID || null,
      sellerId: rawSale.sellerId || null,
      shopId: rawSale.shopID || null,
    },
    financeDetails: {
      financeStatus: rawSale.financeStatus || "N/A",
      financeAmount: Number(rawSale.financeAmount) || 0,
      financer: rawSale.financer || "",
    },
    CategoryId: rawSale.categoryId || null,
    createdAt: rawSale.createdAt?.toISOString() || new Date().toISOString(),
    batchNumber:
      rawSale.mobiles?.batchNumber || rawSale.accessories?.batchNumber || "N/A",
    category: rawSale.categories?.itemType?.toLowerCase() || "Uncategorized",
    sellername: rawSale.actors?.name || "Unknown Seller",
    shopname: rawSale.shops?.shopName || "Unknown Shop",
  };

  // Add mobile-specific fields if available
  if (rawSale.mobiles) {
    base.productmodel = rawSale.mobiles.phoneType || base.productmodel;
    base.category = "mobiles";
  }

  // Add accessory-specific fields if available
  if (rawSale.accessories) {
    base.category = "accessories";
  }

  return base;
};

export { transformSales };
