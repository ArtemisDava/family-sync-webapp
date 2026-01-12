import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event, EventDocument } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { User, UserDocument } from '../users/entities/user.entity';
import { Family, FamilyDocument } from '../families/entities/family.entity';
import { Child, ChildDocument } from '../children/entities/child.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Family.name) private familyModel: Model<FamilyDocument>,
    @InjectModel(Child.name) private childModel: Model<ChildDocument>,
  ) {}

  async create(createEventDto: CreateEventDto, userId: string): Promise<Event> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!Types.ObjectId.isValid(createEventDto.family)) {
      throw new BadRequestException('Invalid family ID');
    }

    const family = await this.familyModel.findById(createEventDto.family);
    if (!family) {
      throw new NotFoundException('Family not found');
    }

    if (!family.members.includes(new Types.ObjectId(userId))) {
      throw new ForbiddenException('User is not a member of the family');
    }

    const event = new this.eventModel({
      ...createEventDto,
      createdBy: userId,
      sharedWith:
        createEventDto.visibility === 'private'
          ? [userId]
          : createEventDto.sharedWith || [],
    });

    return event.save();
  }

  async findOne(id: string): Promise<Event> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid event ID');
    }

    const event = await this.eventModel.findById(id).exec();

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async findByFamily(familyId: string, userId?: string): Promise<Event[]> {
    if (!Types.ObjectId.isValid(familyId)) {
      throw new BadRequestException('Invalid family ID');
    }

    const query: any = { family: familyId };

    if (userId) {
      query.$or = [
        { visibility: 'shared' },
        { createdBy: userId },
        { sharedWith: userId },
      ];
    }

    return this.eventModel
      .find(query)
      .sort({ startDate: 1 })
      .populate('createdBy')
      .exec();
  }

  async findByChild(childId: string): Promise<Event[]> {
    if (!Types.ObjectId.isValid(childId)) {
      throw new BadRequestException('Invalid child ID');
    }

    return this.eventModel
      .find({ child: childId })
      .sort({ startDate: 1 })
      .exec();
  }

  async findByUser(userId: string): Promise<Event[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    return this.eventModel
      .find({
        $or: [{ createdBy: userId }, { sharedWith: userId }],
      })
      .sort({ startDate: 1 })
      .exec();
  }

  async findByDateRange(
    startDate: string,
    endDate: string,
    familyId?: string,
    userId?: string,
  ): Promise<Event[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid startDate or endDate');
    }

    if (!familyId && !userId) {
      throw new BadRequestException(
        'Either familyId or userId must be provided',
      );
    }
    const query: any = {
      startDate: {
        $gte: start,
        $lte: end,
      },
    };

    if (familyId) {
      if (!Types.ObjectId.isValid(familyId)) {
        throw new BadRequestException('Invalid family ID');
      }
      query.family = familyId;
    }

    if (userId) {
      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID');
      }
      query.$or = [{ user: userId }, { sharedWith: userId }];
    }

    return this.eventModel.find(query).sort({ startDate: 1 }).exec();
  }

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
    userId: string,
  ): Promise<Event> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid event ID');
    }

    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const existingEvent = await this.eventModel.findById(id);
    if (!existingEvent) {
      throw new NotFoundException('Event not found');
    }

    if (existingEvent.createdBy.toString() !== userId) {
      throw new ForbiddenException('You can only update your own events');
    }

    if (updateEventDto.family) {
      if (!Types.ObjectId.isValid(updateEventDto.family)) {
        throw new BadRequestException('Invalid family ID');
      }

      const family = await this.familyModel.findById(updateEventDto.family);
      if (!family) {
        throw new NotFoundException('Family not found');
      }
      if (!family.members.includes(new Types.ObjectId(userId))) {
        throw new ForbiddenException(
          'User is not a member of the specified family',
        );
      }
    }

    if (updateEventDto.child) {
      if (!Types.ObjectId.isValid(updateEventDto.child)) {
        throw new BadRequestException('Invalid child ID');
      }

      const child = await this.childModel.findById(updateEventDto.child);
      if (!child) {
        throw new NotFoundException('Child not found');
      }

      const targetFamilyId =
        updateEventDto.family || existingEvent.family.toString();
      if (child.family.toString() !== targetFamilyId) {
        throw new BadRequestException(
          'Child does not belong to the specified family',
        );
      }
    }

    const event = await this.eventModel
      .findByIdAndUpdate(id, updateEventDto, { new: true })
      .exec();

    return event!;
  }

  async remove(id: string, userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid event ID');
    }

    const event = await this.eventModel.findById(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.createdBy.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own events');
    }

    await this.eventModel.findByIdAndDelete(id);
  }

  async createForChild(
    childId: string,
    createEventDto: CreateEventDto,
    userId: string,
  ): Promise<Event> {
    if (!Types.ObjectId.isValid(childId)) {
      throw new BadRequestException('Invalid child ID');
    }

    const child = await this.childModel
      .findById(childId)
      .populate<{ family: FamilyDocument }>('family')
      .exec();
    if (!child) {
      throw new NotFoundException('Child not found');
    }
    const hasUserIdInFamily = child.family.members.some(
      (member) => member._id.toString() === userId,
    );

    if (!hasUserIdInFamily) {
      throw new ForbiddenException(
        'User is not a member of the family associated with the child',
      );
    }

    createEventDto.child = childId;
    createEventDto.family = String(child.family._id);
    return this.create(createEventDto, userId);
  }

  async createForAdult(
    familyId: string,
    createEventDto: CreateEventDto,
    userId: string,
  ): Promise<Event> {
    const adult = await this.userModel
      .findById(userId)
      .populate<{ families: FamilyDocument[] }>('families')
      .exec();

    if (!adult) {
      throw new NotFoundException('Adult not found');
    }

    createEventDto.adult = userId;
    createEventDto.family = familyId;

    return this.create(createEventDto, userId);
  }

  async findByAdult(familyId: string, userId: string): Promise<Event[]> {
    if (!Types.ObjectId.isValid(familyId)) {
      throw new BadRequestException('Invalid family ID');
    }

    const query: {
      family: string;
      $or: (
        | { visibility: string }
        | { createdBy: string }
        | { sharedWith: string }
      )[];
    } = { family: familyId, $or: [] };

    if (userId) {
      query.$or = [
        { visibility: 'shared' },
        { createdBy: userId },
        { sharedWith: userId },
      ];
    }
    return this.eventModel
      .find(query)
      .sort({ startDate: 1 })
      .populate('createdBy')
      .exec();
  }
}
