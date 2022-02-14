import { IsEmail, IsString } from 'class-validator';

export class SignUpDto {
  @IsString()
  password!: string;
  @IsEmail()
  email!: string;
}
