import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './entities/user.entity';
import { AuthCheckMiddleware } from '../auth-check/auth-check.middleware';
import { FamilyInvitationService } from 'src/family-invitation/family-invitation.service';
import {
  FamilyInvitation,
  FamilyInvitationSchema,
} from 'src/family-invitation/entities/family-invitation.entity';
import { FamiliesService } from 'src/families/families.service';
import { Family, FamilySchema } from 'src/families/entities/family.entity';
import { Child, ChildSchema } from 'src/children/entities/child.entity';
import { Event, EventSchema } from 'src/events/entities/event.entity';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: FamilyInvitation.name, schema: FamilyInvitationSchema },
      { name: Family.name, schema: FamilySchema },
      { name: Child.name, schema: ChildSchema },
      { name: Event.name, schema: EventSchema },
    ]),
    MailModule,
  ],
  controllers: [UsersController],
  providers: [FamilyInvitationService, FamiliesService, UsersService],
  exports: [UsersService, MongooseModule],
})
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthCheckMiddleware)
      .exclude({ path: 'users', method: RequestMethod.POST })
      .forRoutes(UsersController);
  }
}
