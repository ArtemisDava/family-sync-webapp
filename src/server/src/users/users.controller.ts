import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { ForbiddenException } from '@nestjs/common';
import { type AuthenticatedRequest } from '../auth-check/auth-check.middleware';
import { Roles, RolesGuard } from 'src/auth/role.guard';

@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles('admin')
  findAll(@Req() req: AuthenticatedRequest) {
    if (!req.user) {
      throw new ForbiddenException('Access denied. Authentication required.');
    }
    return this.usersService.findAll();
  }

  @Get('search')
  searchByName(@Query('name') name: string, @Req() req: AuthenticatedRequest) {
    if (!req.user) {
      throw new ForbiddenException('Access denied. Authentication required.');
    }
    if (!name || name.trim().length === 0) {
      return [];
    }
    return this.usersService.searchByName(name);
  }

  @Patch()
  update(
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!req.user) {
      throw new ForbiddenException('Authentication required to update a user.');
    }

    return this.usersService.update(req.user?.userId, updateUserDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    if (req.user.userId != id) {
      throw new ForbiddenException('Authentication required to delete a user.');
    }

    return this.usersService.remove(id);
  }

  @Post('admin/create')
  @Roles('admin')
  adminCreateUser(
    @Body() adminCreateUserDto: AdminCreateUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!req.user) {
      throw new ForbiddenException('Access denied. Authentication required.');
    }
    return this.usersService.adminCreateUser(adminCreateUserDto);
  }

  @Patch('admin/:id/update')
  @Roles('admin')
  adminUpdateUser(
    @Param('id') id: string,
    @Body() adminUpdateUserDto: AdminUpdateUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!req.user) {
      throw new ForbiddenException('Access denied. Authentication required.');
    }
    return this.usersService.adminUpdateUser(id, adminUpdateUserDto);
  }

  @Patch('admin/:id/disable')
  @Roles('admin')
  disableUser(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    if (!req.user) {
      throw new ForbiddenException('Access denied. Authentication required.');
    }
    return this.usersService.disableUser(id);
  }

  @Patch('admin/:id/enable')
  @Roles('admin')
  enableUser(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    if (!req.user) {
      throw new ForbiddenException('Access denied. Authentication required.');
    }
    return this.usersService.enableUser(id);
  }

  @Delete('admin/:id/delete')
  @Roles('admin')
  adminDeleteUser(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    if (!req.user) {
      throw new ForbiddenException('Access denied. Authentication required.');
    }
    return this.usersService.adminDeleteUser(id);
  }
}
