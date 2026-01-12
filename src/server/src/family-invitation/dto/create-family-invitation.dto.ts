import { IsMongoId, IsNotEmpty } from "class-validator";

export class CreateFamilyInvitationDto {
  @IsMongoId()
  @IsNotEmpty()
  familyId: string;
  @IsMongoId()
  @IsNotEmpty()
  invitedUser: string;
}
