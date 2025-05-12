import { DbPaymentRepository } from '../domain/database';
import { PaymentGateway, CreatePaymentDTO, PaymentResponse, PaymentStatusResponse } from '../domain/adapter';
import { PaymentService } from '../domain/service';
import { UpdatePaymentController } from '../useCases/update/controller';
import { PaymentMethod, PaymentStatus } from '../domain/entity';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export class MercadoPagoGateway implements PaymentGateway {
  async createPayment(data: CreatePaymentDTO): Promise<PaymentResponse> {
    const mercadoPagoApiUrl = process.env.MERCADO_PAGO_API_URL;
    const mercadoPagoToken = process.env.MERCADO_PAGO_TOKEN;

    if (!mercadoPagoApiUrl || !mercadoPagoToken) {
      throw new Error('Mercado Pago API URL or token is not set');
    }

    const response = await fetch(mercadoPagoApiUrl, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${mercadoPagoToken}` },
      body: JSON.stringify({
        transaction_amount: data.amount,
        payment_method_id: data.method,
      }),
    });
    const result = await response.json() as any;
    return {
      paymentId: result.id,
      status: result.status,
      qrCode: result.point_of_interaction?.transaction_data?.qr_code_base64,
    };
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    const mercadoPagoApiUrl = process.env.MERCADO_PAGO_API_URL;
    const mercadoPagoToken = process.env.MERCADO_PAGO_TOKEN;

    if (!mercadoPagoApiUrl || !mercadoPagoToken) {
      throw new Error('Mercado Pago API URL or token is not set');
    }

    const response = await fetch(`${mercadoPagoApiUrl}/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${mercadoPagoToken}` },
    });
    const result = await response.json() as any;
    return {
      paymentId: result.id,
      status: result.status,
    };
  }

  async handleWebhook(event: any): Promise<void> {
    const paymentId = event.data.id;
    const status = event.data.status;
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION,
      endpoint: process.env.DB_HOST,
    });
    const ddb = DynamoDBDocumentClient.from(client);
    const paymentRepository = new DbPaymentRepository(ddb);
    const paymentService = new PaymentService(paymentRepository);
    const updatePaymentController = new UpdatePaymentController(paymentService);
    
    await updatePaymentController.handle({
        id: Number(paymentId),
        paymentData: {
            status: status as PaymentStatus,
            amount: 0,
            paymentMethod: PaymentMethod.PIX,
        },
    });
  }
}