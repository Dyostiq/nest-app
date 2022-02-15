import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { queueName } from '@app/payment-integration';
import { PaymentPaidConsumer } from './payment-paid.consumer';
import { GetUserStatusService } from './get-user-status.service';
import { UserStatusService } from './user-status.service';

@Module({
  imports: [
    // hack but I have no time to investigate
    ...(process.env.NODE_ENV === 'test'
      ? []
      : [BullModule.registerQueue({ name: queueName })]),
  ],
  providers: [PaymentPaidConsumer, GetUserStatusService, UserStatusService],
  exports: [GetUserStatusService],
})
export class UserStatusModule {}
