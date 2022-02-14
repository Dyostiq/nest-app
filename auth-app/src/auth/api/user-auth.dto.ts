import {plainToClass} from 'class-transformer';
import {IsJWT} from 'class-validator';
import {UserDto} from './user.dto';
import {AuthUser} from '../auth-user.type';

export class UserAuthDto extends UserDto {
    @IsJWT()
    accessToken!: string

    static fromAuthUserWithToken(user: AuthUser, accessToken: string): UserAuthDto {
        return plainToClass<UserAuthDto, UserAuthDto>(UserAuthDto, {
            id: user.id,
            email: user.email,
            accessToken: accessToken,
        })
    }
}