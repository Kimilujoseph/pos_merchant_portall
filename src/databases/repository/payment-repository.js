import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class PaymentRepository {
  async createPayment(paymentData) {
    return await prisma.payment.create({
      data: paymentData,
    });
  }

  async findPaymentsByCustomerId(customerId) {
    return await prisma.payment.findMany({
      where: { customerId },
    });
  }

  async updatePaymentStatus(paymentId, status) {
    return await prisma.payment.update({
      where: { id: paymentId },
      data: { paymentStatus: status },
    });
  }
}

export default new PaymentRepository();
