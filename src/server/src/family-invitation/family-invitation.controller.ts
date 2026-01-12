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
import { FamilyInvitationService } from './family-invitation.service';
import { CreateFamilyInvitationDto } from './dto/create-family-invitation.dto';
import { UpdateFamilyInvitationDto } from './dto/update-family-invitation.dto';
import { type AuthenticatedRequest } from 'src/auth-check/auth-check.middleware';

@Controller('family-invitation')
export class FamilyInvitationController {
  constructor(
    private readonly familyInvitationService: FamilyInvitationService,
  ) {}

  @Post()
  create(
    @Body() createFamilyInvitationDto: CreateFamilyInvitationDto,
    @Req() { user }: AuthenticatedRequest,
  ) {
    return this.familyInvitationService.create(
      createFamilyInvitationDto,
      user.userId,
    );
  }

  @Get()
  findAll(@Req() { user }: AuthenticatedRequest) {
    return this.familyInvitationService.findAll(user.userId);
  }

  @Post(':id/accept')
  accept(@Param('id') id: string, @Req() { user }: AuthenticatedRequest) {
    return this.familyInvitationService.accept(id);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string, @Req() { user }: AuthenticatedRequest) {
    return this.familyInvitationService.reject(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.familyInvitationService.remove(+id);
  }
}
