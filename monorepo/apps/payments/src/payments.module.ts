import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { CreatePaymentService } from './create-payment.service';
import { BullModule } from '@nestjs/bull';
import { CqrsModule } from '@nestjs/cqrs';
import { PaymentPaidPublisher } from './payment-paid.publisher';
import { queueName } from '@app/payment-integration';

@Module({
  imports: [
    CqrsModule,
    BullModule.forRoot({
      redis: {
        host: 'redis',
        port: 6379,
      },
    }),
    BullModule.registerQueue({ name: queueName }),
  ],
  controllers: [PaymentsController],
  providers: [CreatePaymentService, PaymentPaidPublisher],
})
export class PaymentsModule {}
