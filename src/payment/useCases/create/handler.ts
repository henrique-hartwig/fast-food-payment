import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PaymentService } from '../../domain/service';
import { DbPaymentRepository } from '../../domain/database';
import { CreatePaymentController } from './controller';
import logger from '../../../utils/logger';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
  });
  const ddb = DynamoDBDocumentClient.from(client);

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Request body is required' })
      };
    }

    const requestData = JSON.parse(event.body);

    const paymentRepository = new DbPaymentRepository(ddb);
    const paymentService = new PaymentService(paymentRepository);
    const paymentController = new CreatePaymentController(paymentService);

    const result = await paymentController.handle(requestData);
    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    };
  } catch (error) {
    logger.error('Error creating payment', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
}; 