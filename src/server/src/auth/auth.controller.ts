import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDTO } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import LoginResponse from './dto/loginResponse.dto';
import { type Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signUp(@Body() signUpDTO: CreateUserDto): Promise<User> {
    return this.authService.signUp(signUpDTO);
  }

  @Post('login')
  login(
    @Body() loginDTO: LoginDTO,
    @Req() req: Request,
  ): Promise<LoginResponse> {
    return this.authService.login(loginDTO, req);
  }
}
