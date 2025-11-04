import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ForbiddenException } from '@nestjs/common';
import { type AuthenticatedRequest } from '../auth-check/auth-check.middleware'; // Importera den nya typen

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    if (!req.user) {
      throw new ForbiddenException('Access denied. Authentication required.');
    }
    return this.usersService.findAll();
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
}
