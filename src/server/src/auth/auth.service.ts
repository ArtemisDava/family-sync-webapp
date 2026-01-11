import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDTO } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtPayload, sign } from 'jsonwebtoken';
import { JWT_SECRET } from '../auth-check/auth-check.middleware';
import { User } from '../users/entities/user.entity';
import LoginResponse from './dto/loginResponse.dto';
import { ConnectionLogsService } from '../connection_logs/connection_logs.service';
import { type Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly ConnectionLogsService: ConnectionLogsService,
  ) {}

  signUp(value: CreateUserDto): Promise<User> {
    return this.usersService.create(value);
  }
  async login(loginDTO: LoginDTO, req: Request): Promise<LoginResponse> {
    let user = await this.usersService.findByEmail(loginDTO.email);

    const isPasswordValid = user
      ? await bcrypt.compare(loginDTO.password, user.password || '')
      : false;

    if (!user || !isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    const payload: JwtPayload = {
      userId: user._id!.toString(),
      email: user.email,
    };

    const jwt = sign(payload, JWT_SECRET);

    const ip = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    await this.ConnectionLogsService.create(user._id, ip, userAgent.toString());

    return {
      accessToken: jwt,
      email: user.email,
      name: user.name,
      userId: user._id!.toString(),
      color: user.color,
      role: user.isAdmin ? 'admin' : user.role,
    };
  }
}
