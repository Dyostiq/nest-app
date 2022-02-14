import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';

import { JwtAuthGuard } from '@app/jwt-auth';

import { AuthService } from '../auth.service';
import { LocalAuthGuard } from '../passport/local-auth.guard';

import { SignInDto } from './sign-in.dto';
import { UserAuthDto } from './user-auth.dto';
import { UserDto } from './user.dto';
import { SignUpDto } from './sign-up.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('signin')
  @ApiBody({
    type: SignInDto,
  })
  @ApiResponse({
    status: 401,
  })
  @HttpCode(200)
  async signIn(@Request() req: ExpressRequest): Promise<UserAuthDto> {
    if (!req.user) {
      throw new InternalServerErrorException();
    }
    const { accessToken } = await this.authService.signIn({
      id: req.user.id,
      email: req.user.email,
    });
    return UserAuthDto.fromAuthUserWithToken(req.user, accessToken);
  }

  @Post('signup')
  async signUp(@Body() body: SignUpDto): Promise<UserDto> {
    const result = await this.authService.signUp(body);
    if (!result) {
      throw new BadRequestException();
    }
    return UserDto.fromAuthUser({
      email: body.email,
      id: result.id,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  async me(@Request() req: ExpressRequest): Promise<UserDto> {
    if (!req.user) {
      throw new InternalServerErrorException();
    }

    return UserDto.fromAuthUser(req.user);
  }
}
