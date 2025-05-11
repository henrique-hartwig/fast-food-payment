import { z } from 'zod';
import { PaymentService } from '../../domain/service';

const ListPaymentsSchema = z.object({
  limit: z.number().int().positive(),
});

export type ListPaymentsRequest = z.infer<typeof ListPaymentsSchema>;

export class ListPaymentsController {
  constructor(private paymentService: PaymentService) {}

  async handle(request: ListPaymentsRequest) {
    try {
      const validatedData = ListPaymentsSchema.parse(request);
      const payments = await this.paymentService.listPayments(validatedData.limit) as any;

      if (payments?.error) {
        throw Error(payments.error);
      }

      return payments;
    } catch (error) {
      throw error;
    }
  }
}