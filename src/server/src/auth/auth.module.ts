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
import { FamilyInvitationService } from '../family-invitation/family-invitation.service';
import {
  FamilyInvitation,
  FamilyInvitationSchema,
} from '../family-invitation/entities/family-invitation.entity';
import { FamiliesService } from '../families/families.service';
import { Family, FamilySchema } from '../families/entities/family.entity';
import { Child, ChildSchema } from '../children/entities/child.entity';
import { Event, EventSchema } from '../events/entities/event.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      {
        name: ConnectionLog.name,
        schema: ConnectionLogSchema,
      },
      { name: FamilyInvitation.name, schema: FamilyInvitationSchema },
      { name: Family.name, schema: FamilySchema },
      { name: Child.name, schema: ChildSchema },
      { name: Event.name, schema: EventSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersService,
    ConnectionLogsService,
    FamilyInvitationService,
    FamiliesService,
  ],
})
export class AuthModule {}
