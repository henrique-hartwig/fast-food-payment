import { z } from 'zod';
import { PaymentService } from '../../domain/service';
import { PaymentMethod } from '../../domain/entity';

const CreatePaymentSchema = z.object({
  orderId: z.number().int().positive(),
  paymentMethod: z.enum(['credit_card', 'debit_card', 'pix', 'billet']),
  amount: z.number().positive(),
});

export type CreatePaymentRequest = z.infer<typeof CreatePaymentSchema>;

export class CreatePaymentController {
  constructor(private paymentService: PaymentService) {}

  async handle(request: CreatePaymentRequest) {
    try {
      const validatedData = CreatePaymentSchema.parse(request);

      const payment = await this.paymentService.createPayment(
        validatedData.orderId,
        validatedData.paymentMethod as PaymentMethod,
        validatedData.amount,
      ) as any;

      if (payment?.error) {
        throw Error(payment.error);
      }

      return payment;
    } catch (error) {
      throw error;
    }
  }
}