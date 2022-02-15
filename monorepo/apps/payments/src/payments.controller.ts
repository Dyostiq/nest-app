import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { CreatePaymentService } from './create-payment.service';
import { IsString } from 'class-validator';

export class PaymentDto {
  @IsString()
  userId: string;
}

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: CreatePaymentService) {}

  @Post()
  pay(@Body(ValidationPipe) body: PaymentDto): void {
    this.paymentsService.createPayment(body.userId);
  }
}
