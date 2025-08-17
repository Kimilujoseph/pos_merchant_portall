import { PrismaClient } from '@prisma/client';
import { CommissionRepository } from '../databases/repository/commission-repository.js';
import { usermanagemenRepository } from '../databases/repository/usermanagement-controller-repository.js';
import { Sales } from '../databases/repository/sales-repository.js';
import { APIError, STATUS_CODE } from '../Utils/app-error.js';

const prisma = new PrismaClient();

class CommissionService {
  constructor() {
    this.repository = new CommissionRepository();
    this.userRepository = new usermanagemenRepository();
    this.salesRepository = new Sales();
  }

  async createCommissionPayment(paymentData) {
    const { sellerId, processedById, amountPaid, salesIds } = paymentData;


    const [seller, processor] = await Promise.all([
      this.userRepository.findUserById({ id: sellerId }),
      this.userRepository.findUserById({ id: processedById }),
    ]);

    if (!seller) {
      throw new APIError('Not Found', STATUS_CODE.NOT_FOUND, 'Seller not found.');
    }
    if (!processor) {
      throw new APIError('Not Found', STATUS_CODE.NOT_FOUND, 'Processing user not found.');
    }

    const mobileSaleIds = salesIds.filter(s => s.type === 'mobile').map(s => s.salesId);
    const accessorySaleIds = salesIds.filter(s => s.type === 'accessory').map(s => s.salesId);

    const [mobileSales, accessorySales] = await Promise.all([
      mobileSaleIds.length > 0 ? prisma.mobilesales.findMany({ where: { id: { in: mobileSaleIds } } }) : [],
      accessorySaleIds.length > 0 ? prisma.accessorysales.findMany({ where: { id: { in: accessorySaleIds } } }) : [],
    ]);

    const allSales = [...mobileSales, ...accessorySales];


    let totalCommissionOwed = 0;
    for (const sale of allSales) {
      if (sale.sellerId !== sellerId) {
        throw new APIError('Bad Request', STATUS_CODE.BAD_REQUEST, `Sale ${sale.id} does not belong to seller ${sellerId}.`);
      }

      const unpaidCommission = sale.commission - sale.commissionPaid;
      totalCommissionOwed += unpaidCommission;
    }

    if (amountPaid > totalCommissionOwed) {
      throw new APIError('Bad Request', STATUS_CODE.BAD_REQUEST, `Amount paid (${amountPaid}) exceeds the total unpaid commission of (${totalCommissionOwed}).`);
    }


    return prisma.$transaction(async (tx) => {

      const commissionPayment = await this.repository.createCommissionPayment(paymentData, salesIds, tx);


      let remainingAmountToDistribute = amountPaid;
      for (const sale of allSales) {
        if (remainingAmountToDistribute <= 0) break;

        const unpaidCommission = sale.commission - sale.commissionPaid;
        const amountToApply = Math.min(remainingAmountToDistribute, unpaidCommission);

        const newCommissionPaid = sale.commissionPaid + amountToApply;
        const newStatus = newCommissionPaid >= sale.commission ? 'paid' : 'pending';

        const saleType = mobileSaleIds.includes(sale.id) ? 'mobile' : 'accessory';
        await this.repository.updateSaleCommissionStatus(sale.id, saleType, amountToApply, newStatus, tx);

        remainingAmountToDistribute -= amountToApply;
      }

      return commissionPayment;
    });
  }

  async getCommissionPayments(options) {
    try {
      return await this.repository.findCommissionPayments(options);
    } catch (err) {
      throw new APIError(
        'Service Error',
        STATUS_CODE.INTERNAL_ERROR,
        'Failed to get commission payments'
      );
    }
  }
}

export { CommissionService };
