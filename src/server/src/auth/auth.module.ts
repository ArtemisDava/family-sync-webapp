import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from '../users/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/entities/user.entity';
import { ConnectionLogsService } from '../connection_logs/connection_logs.service';
import {
  ConnectionLog,
  ConnectionLogSchema,
} from '../connection_logs/entities/connection_log.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      {
        name: ConnectionLog.name,
        schema: ConnectionLogSchema,
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, ConnectionLogsService],
})
export class AuthModule {}
