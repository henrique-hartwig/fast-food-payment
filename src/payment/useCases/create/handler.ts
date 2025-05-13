import { SQSEvent, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DeleteMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { PaymentService } from '../../domain/service';
import { DbPaymentRepository } from '../../domain/database';
import { CreatePaymentController } from './controller';
import logger from '../../../utils/logger';
import { PaymentMethod } from '../../domain/entity';

export const handler = async (event: SQSEvent | APIGatewayProxyEvent): Promise<any> => {
  const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
  });
  const ddb = DynamoDBDocumentClient.from(client);

  try {
    if ('Records' in event && event.Records) {
      return await processSQSEvent(event, ddb);
    } 

    return await processAPIGatewayEvent(event as APIGatewayProxyEvent, ddb);
  } catch (error: any) {
    logger.error('Error processing payment event', error);
    throw error;
  }
};

async function processSQSEvent(event: SQSEvent, ddb: DynamoDBDocumentClient): Promise<void> {
  const paymentRepository = new DbPaymentRepository(ddb);
  const paymentService = new PaymentService(paymentRepository);
  const paymentController = new CreatePaymentController(paymentService);

  for (const record of event.Records) {
    try {
      const messageBody = JSON.parse(record.body);
      logger.info(`Processing payment from queue: ${JSON.stringify(messageBody)}`);
      
      await paymentController.handle(messageBody);
      const sqsClient = new SQSClient({ region: process.env.AWS_REGION });

      await sqsClient.send(new DeleteMessageCommand({
        QueueUrl: process.env.ORDERS_QUEUE_URL!,
        ReceiptHandle: record.receiptHandle
      }));
      
      logger.info(`Message ${record.messageId} successfully processed and deleted from queue`);
    } catch (error) {
      logger.error(`Error processing SQS message: ${record.messageId}`, error);
    }
  }
}

async function processAPIGatewayEvent(event: APIGatewayProxyEvent, ddb: DynamoDBDocumentClient): Promise<APIGatewayProxyResult> {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Request body is required' })
    };
  }

  const parsedBody = JSON.parse(event.body);
  const requestData = { 
    ...parsedBody, 
    paymentMethod: parsedBody.paymentMethod || PaymentMethod.PIX 
  };

  const paymentRepository = new DbPaymentRepository(ddb);
  const paymentService = new PaymentService(paymentRepository);
  const paymentController = new CreatePaymentController(paymentService);

  const result = await paymentController.handle(requestData);
  return {
    statusCode: 201,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Payment created successfully',
      data: result
    })
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
}