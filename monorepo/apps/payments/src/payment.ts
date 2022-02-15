import { AggregateRoot } from '@nestjs/cqrs';

export class PaymentPaid {
  constructor(public readonly userId: string) {}
}

export class Payment extends AggregateRoot {
  private paid = false;
  private paidBy?: string;

  pay(userId: string) {
    this.paid = true;
    this.paidBy = userId;

    this.apply(new PaymentPaid(userId));
  }
}
