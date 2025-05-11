import { z } from 'zod';
import { PaymentService } from '../../domain/service';


const DeletePaymentSchema = z.object({
  id: z.number().int().positive()
});

export type DeletePaymentRequest = z.infer<typeof DeletePaymentSchema>;

export class DeletePaymentController {
  constructor(private paymentService: PaymentService) {}

  async handle(request: DeletePaymentRequest) {
    try {
      const validatedData = DeletePaymentSchema.parse(request);

      const payment = await this.paymentService.deletePayment(
        validatedData.id
      ) as any;

      if (payment?.error) {
        throw Error(payment.error);
      }

      return payment;
    } catch (error: any) {
      throw error;
    }
  }
}