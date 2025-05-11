import { UpdatePaymentController } from '../../../../../src/payment/useCases/update/controller';
import { PaymentService } from '../../../../../src/payment/domain/service';
import { PaymentMethod, PaymentStatus } from '../../../../../src/payment/domain/entity';

describe('UpdatePaymentController', () => {
    let controller: UpdatePaymentController;
    let service: jest.Mocked<PaymentService>;

    beforeEach(() => {
        service = {
            updatePayment: jest.fn(),
        } as any;
        controller = new UpdatePaymentController(service);
    });

    it('should update the payment', async () => {
        const request = {
            id: 1,
            paymentData: {
                status: PaymentStatus.PAID,
                amount: 100,
                paymentMethod: PaymentMethod.CREDIT_CARD
            }
        };
        service.updatePayment.mockResolvedValue({
            id: 1,
            status: PaymentStatus.PAID,
            amount: 100,
            paymentMethod: PaymentMethod.CREDIT_CARD
        } as any);

        const result = await controller.handle(request);

        expect(result).toEqual({
            id: 1,
            status: PaymentStatus.PAID,
            amount: 100,
            paymentMethod: PaymentMethod.CREDIT_CARD
        });
        expect(service.updatePayment).toHaveBeenCalledWith(1, {
            status: PaymentStatus.PAID,
            amount: 100,
            paymentMethod: PaymentMethod.CREDIT_CARD
        });
    });

    it('should throw validation error', async () => {
        const request = {
            id: 1,
            paymentData: {
                status: 'invalid'
            }
        };

        await expect(controller.handle(request as any)).rejects.toThrow();
    });

    it('should throw error if the service returns an error', async () => {
        const request = {
            id: 1,
            paymentData: {
                status: PaymentStatus.PAID,
                amount: 100,
                paymentMethod: PaymentMethod.CREDIT_CARD
            }
        };

        service.updatePayment.mockResolvedValue({ error: 'Service error' } as any);
        await expect(controller.handle(request as any)).rejects.toThrow('Service error');
    });

    it('should throw unexpected error', async () => {
        const request = {
            id: 1,
            paymentData: {
                status: PaymentStatus.PAID,
                amount: 100,
                paymentMethod: PaymentMethod.CREDIT_CARD
            }
        };

        service.updatePayment.mockRejectedValue(new Error('Unexpected error'));
        await expect(controller.handle(request as any)).rejects.toThrow('Unexpected error');
    });
});
