export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PIX = 'pix',
}

export class Payment {
  constructor(
    public id: number,
    public orderId: number,
    public status: PaymentStatus,
    public paymentMethod: PaymentMethod,
    public amount: number,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
