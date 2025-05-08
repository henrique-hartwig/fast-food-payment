import { z } from 'zod';
import { PaymentService } from '../../domain/service';


const ListPaymentsSchema = z.object({
  limit: z.number().int().positive().optional(),
  offset: z.number().int().positive().optional()
});

export type ListPaymentsRequest = z.infer<typeof ListPaymentsSchema>;

export class ListPaymentsController {
  constructor(private paymentService: PaymentService) {}

  async handle(request: ListPaymentsRequest) {
    try {
      const validatedData = ListPaymentsSchema.parse(request);
      const payments = await this.paymentService.listPayments(validatedData.limit ?? 10);

      return {
        statusCode: 200,
        body: {
          message: 'Payments retrieved successfully',
          data: payments,
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          statusCode: 400,
          body: {
            message: 'Validation error',
            details: error.errors,
          },
        };
      }
      
      return {
        statusCode: 500,
        body: {
          message: 'Internal server error',
          details: error,
        },
      };
    }
  }
}