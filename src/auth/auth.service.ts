import {Injectable} from '@nestjs/common';
import * as bcrypt from 'bcrypt'
import {JwtService} from '@nestjs/jwt';

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
        if (!foundUser) {
            // to prevent deducing users in DB on a response time basis
            await this.fakeCheck(user.password);
            return false;
        }

        return await bcrypt.compare(user.password, foundUser.passwordHash) ? foundUser : false
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

        return {
            id: await this.users.create({
                email: user.email,
                passwordHash: await bcrypt.hash(user.password, 10),
            })
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

    private async fakeCheck(password: string): Promise<void> {
        const passwordHash = '$2b$10$uV.Pr.ov6HRcQbo1yJTi3.GEAsmkp.rSziGJs62IlmKOfM.20CPpi'
        await bcrypt.compare(password, passwordHash)
    }
}
