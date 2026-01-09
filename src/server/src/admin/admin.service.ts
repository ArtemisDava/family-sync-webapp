import { Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UsersService } from '../users/users.service';
import { FamiliesService } from '../families/families.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly familiesService: FamiliesService,
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
    let totalUsers = await this.usersService.getUserCount();
    let totalFamilies = await this.familiesService.getTotalFamiliesCount();
    let totalAdmins = await this.usersService.getAdminCount();

    return {
      totalUsers: totalUsers,
      totalFamilies: totalFamilies,
      totalAdmins: totalAdmins,
      totalFrequency: 0,
    };
  }
}
