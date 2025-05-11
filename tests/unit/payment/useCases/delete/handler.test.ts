import { handler } from '../../../../../src/payment/useCases/delete/handler';

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
    DeleteCommand: jest.fn(),
  };
});

describe('Delete Payment Lambda', () => {
  let mockPaymentDelete: jest.Mock;

  beforeEach(() => {
    mockPaymentDelete = jest.fn();

    (require('@aws-sdk/lib-dynamodb').DynamoDBDocumentClient.from as jest.Mock)
      .mockReturnValue({
        send: mockPaymentDelete
      });

    (require('@aws-sdk/client-dynamodb').DynamoDBClient as jest.Mock)
      .mockImplementation(() => ({
        send: mockPaymentDelete,
    }));

    jest.clearAllMocks();
  });

  it('should return 200 if a valid payment is deleted', async () => {
    const event = {
      pathParameters: {
        id: 123,
      },
    } as any;

    mockPaymentDelete.mockResolvedValue(true);

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.message).toBe('Payment deleted successfully');
    expect(body.data).toBeTruthy();
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
    expect(mockPaymentDelete).not.toHaveBeenCalled();
  });

  it('should return 500 if an unexpected error occurs', async () => {
    const event = {
      pathParameters: {
        id: 999,
      },
    } as any;

    mockPaymentDelete.mockRejectedValue(new Error('Not found'));

    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    const body = JSON.parse(result.body);
    expect(body.message).toBe('Internal server error');
  });
});
