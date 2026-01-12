import { Injectable } from '@nestjs/common';
import { CreateFamilyInvitationDto } from './dto/create-family-invitation.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Family, FamilyDocument } from 'src/families/entities/family.entity';
import { Child, ChildDocument } from 'src/children/entities/child.entity';
import { User, UserDocument } from 'src/users/entities/user.entity';
import { EventDocument } from 'src/events/entities/event.entity';
import { Model } from 'mongoose';
import { FamilyInvitation } from './entities/family-invitation.entity';
import { FamiliesService } from 'src/families/families.service';

@Injectable()
export class FamilyInvitationService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Family.name) private familyModel: Model<FamilyDocument>,
    @InjectModel(FamilyInvitation.name)
    private familyInvitationModel: Model<FamilyInvitation>,
    @InjectModel(Child.name) private childModel: Model<ChildDocument>,
    private readonly familiesService: FamiliesService,
  ) {}

  async create(
    createFamilyInvitationDto: CreateFamilyInvitationDto,
    userId: string,
  ) {
    const existingInvitation = await this.familyInvitationModel.findOne({
      familyId: createFamilyInvitationDto.familyId,
      invitedUser: createFamilyInvitationDto.invitedUser,
      status: 'pending',
    });

    if (existingInvitation) {
      return existingInvitation;
    }

    const familyInvitation = new this.familyInvitationModel({
      ...createFamilyInvitationDto,
      invitedByUser: userId,
      status: 'pending',
    });

    return familyInvitation.save();
  }

  findAll(userId: string) {
    return this.familyInvitationModel
      .find({ invitedUser: userId })
      .populate('familyId invitedByUser')
      .exec();
  }

  async accept(id: string) {
    const invitation = await this.familyInvitationModel.findById(id).exec();
    if (!invitation) {
      throw new Error('Invitation not found');
    }

    invitation.status = 'accepted';
    invitation.respondedAt = new Date();
    await this.familiesService.addMember(
      invitation.familyId.toString(),
      invitation.invitedUser.toString(),
    );

    return invitation.save();
  }

  async reject(id: string) {
    const invitation = await this.familyInvitationModel.findById(id).exec();
    if (!invitation) {
      throw new Error('Invitation not found');
    }

    invitation.status = 'rejected';
    invitation.respondedAt = new Date();

    return invitation.save();
  }

  remove(id: number) {
    return `This action removes a #${id} familyInvitation`;
  }
}
