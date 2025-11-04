import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { Event, EventSchema } from './entities/event.entity';
import { Family, FamilySchema } from '../families/entities/family.entity';
import { Child, ChildSchema } from '../children/entities/child.entity';
import { User, UserSchema } from '../users/entities/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: Family.name, schema: FamilySchema },
      { name: Child.name, schema: ChildSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
