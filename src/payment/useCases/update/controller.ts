import { z } from 'zod';
import { PaymentService } from '../../domain/service';
import { PaymentStatus } from '../../domain/entity';


const UpdatePaymentSchema = z.object({
  id: z.number().int().positive(),
  status: z.nativeEnum(PaymentStatus),
});

export type UpdatePaymentRequest = z.infer<typeof UpdatePaymentSchema>;

export class UpdatePaymentController {
  constructor(private paymentService: PaymentService) {}

  async handle(request: UpdatePaymentRequest) {
    try {
      const validatedData = UpdatePaymentSchema.parse(request);

      const payment = await this.paymentService.updatePayment(
        validatedData.id,
        validatedData.status,
      );

      return {
        statusCode: 200,
        body: {
          message: 'Payment updated successfully',
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