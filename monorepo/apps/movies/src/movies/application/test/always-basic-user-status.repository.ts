import { UserStatusRepository } from '../user-status.repository';

export class AlwaysBasicUserStatusRepository implements UserStatusRepository {
  getStatusOfUser(): Promise<'premium' | 'basic'> {
    return Promise.resolve('basic');
  }
}
