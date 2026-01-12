import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { FamiliesModule } from './families/families.module';
import { EventsModule } from './events/events.module';
import { ExpensesModule } from './expenses/expenses.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ChildrenModule } from './children/children.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { ConnectionLogsModule } from './connection_logs/connection_logs.module';
import { FamilyInvitationModule } from './family-invitation/family-invitation.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // MongoDB connection
    MongooseModule.forRoot(process.env.MONGODB_URI!),

    AuthModule,
    UsersModule,
    FamiliesModule,
    EventsModule,
    ExpensesModule,
    NotificationsModule,
    ChildrenModule,
    AuthModule,
    AdminModule,
    ConnectionLogsModule,
    FamilyInvitationModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
