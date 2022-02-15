import { Process, Processor } from '@nestjs/bull';
import { PaymentPaidEventDto, queueName } from '@app/payment-integration';
import { Job } from 'bull';
import { validateSync } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { UserStatusService } from './user-status.service';

@Processor(queueName)
export class PaymentPaidConsumer {
  constructor(private readonly userStatus: UserStatusService) {}
  @Process()
  paymentPaid(job: Job<PaymentPaidEventDto>) {
    const mappedData = plainToClass<PaymentPaidEventDto, PaymentPaidEventDto>(
      PaymentPaidEventDto,
      job.data,
    );
    const result = validateSync(mappedData);
    if (result.length > 0) {
      throw result[0];
    }
    this.userStatus.paymentPaid(mappedData);
  }
}
