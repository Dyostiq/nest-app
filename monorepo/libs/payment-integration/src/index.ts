import { IsString } from 'class-validator';

export const queueName = 'payment-paid';
export class PaymentPaidEventDto {
  @IsString()
  userId: string;
}
