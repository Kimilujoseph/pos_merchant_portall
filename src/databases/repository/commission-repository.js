import { PrismaClient } from '@prisma/client';
import { APIError, STATUS_CODE } from '../../Utils/app-error.js';

const prisma = new PrismaClient();

class CommissionRepository {
  async findCommissionPayments({ page = 1, limit = 10, sellerId } = {}) {
    try {
      const skip = (page - 1) * limit;
      const whereClause = {};
      if (sellerId) {
        whereClause.sellerId = sellerId;
      }

      const [payments, total] = await prisma.$transaction([
        prisma.commissionPayment.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { paymentDate: 'desc' },
          include: {
            actors_CommissionPayment_sellerIdToactors: {
              select: { id: true, name: true, email: true },
            },
            actors_CommissionPayment_processedByIdToactors: {
              select: { id: true, name: true, email: true },
            },
          },
        }),
        prisma.commissionPayment.count({ where: whereClause }),
      ]);

      const formattedPayments = payments.map(p => {
        const { 
          actors_CommissionPayment_sellerIdToactors, 
          actors_CommissionPayment_processedByIdToactors, 
          ...rest 
        } = p;
        return {
          ...rest,
          seller: actors_CommissionPayment_sellerIdToactors,
          processedBy: actors_CommissionPayment_processedByIdToactors,
        };
      });

      return {
        payments: formattedPayments,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };
    } catch (err) {
      throw new APIError(
        'Database Error',
        STATUS_CODE.INTERNAL_ERROR,
        'Failed to retrieve commission payments'
      );
    }
  }

  async createCommissionPayment(paymentData, salesIds, tx) {
    const prismaClient = tx || prisma;
    try {
      const { sellerId, amountPaid, paymentDate, periodStartDate, periodEndDate, processedById } = paymentData;

      const commissionPayment = await prismaClient.commissionPayment.create({
        data: {
          sellerId,
          amountPaid,
          paymentDate,
          periodStartDate,
          periodEndDate,
          processedById,
        },
      });

      const mobileSalesLinks = salesIds
        .filter(sale => sale.type === 'mobile')
        .map(sale => ({
          mobileSaleId: sale.salesId,
          commissionPaymentId: commissionPayment.id,
          assignedBy: String(processedById),
        }));

      const accessorySalesLinks = salesIds
        .filter(sale => sale.type === 'accessory')
        .map(sale => ({
          accessorySaleId: sale.id,
          commissionPaymentId: commissionPayment.id,
          assignedBy: String(processedById),
        }));
      console.log('Mobile Sales Links:', mobileSalesLinks);
      console.log('Accessory Sales Links:', accessorySalesLinks);
      if (mobileSalesLinks.length > 0) {
        await prismaClient.commissionPaymentsOnMobileSales.createMany({
          data: mobileSalesLinks,
        });
      }

      if (accessorySalesLinks.length > 0) {
        await prismaClient.commissionPaymentsOnAccessorySales.createMany({
          data: accessorySalesLinks,
        });
      }

      return commissionPayment;
    } catch (err) {
      console.error('Error creating commission payment:', err);
      throw new APIError(
        'Database Error',
        STATUS_CODE.INTERNAL_ERROR,
        'Failed to create commission payment'
      );
    }
  }

  async findUnpaidCommissions(sellerId) {
    try {
      const unpaidMobileSales = await prisma.mobilesales.findMany({
        where: {
          sellerId: sellerId,
          commission: {
            gt: prisma.mobilesales.fields.commissionPaid,
          },
        },
      });

      const unpaidAccessorySales = await prisma.accessorysales.findMany({
        where: {
          sellerId: sellerId,
          commission: {
            gt: prisma.accessorysales.fields.commissionPaid,
          },
        },
      });

      return [...unpaidMobileSales, ...unpaidAccessorySales];
    } catch (err) {
      throw new APIError(
        'Database Error',
        STATUS_CODE.INTERNAL_ERROR,
        'Failed to find unpaid commissions'
      );
    }
  }

  async updateSaleCommissionStatus(saleId, type, amount, status, tx) {
    const prismaClient = tx || prisma;
    const salesTable = type === 'mobile' ? prismaClient.mobilesales : prismaClient.accessorysales;

    try {
      return await salesTable.update({
        where: { id: saleId },
        data: {
          commissionPaid: {
            increment: amount,
          },
          commisssionStatus: status,
        },
      });
    } catch (err) {
      throw new APIError(
        'Database Error',
        STATUS_CODE.INTERNAL_ERROR,
        `Failed to update commission status for ${type} sale ${saleId}`
      );
    }
  }
}

export { CommissionRepository };
