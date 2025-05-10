import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { Payment } from './entity';
import { PaymentRepository } from './repository';

export class DbPaymentRepository implements PaymentRepository {
  private tableName = process.env.TABLE_NAME || `fast-food-payments-db-${process.env.ENVIRONMENT}`;

  constructor(private readonly ddb: DynamoDBDocumentClient) {}

  async create(payment: Payment): Promise<Payment> {
    await this.ddb.send(new PutCommand({
      TableName: this.tableName,
      Item: payment,
    }));
    return payment;
  }

  async findById(id: number): Promise<Payment | null> {
    const result = await this.ddb.send(new GetCommand({
      TableName: this.tableName,
      Key: { id },
    }));
    return result.Item as Payment || null;
  }

  async findByOrderId(orderId: number): Promise<Payment | null> {
    const result = await this.ddb.send(new QueryCommand({
      TableName: this.tableName,
      IndexName: 'orderId-index',
      KeyConditionExpression: 'orderId = :orderId',
      ExpressionAttributeValues: { ':orderId': orderId },
      Limit: 1,
    }));
    return result.Items && result.Items.length > 0 ? result.Items[0] as Payment : null;
  }

  async update(payment: Payment): Promise<Payment> {
    await this.ddb.send(new PutCommand({
      TableName: this.tableName,
      Item: payment,
    }));
    return payment;
  }

  async delete(id: number): Promise<boolean> {
    await this.ddb.send(new DeleteCommand({
      TableName: this.tableName,
      Key: { id },
    }));
    return true;
  }

  async list(limit: number): Promise<Payment[]> {
    const result = await this.ddb.send(new QueryCommand({
      TableName: this.tableName,
      Limit: limit,
    }));
    return (result.Items as Payment[]) || [];
  }
}