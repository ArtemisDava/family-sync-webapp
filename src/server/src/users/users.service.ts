import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { FamilyInvitationService } from 'src/family-invitation/family-invitation.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly familyInvitationService: FamilyInvitationService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await user.save();

    if (createUserDto.invite) {
      try {
        const [familyId, invitedByUserId] = createUserDto.invite.split('-');
        if (familyId && invitedByUserId) {
          const invitation = await this.familyInvitationService.create(
            {
              familyId,
              invitedUser: savedUser._id.toString(),
            },
            invitedByUserId,
          );
          await this.familyInvitationService.accept(invitation._id.toString());
        }
      } catch (error) {
        console.error('Error processing invitation during signup:', error);
      }
    }

    return savedUser.toObject({
      transform: (doc, ret: Partial<UserDocument>) => {
        delete ret.password;
        return ret;
      },
    });
  }

  async findAll(): Promise<User[]> {
    return this.userModel
      .find()
      .select('-password')
      .populate('families')
      .exec();
  }

  async findOne(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  async getUserCount(): Promise<number> {
    return this.userModel.countDocuments().exec();
  }

  async getAdminCount(): Promise<number> {
    return this.userModel.countDocuments({ isAdmin: true }).exec();
  }

  async searchByName(name: string): Promise<User[]> {
    return this.userModel
      .find({
        name: { $regex: name, $options: 'i' },
        deletedAt: { $exists: false },
      })
      .select('-password')
      .limit(10)
      .exec();
  }

  async adminCreateUser(adminCreateUserDto: AdminCreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({
      email: adminCreateUserDto.email,
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(adminCreateUserDto.password, 10);

    const user = new this.userModel({
      ...adminCreateUserDto,
      password: hashedPassword,
    });

    const savedUser = await user.save();

    return savedUser.toObject({
      transform: (doc, ret: Partial<UserDocument>) => {
        delete ret.password;
        return ret;
      },
    });
  }

  async adminUpdateUser(
    id: string,
    adminUpdateUserDto: AdminUpdateUserDto,
  ): Promise<User> {
    if (adminUpdateUserDto.email) {
      const existingUser = await this.userModel.findOne({
        email: adminUpdateUserDto.email,
        _id: { $ne: id },
      });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    const user = await this.userModel
      .findByIdAndUpdate(id, adminUpdateUserDto, { new: true })
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async disableUser(id: string): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true })
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async enableUser(id: string): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { $unset: { deletedAt: 1 } }, { new: true })
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async adminDeleteUser(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }
}
