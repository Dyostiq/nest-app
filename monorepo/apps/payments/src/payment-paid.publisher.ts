import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { PaymentPaid } from './payment';
import { PaymentPaidEventDto, queueName } from '@app/payment-integration';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';

@EventsHandler(PaymentPaid)
export class PaymentPaidPublisher implements IEventHandler<PaymentPaid> {
  constructor(
    @InjectQueue(queueName)
    private readonly queue: Queue,
  ) {}

  async handle(event: PaymentPaid) {
    const mappedEvent = plainToClass<PaymentPaidEventDto, PaymentPaidEventDto>(
      PaymentPaidEventDto,
      {
        userId: event.userId,
      },
    );
    const result = validateSync(mappedEvent);
    if (result.length > 0) {
      throw result[0];
    }
    await this.queue.add(mappedEvent);
  }
}
