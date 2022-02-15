import { Injectable } from '@nestjs/common';
import { Payment } from './payment';
import { EventPublisher } from '@nestjs/cqrs';

@Injectable()
export class CreatePaymentService {
  constructor(private readonly eventPublisher: EventPublisher) {}

  createPayment(userId: string) {
    const payment = new Payment();
    this.eventPublisher.mergeObjectContext(payment);
    payment.pay(userId);

    payment.commit();
  }
}
