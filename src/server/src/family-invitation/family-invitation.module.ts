import { MiddlewareConsumer, Module } from '@nestjs/common';
import { FamilyInvitationService } from './family-invitation.service';
import { FamilyInvitationController } from './family-invitation.controller';
import { AuthCheckMiddleware } from 'src/auth-check/auth-check.middleware';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from 'src/events/entities/event.entity';
import { Family, FamilySchema } from 'src/families/entities/family.entity';
import { Child, ChildSchema } from 'src/children/entities/child.entity';
import { User, UserSchema } from 'src/users/entities/user.entity';
import {
  FamilyInvitation,
  FamilyInvitationSchema,
} from './entities/family-invitation.entity';
import { FamiliesService } from 'src/families/families.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: Family.name, schema: FamilySchema },
      { name: Child.name, schema: ChildSchema },
      { name: User.name, schema: UserSchema },
      { name: FamilyInvitation.name, schema: FamilyInvitationSchema },
    ]),
  ],
  controllers: [FamilyInvitationController],
  providers: [FamilyInvitationService, FamiliesService],
})
export class FamilyInvitationModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthCheckMiddleware).forRoutes(FamilyInvitationController);
  }
}
