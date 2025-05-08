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
      );

      return {
        statusCode: 200,
        body: {
          message: 'Payment retrieved successfully',
          data: payment,
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