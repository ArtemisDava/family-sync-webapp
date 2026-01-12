import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Roles, RolesGuard } from '../auth/role.guard';
import { UseGuards } from '@nestjs/common';

@Controller('admin')
@UseGuards(RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.create(createAdminDto);
  }

  @Get()
  findAll() {
    return this.adminService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminService.update(+id, updateAdminDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminService.remove(+id);
  }

  @Get('stats/overview')
  @Roles('admin')
  getOverviewStats() {
    return this.adminService.getOverviewStats();
  }

  @Get('stats/users-with-families')
  @Roles('admin')
  getUsersWithFamilies() {
    return this.adminService.getUsersWithFamilies();
  }

  @Get('stats/new-users/:interval')
  @Roles('admin')
  getNewUsersStats(@Param('interval') interval: 'week' | 'month') {
    return this.adminService.getNewUsersStats(interval);
  }

  @Get('stats/frequency')
  @Roles('admin')
  getFrequencyStats() {
    return this.adminService.getFrequencyStats();
  }
}
