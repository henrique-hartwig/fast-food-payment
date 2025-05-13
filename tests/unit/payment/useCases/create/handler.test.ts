import { PaymentMethod, PaymentStatus } from '../../../../../src/payment/domain/entity';
import { handler } from '../../../../../src/payment/useCases/create/handler';
import { SQSEvent } from 'aws-lambda';

jest.mock('@aws-sdk/client-sqs', () => {
  return {
    SQSClient: jest.fn().mockImplementation(() => ({
      send: jest.fn().mockResolvedValue({})
    })),
    DeleteMessageCommand: jest.fn().mockImplementation((input) => input)
  };
});

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
  };
});

describe('Create Payment Lambda', () => {
  let mockPaymentCreate: jest.Mock;
  let mockSQSDelete: jest.Mock;

  beforeEach(() => {
    mockPaymentCreate = jest.fn();
    mockSQSDelete = jest.fn();

    (require('@aws-sdk/lib-dynamodb').DynamoDBDocumentClient.from as jest.Mock)
      .mockReturnValue({
        send: mockPaymentCreate
      });

    (require('@aws-sdk/client-dynamodb').DynamoDBClient as jest.Mock)
      .mockImplementation(() => ({
        send: mockPaymentCreate,
    }));

    (require('@aws-sdk/client-sqs').SQSClient as jest.Mock)
      .mockImplementation(() => ({
        send: mockSQSDelete,
    }));
    process.env.ORDERS_QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/123456789012/test-queue';

    jest.clearAllMocks();
  });

  it('should return 400 if no body is sent', async () => {
    const event = { body: null } as any;
    const result = await handler(event);
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toBe('Request body is required');
    expect(mockPaymentCreate).not.toHaveBeenCalled();
  });

  it('should return 201 if a valid payment is created', async () => {
    const event = {
      body: JSON.stringify({
        orderId: 1,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        amount: 100,
      }),
    } as any;

    const fakePayment = {
      id: expect.any(Number),
      orderId: 1,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      amount: 100,
      status: PaymentStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPaymentCreate.mockResolvedValue(fakePayment);
    mockSQSDelete.mockResolvedValue({});

    const result = await handler(event);

    expect(result.statusCode).toBe(201);
    const body = JSON.parse(result.body);
    expect(body.message).toBe('Payment created successfully');
    expect(body.data).toMatchObject({
      id: expect.any(Number),
      orderId: 1,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      amount: 100,
      status: PaymentStatus.PENDING,
    });
  });

  it('should return 400 if validation error occurs', async () => {
    const event = {
      body: JSON.stringify({
        orderId: 1,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        amount: 100,
      }),
    } as any;

    const zodError = new Error('Validation error');
    zodError.name = 'ZodError';
    (zodError as any).errors = [{ path: ['orderId'], message: 'Invalid orderId' }];

    mockPaymentCreate.mockImplementation(() => { throw zodError; });

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    const body = JSON.parse(result.body);
    expect(body.message).toBe('Validation error');
    expect(body.details).toBeDefined();
  });

  it('should return 500 if an unexpected error occurs', async () => {
    const event = {
      body: JSON.stringify({
        orderId: 1,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        amount: 100,
      }),
    } as any;

    mockPaymentCreate.mockRejectedValue(new Error('DB error'));

    const result = await handler(event);
    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).message).toBe('Internal server error');
  });

  it('should process SQS event and create payment successfully', async () => {
    const event = {
      Records: [
        {
          messageId: 'test-message-id',
          body: JSON.stringify({
            orderId: 1,
            paymentMethod: PaymentMethod.CREDIT_CARD,
            amount: 100,
          }),
          receiptHandle: 'test-receipt-handle',
        }
      ]
    } as SQSEvent;

    const fakePayment = {
      id: 123,
      orderId: 1,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      amount: 100,
      status: PaymentStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPaymentCreate.mockResolvedValue(fakePayment);
    mockSQSDelete.mockResolvedValue({});

    await handler(event);
  });

});
