export type CreatePaymentDTO = {
    orderId: string;
    amount: number;
    method: 'pix' | 'credit_card' | 'debit_card';
};

export type PaymentResponse = {
    paymentId: string;
    status: string;
    qrCode?: string;
};

export type PaymentStatusResponse = {
    paymentId: string;
    status: string;
};

export interface PaymentGateway {
    createPayment(data: CreatePaymentDTO): Promise<PaymentResponse>;
    getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse>;
    handleWebhook(event: any): Promise<void>;
};