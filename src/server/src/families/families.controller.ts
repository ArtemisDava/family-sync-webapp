import {
  Controller,
  Get,
  Post,
  Req,
  Body,
  Patch,
  UseGuards,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { FamiliesService } from './families.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { type AuthenticatedRequest } from '../auth-check/auth-check.middleware';
import { Roles, RolesGuard } from '../auth/role.guard';

@Controller('families')
@UseGuards(RolesGuard)
export class FamiliesController {
  constructor(private readonly familiesService: FamiliesService) {}

  // only for admin
  @Get()
  @Roles('admin')
  findAll() {
    return this.familiesService.findAll();
  }

  @Get('by-user')
  findByUserId(@Req() req: AuthenticatedRequest) {
    return this.familiesService.findByUserId(req.user?.userId);
  }

  // only parent/guardian or admin everything below
  @Post()
  create(
    @Body() createFamilyDto: CreateFamilyDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.familiesService.create(createFamilyDto, req.user?.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.familiesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFamilyDto: UpdateFamilyDto) {
    return this.familiesService.update(id, updateFamilyDto);
  }

  // only admins and parents can add/remove members
  @Post(':id/members')
  addMember(@Param('id') id: string, @Body() addMemberDto: AddMemberDto) {
    return this.familiesService.addMember(id, addMemberDto.userId);
  }

  @Delete(':id/members/:userId')
  removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.familiesService.removeMember(id, userId);
  }

  // delete account only for admins and users themselves
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.familiesService.remove(id);
  }

  @Post('join/:code')
  joinToTheFamily(
    @Param('code') code: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.familiesService.joinToTheFamily(code, req.user.userId);
  }
}
