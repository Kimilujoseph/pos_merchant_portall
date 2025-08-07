import paymentRepository from '../databases/repository/payment-repository.js';
import { APIError, STATUS_CODE } from "../Utils/app-error.js"
class PaymentService {
  async createPayment(paymentData) {
    if (!paymentData || !paymentData.amount || !paymentData.customerId) {
      throw new APIError("Invalid payment data", STATUS_CODE.BAD_REQUEST, "Payment amount and customer ID are required.");
    }
    return await paymentRepository.createPayment(paymentData);
  }

  async getPaymentsForCustomer(customerId) {
    return await paymentRepository.findPaymentsByCustomerId(customerId);
  }

  async updatePaymentStatus(paymentId, status) {
    if (!paymentId || !status) {
      throw new APIError("Invalid data", STATUS_CODE.BAD_REQUEST, "Payment ID and status are required.");
    }
    return await paymentRepository.updatePaymentStatus(paymentId, status);
  }
}

export default new PaymentService();
