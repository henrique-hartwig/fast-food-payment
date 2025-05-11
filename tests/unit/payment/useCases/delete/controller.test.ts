import { DeletePaymentController } from '../../../../../src/payment/useCases/delete/controller';
import { PaymentService } from '../../../../../src/payment/domain/service';

describe('DeletePaymentController', () => {
  let controller: DeletePaymentController;
  let service: jest.Mocked<PaymentService>;

  beforeEach(() => {
    service = {
      deletePayment: jest.fn(),
    } as any;
    controller = new DeletePaymentController(service);
  });

  it('should delete the payment', async () => {
    const request = { id: 1 };
    service.deletePayment.mockResolvedValue({ id: 1 } as any);

    const result = await controller.handle(request as any);

    expect(result).toEqual({ id: 1 } as any);
    expect(service.deletePayment).toHaveBeenCalledWith(1);
  });

  it('should throw validation error', async () => {
    const request = { };

    await expect(controller.handle(request as any)).rejects.toThrow();
  });

  it('should throw error if the service returns an error', async () => {
    const request = { id: 1 };
    service.deletePayment.mockResolvedValue({ error: 'Service error' } as any);

    await expect(controller.handle(request as any)).rejects.toThrow('Service error');
  });

  it('should throw unexpected error', async () => {
    const request = { id: 1 };
    service.deletePayment.mockRejectedValue(new Error('Unexpected error'));

    await expect(controller.handle(request as any)).rejects.toThrow('Unexpected error');
  });
});
