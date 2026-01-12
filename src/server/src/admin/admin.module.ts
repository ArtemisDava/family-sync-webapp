import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UsersService } from '../users/users.service';
import { FamiliesService } from '../families/families.service';
import { UsersModule } from '../users/users.module';
import { FamiliesModule } from '../families/families.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Family, FamilySchema } from '../families/entities/family.entity';
import { User, UserSchema } from '../users/entities/user.entity';
import { Child, ChildSchema } from '../children/entities/child.entity';
import { AuthCheckMiddleware } from '../auth-check/auth-check.middleware';
import {
  ConnectionLog,
  ConnectionLogSchema,
} from 'src/connection_logs/entities/connection_log.entity';
import { ConnectionLogsService } from 'src/connection_logs/connection_logs.service';
import { FamilyInvitationService } from '../family-invitation/family-invitation.service';
import {
  FamilyInvitation,
  FamilyInvitationSchema,
} from '../family-invitation/entities/family-invitation.entity';
import { Event, EventSchema } from '../events/entities/event.entity';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    UsersModule,
    FamiliesModule,
    MongooseModule.forFeature([
      { name: Child.name, schema: ChildSchema },
      { name: Family.name, schema: FamilySchema },
      { name: User.name, schema: UserSchema },
      { name: ConnectionLog.name, schema: ConnectionLogSchema },
      { name: FamilyInvitation.name, schema: FamilyInvitationSchema },
      { name: Event.name, schema: EventSchema },
    ]),
    MailModule,
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    UsersService,
    FamiliesService,
    ConnectionLogsService,
    FamilyInvitationService,
  ],
})
export class AdminModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthCheckMiddleware).forRoutes(AdminController);
  }
}
