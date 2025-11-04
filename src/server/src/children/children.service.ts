import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Child, ChildDocument } from './entities/child.entity';
import { Family, FamilyDocument } from '../families/entities/family.entity';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';

@Injectable()
export class ChildrenService {
  constructor(
    @InjectModel(Child.name) private childModel: Model<ChildDocument>,
    @InjectModel(Family.name) private familyModel: Model<FamilyDocument>,
  ) {}

  async create(createChildDto: CreateChildDto): Promise<Child> {
    // Validera att family finns
    const family = await this.familyModel.findById(createChildDto.family);
    if (!family) {
      throw new NotFoundException('Family not found');
    }

    // Skapa child
    const child = new this.childModel(createChildDto);
    await child.save();

    // Lägg till child i family
    await this.familyModel.findByIdAndUpdate(createChildDto.family, {
      $addToSet: { children: child._id },
    });

    return child;
  }

  async findAll(): Promise<Child[]> {
    return this.childModel
      .find()
      .populate('family', 'name')
      .populate('guardians', '-password')
      .exec();
  }

  async findOne(id: string): Promise<Child> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid child ID');
    }

    const child = await this.childModel
      .findById(id)
      .populate('family', 'name')
      // .populate('guardians', 'name email -password')
      .populate('guardians', '-password')
      .exec();

    if (!child) {
      throw new NotFoundException('Child not found');
    }

    return child;
  }

  async update(id: string, updateChildDto: UpdateChildDto): Promise<Child> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid child ID');
    }

    if (updateChildDto.guardians?.length === 0) {
      // Vad är bättre, ett fel eller att ta bort barnet?
      throw new BadRequestException('A child must have at least one guardian');
    }

    const child = await this.childModel
      .findByIdAndUpdate(id, updateChildDto, { new: true })
      .populate('family', 'name')
      .populate('guardians', '-password')
      .exec();

    if (!child) {
      throw new NotFoundException('Child not found');
    }

    return child;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid child ID');
    }

    const child = await this.childModel.findById(id);
    if (!child) {
      throw new NotFoundException('Child not found');
    }

    // Ta bort från family
    await this.familyModel.findByIdAndUpdate(child.family, {
      $pull: { children: child._id },
    });

    // Ta bort child
    await this.childModel.findByIdAndDelete(id);
  }

  //  nice to have Beräkna ålder
  // async getAge(id: string): Promise<number> {
  //   const child = await this.findOne(id);
  //   const today = new Date();
  //   const birthDate = new Date(child.birthDate);
  //   let age = today.getFullYear() - birthDate.getFullYear();
  //   const monthDiff = today.getMonth() - birthDate.getMonth();

  //   if (
  //     monthDiff < 0 ||
  //     (monthDiff === 0 && today.getDate() < birthDate.getDate())
  //   ) {
  //     age--;
  //   }

  //   return age;
  // }

  // async findByFamily(familyId: string): Promise<Child[]> {
  //   if (!Types.ObjectId.isValid(familyId)) {
  //     throw new BadRequestException('Invalid family ID');
  //   }

  //   return this.childModel
  //     .find({ family: familyId })
  //     .populate('guardians', '-password')
  //     .exec();
  // }
}
