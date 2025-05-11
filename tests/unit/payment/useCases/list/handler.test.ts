import { PaymentStatus } from '../../../../../src/payment/domain/entity';
import { handler } from '../../../../../src/payment/useCases/list/handler';

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
    QueryCommand: jest.fn(),
  };
});

describe('List Payment Lambda', () => {
  let mockPaymentList: jest.Mock;

  beforeEach(() => {
    mockPaymentList = jest.fn();

    (require('@aws-sdk/lib-dynamodb').DynamoDBDocumentClient.from as jest.Mock)
      .mockReturnValue({
        send: mockPaymentList
      });

    (require('@aws-sdk/client-dynamodb').DynamoDBClient as jest.Mock)
      .mockImplementation(() => ({
        send: mockPaymentList,
    }));

    jest.clearAllMocks();
  });

  it('should return 200', async () => {
    const event = {
      queryStringParameters: {
        limit: 10,
      },
    } as any;

    mockPaymentList.mockResolvedValue({
      Items: [{
        id: 123,
        status: PaymentStatus.PENDING,
        orderId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }]
    });

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
  });

  it('should return 400 when limit is not sent', async () => {
    const event = {
      queryStringParameters: {},
    } as any;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(result.body).toContain('Query parameters are required');
    expect(mockPaymentList).not.toHaveBeenCalled();
  });

  it('should return 500 when an unexpected error occurs', async () => {
    const event = {
      queryStringParameters: {
        limit: 10,
      },
    } as any;

    mockPaymentList.mockRejectedValue(new Error('Unexpected error'));

    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({
      message: 'Internal server error'
    });
  });
});
