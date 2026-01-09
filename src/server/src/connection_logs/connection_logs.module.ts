import { Module } from '@nestjs/common';
import { ConnectionLogsService } from './connection_logs.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ConnectionLog,
  ConnectionLogSchema,
} from './entities/connection_log.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ConnectionLog.name,
        schema: ConnectionLogSchema,
      },
    ]),
  ],
  providers: [ConnectionLogsService],
})
export class ConnectionLogsModule {}
