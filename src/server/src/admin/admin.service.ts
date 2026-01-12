import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UsersService } from '../users/users.service';
import { FamiliesService } from '../families/families.service';
import { ConnectionLogsService } from 'src/connection_logs/connection_logs.service';
import { User, UserDocument } from '../users/entities/user.entity';

export interface ConnectionsByMonth {
  _id: { year: number; month: number };
  totalConnections: number;
}

export interface UserStatsAggregation {
  _id: { year: number; month?: number; week?: number };
  count: number;
}

interface PopulatedFamily {
  _id: Types.ObjectId;
  name: string;
  createdAt: Date;
  members?: Types.ObjectId[];
  children?: Types.ObjectId[];
}

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly familiesService: FamiliesService,
    private readonly connectionLogsService: ConnectionLogsService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  create(_createAdminDto: CreateAdminDto) {
    return 'This action adds a new admin';
  }

  findAll() {
    return `This action returns all admin`;
  }

  findOne(id: number) {
    return `This action returns a #${id} admin`;
  }

  update(id: number, _updateAdminDto: UpdateAdminDto) {
    return `This action updates a #${id} admin`;
  }

  remove(id: number) {
    return `This action removes a #${id} admin`;
  }

  async getOverviewStats() {
    const totalUsers = await this.usersService.getUserCount();
    const totalFamilies = await this.familiesService.getTotalFamiliesCount();
    const totalAdmins = await this.usersService.getAdminCount();
    const totalFrequency: ConnectionsByMonth[] =
      await this.connectionLogsService.getTotalConnectionsByMonth();

    return {
      totalUsers: totalUsers,
      totalFamilies: totalFamilies,
      totalAdmins: totalAdmins,
      totalFrequency: {
        data: totalFrequency,
        total: totalFrequency.reduce(
          (acc: number, curr: ConnectionsByMonth) =>
            acc + curr.totalConnections,
          0,
        ),
      },
    };
  }

  async getUsersWithFamilies() {
    const users = await this.userModel
      .find()
      .select('-password')
      .populate<{ families: PopulatedFamily[] }>({
        path: 'families',
        select: 'name createdAt members children',
      })
      .lean()
      .exec();

    return users.map((user) => ({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      families: (user.families || []).map((family: PopulatedFamily) => ({
        _id: family._id.toString(),
        name: family.name,
        createdAt: family.createdAt,
        memberCount: family.members?.length || 0,
      })),
    }));
  }

  async getNewUsersStats(interval: 'week' | 'month') {
    const now = new Date();
    let groupFormat: Record<string, unknown>;
    let dateFilter: Record<string, unknown>;
    let sortField: string;

    if (interval === 'week') {
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 56);

      dateFilter = { createdAt: { $gte: startDate } };
      groupFormat = {
        year: { $year: '$createdAt' },
        week: { $isoWeek: '$createdAt' },
      };
      sortField = 'week';
    } else {
      const startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 12);

      dateFilter = { createdAt: { $gte: startDate } };
      groupFormat = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
      };
      sortField = 'month';
    }

    const result: UserStatsAggregation[] = await this.userModel.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: groupFormat,
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, [`_id.${sortField}`]: 1 } },
    ]);

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    if (interval === 'month') {
      const filledData: { name: string; value: number; year: number }[] = [];
      const currentDate = new Date(now);

      for (let i = 11; i >= 0; i--) {
        const targetDate = new Date(currentDate);
        targetDate.setMonth(targetDate.getMonth() - i);
        const targetMonth = targetDate.getMonth() + 1;
        const targetYear = targetDate.getFullYear();

        const dataPoint = result.find(
          (item) =>
            item._id.month === targetMonth && item._id.year === targetYear,
        );

        filledData.push({
          name: `${monthNames[targetMonth - 1]} ${targetYear}`,
          value: dataPoint ? dataPoint.count : 0,
          year: targetYear,
        });
      }

      return filledData;
    }

    return result.map((item: UserStatsAggregation) => {
      let name: string;
      if (interval === 'week') {
        name = `Week ${item._id.week} (${item._id.year})`;
      } else {
        name =
          monthNames[(item._id.month || 1) - 1] || `Month ${item._id.month}`;
      }
      return {
        name,
        value: item.count,
        year: item._id.year,
      };
    });
  }

  async getFrequencyStats() {
    const frequencyData: ConnectionsByMonth[] =
      await this.connectionLogsService.getTotalConnectionsByMonth();

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    return frequencyData.map((item: ConnectionsByMonth) => ({
      name: monthNames[item._id.month - 1] || `Month ${item._id.month}`,
      value: item.totalConnections,
      year: item._id.year,
    }));
  }
}
