import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FamiliesService } from './families.service';
import { FamiliesController } from './families.controller';
import { Family, FamilySchema } from './entities/family.entity';
import { User, UserSchema } from '../users/entities/user.entity';
import { MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AuthCheckMiddleware } from '../auth-check/auth-check.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Family.name, schema: FamilySchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [FamiliesController],
  providers: [FamiliesService],
  exports: [FamiliesService],
})
export class FamiliesModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthCheckMiddleware).forRoutes(FamiliesController); // Applicera på alla rutter i FamiliesController UTOM de exkluderade
  }
}
