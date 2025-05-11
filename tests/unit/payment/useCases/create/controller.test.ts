import { CreatePaymentController } from '../../../../../src/payment/useCases/create/controller';
import { PaymentService } from '../../../../../src/payment/domain/service';
import { PaymentMethod, PaymentStatus } from '../../../../../src/payment/domain/entity';

describe('CreateOrderController', () => {
  let controller: CreatePaymentController;
  let service: jest.Mocked<PaymentService>;

  beforeEach(() => {
    service = {
      createPayment: jest.fn(),
    } as any;
    controller = new CreatePaymentController(service);
  });

  it('should create the payment', async () => {
    const request = {
      orderId: 1,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      amount: 100,
    };
    service.createPayment.mockResolvedValue({
      id: 1,
      orderId: 1,
      status: PaymentStatus.PENDING,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      amount: 100,
    } as any);

    const result = await controller.handle(request as any);

    expect(result).toEqual({
      id: 1,
      orderId: 1,
      status: PaymentStatus.PENDING,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      amount: 100,
    } as any);
    expect(service.createPayment).toHaveBeenCalledWith(
      request.orderId,
      request.paymentMethod,
      request.amount,
    );
  });

  it('should throw validation error', async () => {
    const request = {
      orderId: 1,
      paymentMethod: 'invalid',
      amount: 100,
    };

    await expect(controller.handle(request as any)).rejects.toThrow();
  });

  it('should throw error if the service returns an error', async () => {
    const request = {
      orderId: 1,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      amount: 100,
    };
    service.createPayment.mockResolvedValue({ error: 'Service error' } as any);

    await expect(controller.handle(request as any)).rejects.toThrow('Service error');
  });

  it('should throw unexpected error', async () => {
    const request = {
      orderId: 1,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      amount: 100,
    };
    service.createPayment.mockRejectedValue(new Error('Unexpected error'));

    await expect(controller.handle(request as any)).rejects.toThrow('Unexpected error');
  });
});
