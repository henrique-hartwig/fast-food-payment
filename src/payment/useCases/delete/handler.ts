import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PaymentService } from '../../domain/service';
import { DbPaymentRepository } from '../../domain/database';
import { DeletePaymentController } from './controller';
import logger from '../../../utils/logger';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
  });
  const ddb = DynamoDBDocumentClient.from(client);

  try {
    if (!event.pathParameters?.id) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Payment ID is required' })
      };
    }

    const paymentId = event.pathParameters?.id;

    const paymentRepository = new DbPaymentRepository(ddb);
    const paymentService = new PaymentService(paymentRepository);
    const paymentController = new DeletePaymentController(paymentService);

    const result = await paymentController.handle({ id: Number(paymentId) });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Payment deleted successfully',
        data: result,
      }),
    };
  } catch (error: any) {
    logger.error(`Error deleting payment`, error);

    if (error?.name === 'ZodError') {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Validation error',
          details: error.errors,
        }),
      };
    }

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
}; 