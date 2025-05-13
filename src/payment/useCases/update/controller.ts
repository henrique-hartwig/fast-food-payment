import { z } from 'zod';
import { PaymentService } from '../../domain/service';
import { PaymentMethod, PaymentStatus } from '../../domain/entity';


const UpdatePaymentSchema = z.object({
  id: z.number().int().positive(),
  paymentData: z.object({
    status: z.nativeEnum(PaymentStatus),
    amount: z.number().int().positive(),
    paymentMethod: z.nativeEnum(PaymentMethod),
  }),
});

export type UpdatePaymentRequest = z.infer<typeof UpdatePaymentSchema>;

export class UpdatePaymentController {
  constructor(private paymentService: PaymentService) {}

  async handle(request: UpdatePaymentRequest) {
    try {
      const validatedData = UpdatePaymentSchema.parse(request);

      const payment = await this.paymentService.updatePayment(
        validatedData.id,
        {
          status: validatedData.paymentData.status,
          amount: validatedData.paymentData.amount,
          paymentMethod: validatedData.paymentData.paymentMethod,
        }
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