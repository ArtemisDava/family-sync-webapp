import { PartialType } from '@nestjs/mapped-types';
import { CreateFamilyInvitationDto } from './create-family-invitation.dto';

export class UpdateFamilyInvitationDto extends PartialType(CreateFamilyInvitationDto) {}
