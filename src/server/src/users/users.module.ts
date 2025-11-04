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

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, MongooseModule],
})
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthCheckMiddleware)
      .exclude(
        { path: 'users', method: RequestMethod.POST }, // Tillåt registrering (Create)
        // Lägg till fler rutter här om de ska vara tillgängliga för gäster
      )
      .forRoutes(UsersController); // Applicera på alla rutter i UsersController UTOM de exkluderade
  }
}
