import { Payment, PaymentMethod, PaymentStatus } from './entity';
import { PaymentRepository } from './repository';

export class PaymentService {
  constructor(private payment: PaymentRepository) {}

  async createPayment(orderId: number, paymentMethod: PaymentMethod, amount: number): Promise<Payment> {
    const payment = new Payment(Date.now(), orderId, PaymentStatus.PENDING, paymentMethod, amount);
    return this.payment.create(payment);
  }

  async getPaymentById(id: number): Promise<Payment | null> {
    return this.payment.findById(id);
  }

  async updatePayment(id: number, paymentData: Partial<Payment>): Promise<Payment> {
    const payment = await this.payment.findById(id);
    if (!payment) {
      throw new Error('Payment not found');
    }
    if (paymentData.amount) payment.amount = paymentData.amount;
    if (paymentData.paymentMethod) payment.paymentMethod = paymentData.paymentMethod;
    if (paymentData.status) payment.status = paymentData.status;
    return this.payment.update(payment);
  }

  async deletePayment(id: number): Promise<boolean> {
    return this.payment.delete(id);
  }

  async listPayments(limit: number): Promise<Payment[]> {
    return this.payment.list(limit);
  }
}
