import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PaymentService } from '../../domain/service';
import { DbPaymentRepository } from '../../domain/database';
import { UpdatePaymentController } from './controller';
import logger from '../../../utils/logger';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    endpoint: process.env.DB_HOST,
  });
  const ddb = DynamoDBDocumentClient.from(client);

  try {
    if (!event.pathParameters?.id || !event.body) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Payment ID and status are required' })
      };
    }

    const paymentId = event.pathParameters?.id;
    const requestData = JSON.parse(event.body);

    const paymentRepository = new DbPaymentRepository(ddb);
    const paymentService = new PaymentService(paymentRepository);
    const paymentController = new UpdatePaymentController(paymentService);

    const result = await paymentController.handle({
      id: Number(paymentId),
      status: requestData.status,
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    };

  } catch (error) {
    logger.error(`Error updating payment`, error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
}; 