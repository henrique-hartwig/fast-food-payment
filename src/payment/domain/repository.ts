import { Payment } from './entity';

export interface PaymentRepository {
  create(payment: Payment): Promise<Payment>;
  findById(id: number): Promise<Payment | null>;
  findByOrderId(orderId: number): Promise<Payment | null>;
  list(limit: number): Promise<Payment[]>;
  update(payment: Payment): Promise<Payment>;
  delete(id: number): Promise<boolean>;
}

