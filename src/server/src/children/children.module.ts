import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChildrenService } from './children.service';
import { ChildrenController } from './children.controller';
import { Child, ChildSchema } from './entities/child.entity';
import { Family, FamilySchema } from '../families/entities/family.entity';
import { User, UserSchema } from '../users/entities/user.entity';
import { MiddlewareConsumer } from '@nestjs/common';
import { AuthCheckMiddleware } from '../auth-check/auth-check.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Child.name, schema: ChildSchema },
      { name: Family.name, schema: FamilySchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ChildrenController],
  providers: [ChildrenService],
  exports: [ChildrenService],
})
export class ChildrenModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthCheckMiddleware).forRoutes(ChildrenController);
  }
}
