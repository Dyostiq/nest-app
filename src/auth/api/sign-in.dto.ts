import {IsEmail, IsString} from 'class-validator';

export class SignInDto {
    @IsString()
    password!: string
    @IsEmail()
    email!: string
}