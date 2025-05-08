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

  async getPaymentByOrderId(orderId: number): Promise<Payment | null> {
    return this.payment.findByOrderId(orderId);
  }

  async updatePayment(id: number, status: PaymentStatus): Promise<Payment> {
    const payment = await this.payment.findByOrderId(id);
    if (!payment) {
      throw new Error('Payment not found');
    }
    payment.status = status;
    return this.payment.update(payment);
  }

  async updatePaymentStatus(id: number, status: PaymentStatus): Promise<Payment> {
    const payment = await this.payment.findByOrderId(id);
    if (!payment) {
      throw new Error('Payment not found');
    }
    payment.status = status;
    return this.payment.update(payment);
  }

  async deletePayment(id: number): Promise<boolean> {
    return this.payment.delete(id);
  }

  async listPayments(limit: number): Promise<Payment[]> {
    return this.payment.list(limit);
  }
}
