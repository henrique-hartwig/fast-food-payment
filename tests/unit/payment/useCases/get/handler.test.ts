import { handler } from '../../../../../src/payment/useCases/get/handler';

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
      from: jest.fn(),
    },
    GetCommand: jest.fn(),
  };
});

describe('Get Payment Lambda', () => {
  let mockPaymentGet: jest.Mock;

  beforeEach(() => {
    mockPaymentGet = jest.fn();
    
    (require('@aws-sdk/lib-dynamodb').DynamoDBDocumentClient.from as jest.Mock)
    .mockReturnValue({
      send: mockPaymentGet
    });
    
    (require('@aws-sdk/client-dynamodb').DynamoDBClient as jest.Mock)
    .mockImplementation(() => ({
      send: mockPaymentGet,
    }));

    jest.clearAllMocks();
  });

  it('should return 200 if find the payment', async () => {
    const event = {
      pathParameters: {
        id: 123,
      },
    } as any;

    mockPaymentGet.mockResolvedValue({
      Item: {
        id: 123,
        name: 'Payment 1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.data).toMatchObject({
      id: 123,
      name: 'Payment 1',
    });
  });

  it('should return 400 if paymentId is not sent', async () => {
    const event = {
      pathParameters: {
        id: null,
      },
    } as any;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    const body = JSON.parse(result.body);
    expect(body.message).toBe('Payment ID is required');
    expect(mockPaymentGet).not.toHaveBeenCalled();
  });

  it('should return 500 if an unexpected error occurs', async () => {
    const event = {
      pathParameters: {
        id: 999,
      },
    } as any;

    mockPaymentGet.mockRejectedValue(new Error('Not found'));

    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    const body = JSON.parse(result.body);
    expect(body.message).toBe('Internal server error');
  });
});
