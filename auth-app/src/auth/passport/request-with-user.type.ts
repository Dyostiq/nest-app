import {Request} from 'express';
import {User} from '../../users';

export type RequestWithUser = Request & {
    user: User
}