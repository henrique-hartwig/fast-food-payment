import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PaymentService } from '../../domain/service';
import { DbPaymentRepository } from '../../domain/database';
import { ListPaymentsController } from './controller';
import logger from '../../../utils/logger';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
  });
  const ddb = DynamoDBDocumentClient.from(client);
  
  try {
    if (!event.queryStringParameters?.limit) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Query parameters are required' })
      };
    }

    const requestData = {
      limit: parseInt(event.queryStringParameters?.limit)
    };

    const paymentRepository = new DbPaymentRepository(ddb);
    const paymentService = new PaymentService(paymentRepository);
    const paymentController = new ListPaymentsController(paymentService);

    const result = await paymentController.handle(requestData);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Payments retrieved successfully',
        data: result,
      }),
    };
  } catch (error: any) {
    logger.error(`Error getting payment`, error);

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