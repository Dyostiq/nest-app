import { UserStatusService } from './user-status.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetUserStatusService {
  constructor(private readonly userStatus: UserStatusService) {}

  getUserStatus(userId: string): 'premium' | 'basic' {
    return this.userStatus.getUserStatus(userId);
  }
}
