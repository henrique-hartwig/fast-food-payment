import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { PaymentStatus } from '../../domain/entity';
import { PaymentService } from '../../domain/service';
import { DbPaymentRepository } from '../../domain/database';
import { UpdatePaymentController } from './controller';
import logger from '../../../utils/logger';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
  });
  const ddb = DynamoDBDocumentClient.from(client);
  const sqs = new SQSClient({ region: 'us-east-1' });

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
      paymentData: requestData,
    });

    console.log('result', result)

    const sendToProductionQueueUrl = process.env.PRODUCTION_QUEUE_URL;
    
    if (result.status === PaymentStatus.PAID) {
      console.log('sendToProductionQueueUrl', sendToProductionQueueUrl)

      // if (!sendToProductionQueueUrl) {
      //   throw new Error('PRODUCTION_QUEUE_URL is not set');
      // }
      const paymentRequest = {
        orderId: result.orderId
      }

      await sqs.send(new SendMessageCommand({
        QueueUrl: sendToProductionQueueUrl,
        MessageBody: JSON.stringify(paymentRequest),
        // MessageAttributes: {
        //   OrderId: {
        //     DataType: 'String',
        //     StringValue: paymentRequest.toString(),
        //   },
        // },
      }));
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Payment updated successfully',
        data: result,
      }),
    };

  } catch (error: any) {
    logger.error(`Error updating payment`, error);

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