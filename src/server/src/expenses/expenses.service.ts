import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Expense, ExpenseDocument } from './entities/expense.entity';
import { User, UserDocument } from '../users/entities/user.entity';
import { Family, FamilyDocument } from '../families/entities/family.entity';
import { Child, ChildDocument } from '../children/entities/child.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { share } from 'rxjs';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Family.name) private familyModel: Model<FamilyDocument>,
    @InjectModel(Child.name) private childModel: Model<ChildDocument>,
  ) {}

  private async $validateExpensePrerequisites(
    userId: string,
    familyId: string,
    childrensIds?: string[],
    sharedWithIds?: string[],
  ): Promise<void> {
    // Validate user
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    // Check existence of user
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check existence of family
    const family = await this.familyModel.findById(familyId);
    if (!family) {
      throw new NotFoundException('Family not found');
    }

    // check that user is member of family
    const isMember = family.members.some(
      (memberId) => memberId.toString() === userId,
    );
    if (!isMember) {
      throw new ForbiddenException('User is not a member of the family');
    }

    // check if childId is provided, if it is, validate it and check that child belongs to family
    if (childrensIds) {
      for (const childId of childrensIds) {
        const child = await this.childModel.findById(childId);
        if (!child) {
          throw new NotFoundException('Child not found');
        }

        const isChildMember = family.children.some(
          (child) => child.toString() === childId,
        );
        if (!isChildMember) {
          throw new ForbiddenException('Child is not a member of the family');
        }
      }
    }

    if (sharedWithIds) {
      for (const sharedWithId of sharedWithIds) {
        const isSharedUserMember = family.members.some(
          (isSharedUserMember) =>
            isSharedUserMember.toString() === sharedWithId,
        );
        if (!isSharedUserMember) {
          throw new ForbiddenException(
            'The shared user is not a member of the family',
          );
        }
      }
    }
  }

  async create(
    createExpenseDto: CreateExpenseDto,
    userId: string,
  ): Promise<Expense> {
    await this.$validateExpensePrerequisites(
      userId,
      createExpenseDto.family,
      createExpenseDto.child,
      createExpenseDto.sharedWith,
    );

    const expense = new this.expenseModel({
      ...createExpenseDto,
      paidBy: userId,
    });

    return expense.save();
  }

  async findOne(id: string): Promise<Expense> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid expense ID');
    }

    const expense = await this.expenseModel.findById(id).exec();

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return expense;
  }

  async findByFamily(familyId: string): Promise<Expense[]> {
    if (!Types.ObjectId.isValid(familyId)) {
      throw new BadRequestException('Invalid family ID');
    }

    return this.expenseModel
      .find({ family: familyId })
      .sort({ date: -1 })
      .exec();
  }

  async findByChild(childId: string): Promise<Expense[]> {
    if (!Types.ObjectId.isValid(childId)) {
      throw new BadRequestException('Invalid child ID');
    }

    return this.expenseModel.find({ child: childId }).sort({ date: -1 }).exec();
  }

  async findByPaidBy(userId: string): Promise<Expense[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    return this.expenseModel.find({ paidBy: userId }).sort({ date: -1 }).exec();
  }

  async findSharedWith(userId: string): Promise<Expense[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    return this.expenseModel
      .find({ sharedWith: userId })
      .sort({ date: -1 })
      .exec();
  }

  async update(
    id: string,
    updateExpenseDto: UpdateExpenseDto,
    userId: string,
  ): Promise<Expense> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid expense ID');
    }

    const existingExpense = await this.expenseModel.findById(id);
    if (!existingExpense) {
      throw new NotFoundException('Expense not found');
    }

    const FamilyId =
      updateExpenseDto.family || existingExpense.family.toString();

    const ChildId =
      updateExpenseDto.child?.map((id) => id.toString()) ||
      existingExpense.child?.map((id) => id.toString());

    const sharedWithIds =
      updateExpenseDto.sharedWith?.map((id) => id.toString()) ||
      existingExpense.sharedWith?.map((id) => id.toString());

    await this.$validateExpensePrerequisites(
      userId,
      FamilyId,
      ChildId,
      sharedWithIds,
    );

    const updatedExpense = await this.expenseModel
      .findByIdAndUpdate(id, { $set: updateExpenseDto }, { new: true })
      .exec();

    return updatedExpense!;
  }

  // fix
  async remove(id: string, userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid expense ID');
    }

    const expense = await this.expenseModel.findById(id);
    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    if (expense.paidBy.toString() !== userId) {
      throw new ForbiddenException('You can only delete expenses you created');
    }

    await this.expenseModel.findByIdAndDelete(id);
  }
}
