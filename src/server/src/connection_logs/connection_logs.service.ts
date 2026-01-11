import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import {
  ConnectionLog,
  ConnectionLogDocument,
} from './entities/connection_log.entity';

@Injectable()
export class ConnectionLogsService {
  constructor(
    @InjectModel(ConnectionLog.name)
    private connectionModel: Model<ConnectionLogDocument>,
  ) {}

  async create(userId: ObjectId, ipAddress: string, userAgent: string) {
    const newLog = new this.connectionModel({
      userId,
      ipAddress,
      userAgent,
    });
    return await newLog.save();
  }

  async getTotalConnectionsByMonth() {
    const result = await this.connectionModel.aggregate([
      {
        $addFields: {
          timestampDate: { $toDate: '$timestamp' },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalConnections: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    return result;
  }
}
