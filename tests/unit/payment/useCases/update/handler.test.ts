import { PaymentMethod, PaymentStatus } from '../../../../../src/payment/domain/entity';
import { handler } from '../../../../../src/payment/useCases/update/handler';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';

jest.mock('@aws-sdk/client-sqs', () => {
  const mockSend = jest.fn().mockResolvedValue({
    MessageId: 'mock-message-id'
  });
  
  return {
    SQSClient: jest.fn().mockImplementation(() => ({
      send: mockSend
    })),
    SendMessageCommand: jest.fn()
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
    GetCommand: jest.fn(),
    QueryCommand: jest.fn(),
  };
});

describe('Update Payment Lambda', () => {
  let mockPaymentUpdate: jest.Mock;
  let mockSQSSend: jest.Mock;

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

    mockSQSSend = (SQSClient as jest.Mock).mock.results[0]?.value.send || jest.fn();
    process.env.PRODUCTION_QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/123456789012/test-queue';

    jest.clearAllMocks();
  });

  it('should update the payment and should not send to production queue', async () => {
    const event = {
      pathParameters: { id: 123 },
      body: JSON.stringify({
        status: PaymentStatus.FAILED,
        amount: 100,
        paymentMethod: PaymentMethod.CREDIT_CARD,
      }),
    } as any;
    
    const mockPayment = {
      Item: {
        id: 123,
        status: PaymentStatus.PENDING,
        amount: 100,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    };

    const mockPaymentUpdateResolved = {
      Item: {
        id: 123,
        status: PaymentStatus.FAILED,
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
      status: PaymentStatus.FAILED,
      amount: 100,
      paymentMethod: PaymentMethod.CREDIT_CARD,
    });
    expect(mockSQSSend).toHaveBeenCalledTimes(0);
  });

  it('should update the payment and send to production queue', async () => {
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
    expect(SendMessageCommand).toHaveBeenCalledWith(expect.objectContaining({
      QueueUrl: 'https://sqs.us-east-1.amazonaws.com/123456789012/test-queue',
      MessageBody: expect.any(String)
    }));
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
