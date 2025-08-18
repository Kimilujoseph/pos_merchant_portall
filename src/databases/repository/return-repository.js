import { PrismaClient } from '@prisma/client';
import { APIError, STATUS_CODE } from '../../Utils/app-error.js';

import prisma from "../../databases/client.js"

class ReturnRepository {
  async createReturn(returnData) {
    const {
      saleId,
      saleType,
      reason,
      refundAmount,
      restock,
      processedById,
      customerId,
      quantity, // The quantity of items being returned
    } = returnData;

    return prisma.$transaction(async (tx) => {
      const saleModel = saleType === 'mobile' ? tx.mobilesales : tx.accessorysales;
      const itemModel = saleType === 'mobile' ? tx.mobileItems : tx.accessoryItems;
      const productModel = saleType === 'mobile' ? tx.mobiles : tx.accessories;


      const originalSale = await saleModel.findUnique({
        where: { id: saleId },
      });

      if (!originalSale) {
        throw new APIError('Not Found', STATUS_CODE.NOT_FOUND, `Original ${saleType} sale with ID ${saleId} not found.`);
      }
      if (originalSale.status === 'RETURNED') {
        throw new APIError('Bad Request', STATUS_CODE.BAD_REQUEST, 'This sale has already been fully returned.');
      }
      if (!quantity || quantity <= 0) {
        throw new APIError('Bad Request', STATUS_CODE.BAD_REQUEST, 'Return quantity must be greater than zero.');
      }
      if (quantity > originalSale.quantity) {
        throw new APIError('Bad Request', STATUS_CODE.BAD_REQUEST, `Cannot return ${quantity} items. Only ${originalSale.quantity} available to return.`);
      }


      const returnRecord = await tx.return.create({
        data: {
          reason,
          refundAmount,
          restock,
          processedBy: processedById,
          customerId,
          ...(saleType === 'mobile' ? { mobileSaleId: saleId } : { accessorySaleId: saleId }),
        },
      })
      const originalQuantity = Number(originalSale.quantity);
      const pricePerUnit = Number(originalSale.soldPrice) / originalQuantity;
      const profitPerUnit = Number(originalSale.profit) / originalQuantity;
      const commissionPerUnit = Number(originalSale.commission) / originalQuantity;
      const financeAmountPerUnit = Number(originalSale.financeAmount) / originalQuantity;

      const revenueToReverse = pricePerUnit * quantity;
      const profitToReverse = profitPerUnit * quantity;
      const commissionToReverse = commissionPerUnit * quantity;
      const financeAmountToReverse = financeAmountPerUnit * quantity;


      const newSaleQuantity = originalQuantity - quantity;
      await saleModel.update({
        where: { id: saleId },
        data: {
          quantity: newSaleQuantity,
          status: newSaleQuantity > 0 ? 'PARTIALLY_RETURNED' : 'RETURNED',
          soldPrice: { decrement: revenueToReverse },
          profit: { decrement: profitToReverse },
          commissionPaid: { decrement: commissionToReverse },
          financeAmount: { decrement: financeAmountToReverse },
        },
      });


      if (restock) {
        if (saleType === 'mobile') {

          const soldItem = await tx.mobileItems.findFirst({
            where: { mobileID: originalSale.productID, shopID: originalSale.shopID, status: 'sold' },
          });
          if (soldItem) {
            await tx.mobileItems.update({ where: { id: soldItem.id }, data: { status: 'available' } });
          }
          await productModel.update({ where: { id: originalSale.productID }, data: { availableStock: { increment: 1 } } });
        } else if (saleType === 'accessory') {
          await tx.accessoryItems.updateMany({
            where: { accessoryID: originalSale.productID, shopID: originalSale.shopID },
            data: { quantity: { increment: quantity } },
          });
          await productModel.update({ where: { id: originalSale.productID }, data: { availableStock: { increment: quantity } } });
        }
      }


      const productDetails = await productModel.findUnique({ where: { id: originalSale.productID } });
      const costPerUnit = Number(productDetails.productCost);
      const costToReverse = costPerUnit * quantity;
      const returnDate = new Date();
      returnDate.setHours(0, 0, 0, 0);

      await tx.dailySalesAnalytics.create({
        data: {
          date: returnDate,
          productId: originalSale.productID,
          categoryId: originalSale.categoryId,
          shopId: originalSale.shopID,
          sellerId: originalSale.sellerId,
          financeId: originalSale.financerId,
          financeStatus: `RETURNED: ${originalSale.financeStatus}`,
          totalUnitsSold: -quantity,
          totalRevenue: -revenueToReverse,
          totalCostOfGoods: -costToReverse,
          grossProfit: -profitToReverse,
          totalCommission: -commissionToReverse,
          totalfinanceAmount: -financeAmountToReverse,
        },
      });

      return returnRecord;
    });
  }
}

export { ReturnRepository };