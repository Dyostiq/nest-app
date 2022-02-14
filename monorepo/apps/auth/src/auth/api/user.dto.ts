import { AuthUser } from '../auth-user.type';
import { plainToInstance } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';

export class UserDto {
  @IsString()
  id!: string;
  @IsEmail()
  email!: string;

  static fromAuthUser(user: AuthUser): UserDto {
    return plainToInstance<UserDto, UserDto>(UserDto, {
      id: user.id,
      email: user.email,
    });
  }
}
