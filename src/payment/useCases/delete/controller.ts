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
      );

      return {
        statusCode: 201,
        body: {
          message: 'Payment deleted successfully',
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