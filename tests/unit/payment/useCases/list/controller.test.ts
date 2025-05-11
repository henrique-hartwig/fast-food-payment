import { ListPaymentsController } from '../../../../../src/payment/useCases/list/controller';
import { PaymentService } from '../../../../../src/payment/domain/service';

describe('ListPaymentsController', () => {
  let controller: ListPaymentsController;
  let service: jest.Mocked<PaymentService>;

  beforeEach(() => {
    service = {
      listPayments: jest.fn(),
    } as any;
    controller = new ListPaymentsController(service);
  });

  it('should list the payments', async () => {
    const request = { limit: 10 };
    service.listPayments.mockResolvedValue({ id: 1 } as any);

    const result = await controller.handle(request as any);

    expect(result).toEqual({ id: 1 } as any);
    expect(service.listPayments).toHaveBeenCalledWith(10);
  });

  it('should throw validation error', async () => {
    const request = { };

    await expect(controller.handle(request as any)).rejects.toThrow();
  });

  it('should throw error if the service returns an error', async () => {
    const request = { limit: 10 };
    service.listPayments.mockResolvedValue({ error: 'Service error' } as any);

    await expect(controller.handle(request as any)).rejects.toThrow('Service error');
  });

  it('should throw unexpected error', async () => {
    const request = { limit: 10 };
    service.listPayments.mockRejectedValue(new Error('Unexpected error'));

    await expect(controller.handle(request as any)).rejects.toThrow('Unexpected error');
  });
});
