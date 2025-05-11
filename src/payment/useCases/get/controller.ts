import { z } from 'zod';
import { PaymentService } from '../../domain/service';

const GetPaymentSchema = z.object({
  id: z.number().int().positive()
});

export type GetPaymentRequest = z.infer<typeof GetPaymentSchema>;

export class GetPaymentController {
  constructor(private paymentService: PaymentService) {}

  async handle(request: GetPaymentRequest) {
    try {
      const validatedData = GetPaymentSchema.parse(request);

      const payment = await this.paymentService.getPaymentById(
        validatedData.id
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