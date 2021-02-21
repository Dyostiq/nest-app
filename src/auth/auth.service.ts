import {Injectable} from '@nestjs/common';
import * as bcrypt from 'bcrypt'
import {JwtService} from '@nestjs/jwt';
import * as crypto from 'crypto'

import {User, UsersRepository} from '../users';

type UserInput = {
    email: string,
    password: string,
};

type SignInInput = {
    email: string,
    id: string
}

type SignUpInput = {
    email: string
    password: string
}

@Injectable()
export class AuthService {
    constructor(
        private readonly users: UsersRepository,
        private readonly jwtService: JwtService,
    ) {
    }

    /**
     *
     * @param user to be checked
     * @returns user if valid, false if invalid
     */
    async validateUser(user: UserInput): Promise<User | false> {
        const foundUser = await this.users.find(user.email)
        const shaHashedPassword = this.#hashShaPassword(user.password)
        if (!foundUser) {
            // to prevent deducing users in DB on a response time basis
            await this.#fakeCheck(shaHashedPassword);
            return false;
        }

        return await bcrypt.compare(shaHashedPassword, foundUser.passwordHash) ? foundUser : false
    }

    /**
     *
     * @return id on success, false otherwise
     */
    async signUp(user: SignUpInput): Promise<{ id: string } | false> {
        const foundUser = await this.users.find(user.email)
        if (foundUser) {
            return false
        }

        const shaHash = this.#hashShaPassword(user.password)
        const passwordHash = await bcrypt.hash(shaHash, 10)

        const createdUserId = await this.users.create({
            email: user.email,
            passwordHash,
        })

        return {
            id: createdUserId
        }
    }

    async signIn(user: SignInInput): Promise<{
        accessToken: string,
    }> {
        const payload = {email: user.email, sub: user.id}
        return {
            accessToken: this.jwtService.sign(payload)
        }
    }

    #fakeCheck = async (password: string): Promise<void> => {
        const fakePasswordHash = '$2b$10$uV.Pr.ov6HRcQbo1yJTi3.GEAsmkp.rSziGJs62IlmKOfM.20CPpi'
        await bcrypt.compare(password, fakePasswordHash)
    };

    #hashShaPassword = (password: string): string => crypto
        .createHash('sha256')
        .update(password)
        .digest('base64');
}
