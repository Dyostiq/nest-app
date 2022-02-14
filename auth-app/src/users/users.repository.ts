import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {User as UserModel, UserDocument} from './user.schema';
import {Model} from 'mongoose';

export class User implements UserModel {
    constructor(
        public readonly id: string,
        public readonly email: string,
        public readonly passwordHash: string
    ) {
    }
}

@Injectable()
export class UsersRepository {
    constructor(
        @InjectModel(UserModel.name) private userModel: Model<UserDocument>
    ) {
    }

    async create(param: Omit<User, 'id'>): Promise<string> {
        const user = await this.userModel.create({
            email: param.email,
            passwordHash: param.passwordHash,
        })
        return user._id.toString()
    }

    async find(email: string): Promise<User | null> {
        const result = await this.userModel.findOne({
            email: email
        }).lean();
        return result ? new User(result._id.toString(), result.email, result.passwordHash) : null;
    }
}
