import { User as AppUser } from '../users';

export type AuthUser = Pick<AppUser, 'email' | 'id'>;
