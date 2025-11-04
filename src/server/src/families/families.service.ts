import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Family, FamilyDocument } from './entities/family.entity';
import { User, UserDocument } from '../users/entities/user.entity';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';

@Injectable()
export class FamiliesService {
  constructor(
    @InjectModel(Family.name) private familyModel: Model<FamilyDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(
    createFamilyDto: CreateFamilyDto,
    userId: string,
  ): Promise<Family> {
    // Skapa family och lägg till skaparen som medlem automatiskt
    const family = new this.familyModel({
      ...createFamilyDto,
      createdBy: userId,
      members: [userId, ...(createFamilyDto.members || [])],
    });

    const savedFamily = await family.save();

    const allMembers = [userId, ...(createFamilyDto.members || [])];
    await this.userModel.updateMany(
      { _id: { $in: allMembers } },
      { $addToSet: { families: family._id } },
    );

    return savedFamily;
  }

  async findAll(): Promise<Family[]> {
    return (
      this.familyModel
        .find()
        .populate('members', '-password') // Populera users utan lösenord
        .populate('children')
        // .populate('createdBy', '-password')
        .exec()
    );
  }

  async findOne(id: string): Promise<Family> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid family ID');
    }

    const family = await this.familyModel
      .findById(id)
      .populate('members', '-password')
      .populate('children')
      // .populate('createdBy', '-password')
      .exec();

    if (!family) {
      throw new NotFoundException('Family not found');
    }

    return family;
  }

  async findByUserId(userId: string): Promise<Family[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }
    return this.familyModel
      .find({ members: userId })
      .populate('members', '-password')
      .populate('children')
      .exec();
  }

  async update(id: string, updateFamilyDto: UpdateFamilyDto): Promise<Family> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid family ID');
    }

    const family = await this.familyModel
      .findByIdAndUpdate(id, updateFamilyDto, { new: true })
      // .populate('members', '-password')
      // .populate('children')
      .exec();

    if (!family) {
      throw new NotFoundException('Family not found');
    }

    return family;
  }

  async addMember(familyId: string, userId: string): Promise<Family> {
    if (!Types.ObjectId.isValid(familyId) || !Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid ID');
    }

    const family = await this.familyModel
      .findByIdAndUpdate(
        familyId,
        { $addToSet: { members: userId } },
        { new: true },
      )
      .populate('members', '-password')
      .exec();

    if (!family) {
      throw new NotFoundException('Family not found');
    }

    await this.userModel.findByIdAndUpdate(userId, {
      $addToSet: { families: familyId },
    });

    return family;
  }

  async removeMember(familyId: string, userId: string): Promise<Family> {
    if (!Types.ObjectId.isValid(familyId) || !Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid ID');
    }

    const family = await this.familyModel
      .findByIdAndUpdate(
        familyId,
        { $pull: { members: userId } },
        { new: true },
      )
      .populate('members', '-password')
      .exec();

    if (!family) {
      throw new NotFoundException('Family not found');
    }

    await this.userModel.findByIdAndUpdate(userId, {
      $pull: { families: familyId },
    });

    return family;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid family ID');
    }

    const result = await this.familyModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Family not found');
    }
  }

  async joinToTheFamily(code: string, userId: string): Promise<Family> {
    const family = await this.familyModel
      .findByIdAndUpdate(
        code,
        { $addToSet: { members: userId } },
        { new: true },
      )
      .populate('members', '-password')
      .exec();

    if (!family) {
      throw new NotFoundException('Family not found with the provided code');
    }
    await this.userModel.findByIdAndUpdate(userId, {
      $addToSet: { families: family._id },
    });
    return family;
  }
}
