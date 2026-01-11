import { Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UsersService } from '../users/users.service';
import { FamiliesService } from '../families/families.service';
import { ConnectionLogsService } from 'src/connection_logs/connection_logs.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly familiesService: FamiliesService,
    private readonly connectionLogsService: ConnectionLogsService,
  ) {}

  create(createAdminDto: CreateAdminDto) {
    return 'This action adds a new admin';
  }

  findAll() {
    return `This action returns all admin`;
  }

  findOne(id: number) {
    return `This action returns a #${id} admin`;
  }

  update(id: number, updateAdminDto: UpdateAdminDto) {
    return `This action updates a #${id} admin`;
  }

  remove(id: number) {
    return `This action removes a #${id} admin`;
  }

  async getOverviewStats() {
    const totalUsers = await this.usersService.getUserCount();
    const totalFamilies = await this.familiesService.getTotalFamiliesCount();
    const totalAdmins = await this.usersService.getAdminCount();
    const totalFrequency = await this.connectionLogsService.getTotalConnectionsByMonth();

    return {
      totalUsers: totalUsers,
      totalFamilies: totalFamilies,
      totalAdmins: totalAdmins,
      totalFrequency: {
        data: totalFrequency,
        total: totalFrequency.reduce((acc, curr) => acc + curr.totalConnections, 0),
      },
    };
  }
}
