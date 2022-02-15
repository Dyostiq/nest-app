import { PaymentPaidEventDto } from '@app/payment-integration';

export class UserStatusService {
  private readonly premiumUsers = new Set<string>();

  paymentPaid(mappedData: PaymentPaidEventDto) {
    this.premiumUsers.add(mappedData.userId);
  }

  getUserStatus(userId: string) {
    return this.premiumUsers.has(userId) ? 'premium' : 'basic';
  }
}
