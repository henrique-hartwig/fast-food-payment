import { GetPaymentController } from '../../../../../src/payment/useCases/get/controller';
import { PaymentService } from '../../../../../src/payment/domain/service';

describe('GetPaymentController', () => {
  let controller: GetPaymentController;
  let service: jest.Mocked<PaymentService>;

  beforeEach(() => {
    service = {
      getPaymentById: jest.fn(),
    } as any;
    controller = new GetPaymentController(service);
  });

  it('should get the payment', async () => {
    const request = { id: 1 };
    service.getPaymentById.mockResolvedValue({ id: 1 } as any);

    const result = await controller.handle(request as any);

    expect(result).toEqual({ id: 1 } as any);
    expect(service.getPaymentById).toHaveBeenCalledWith(1);
  });

  it('should throw validation error', async () => {
    const request = { id: null };

    await expect(controller.handle(request as any)).rejects.toThrow();
  });

  it('should throw error if the service returns an error', async () => {
    const request = { id: 1 };
    service.getPaymentById.mockResolvedValue({ error: 'Service error' } as any);

    await expect(controller.handle(request as any)).rejects.toThrow('Service error');
  });

  it('should throw unexpected error', async () => {
    const request = { id: 1 };
    service.getPaymentById.mockRejectedValue(new Error('Unexpected error'));

    await expect(controller.handle(request as any)).rejects.toThrow('Unexpected error');
  });
});
