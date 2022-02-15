export abstract class UserStatusRepository {
  abstract getStatusOfUser(userId: string): Promise<'premium' | 'basic'>;
}
