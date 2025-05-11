import { PaymentMethod, PaymentStatus } from '../../../../../src/payment/domain/entity';
import { handler } from '../../../../../src/payment/useCases/update/handler';

jest.mock('@aws-sdk/client-dynamodb', () => {
  return {
    DynamoDBClient: jest.fn().mockImplementation(() => ({
      config: {
        region: 'us-east-1'
      }
    }))
  };
});

jest.mock('@aws-sdk/lib-dynamodb', () => {
  return {
    DynamoDBDocumentClient: {
      from: jest.fn().mockReturnValue({
        send: jest.fn(),
      }),
    },
    PutCommand: jest.fn(),
    GetCommand: jest.fn(),
    QueryCommand: jest.fn(),
  };
});

describe('Update Payment Lambda', () => {
  let mockPaymentUpdate: jest.Mock;

  beforeEach(() => {
    mockPaymentUpdate = jest.fn();

    (require('@aws-sdk/lib-dynamodb').DynamoDBDocumentClient.from as jest.Mock)
      .mockReturnValue({
        send: mockPaymentUpdate
      });

    (require('@aws-sdk/client-dynamodb').DynamoDBClient as jest.Mock)
      .mockImplementation(() => ({
        send: mockPaymentUpdate,
    }));

    jest.clearAllMocks();
  });

  it('should update the payment', async () => {
    const event = {
      pathParameters: { id: 123 },
      body: JSON.stringify({
        status: PaymentStatus.PAID,
        amount: 100,
        paymentMethod: PaymentMethod.CREDIT_CARD,
      }),
    } as any;
    
    const mockPayment = {
      Item: {
        id: 123,
        status: PaymentStatus.PENDING,
        amount: 50,
        paymentMethod: PaymentMethod.DEBIT_CARD,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    };

    const mockPaymentUpdateResolved = {
      Item: {
        id: 123,
        status: PaymentStatus.PAID,
        amount: 100,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    };

    mockPaymentUpdate
      .mockResolvedValue(mockPayment)
      .mockResolvedValue(mockPaymentUpdateResolved);

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.data).toMatchObject({
      id: 123,
      status: PaymentStatus.PAID,
      amount: 100,
      paymentMethod: PaymentMethod.CREDIT_CARD,
    });
  });

  it('should return 400 if body is not provided', async () => {
    const event = {
      pathParameters: { id: 123 }
    } as any;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    const body = JSON.parse(result.body);
    expect(body.message).toBe('Payment ID and status are required');
    expect(mockPaymentUpdate).not.toHaveBeenCalled();
  });

  it('should return 400 if payment id is not provided in path', async () => {
    const event = {
      body: JSON.stringify({
        status: PaymentStatus.PAID,
      })
    } as any;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    const body = JSON.parse(result.body);
    expect(body.message).toBe('Payment ID and status are required');
    expect(mockPaymentUpdate).not.toHaveBeenCalled();
  });

  it('should return 400 when status is invalid', async () => {
    const event = {
      pathParameters: { id: '123' },
      body: JSON.stringify({ status: 'invalid' })
    } as any;
    const result = await handler(event);
    expect(result.statusCode).toBe(400);
  });

  it('should return 500 for generic errors', async () => {
    const event = {
      pathParameters: { id: 123 },
      body: JSON.stringify({
        amount: 100,
        status: PaymentStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
      }),
    } as any;

    mockPaymentUpdate.mockRejectedValueOnce(new Error('Generic error'));

    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    const body = JSON.parse(result.body);
    expect(body.message).toBe('Internal server error');
  });
});
