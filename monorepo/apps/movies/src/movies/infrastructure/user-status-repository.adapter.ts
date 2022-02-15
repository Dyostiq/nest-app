import { Injectable } from '@nestjs/common';
import { GetUserStatusService } from '../../user-status';
import { UserStatusRepository } from '../application';

@Injectable()
export class UserStatusRepositoryAdapter implements UserStatusRepository {
  constructor(private readonly userStatus: GetUserStatusService) {}

  async getStatusOfUser(userId: string): Promise<'premium' | 'basic'> {
    return this.userStatus.getUserStatus(userId);
  }
}
