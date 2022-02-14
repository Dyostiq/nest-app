// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AuthUser } from './auth-user.type';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    export interface User extends AuthUser {}
  }
}
