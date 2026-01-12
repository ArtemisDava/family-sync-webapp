import { Test, TestingModule } from '@nestjs/testing';
import { ExpensesService } from './expenses.service';
import { getModelToken } from '@nestjs/mongoose';
import { Expense } from './entities/expense.entity';
import { User } from '../users/entities/user.entity';
import { Family } from '../families/entities/family.entity';
import { Child } from '../children/entities/child.entity';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Types } from 'mongoose';

describe('ExpensesService', () => {
  let service: ExpensesService;
  let expenseModel: any;
  let userModel: any;
  let familyModel: any;
  let childModel: any;

  const userId = new Types.ObjectId().toString();
  const familyId = new Types.ObjectId().toString();
  const expenseId = new Types.ObjectId().toString();

  const mockExpense = {
    _id: expenseId,
    title: 'Test Expense',
    amount: 100,
    family: familyId,
    paidBy: userId,
    date: new Date(),
    category: 'food',
    save: jest.fn(),
  };

  const mockUser = {
    _id: userId,
    name: 'Test User',
    email: 'test@example.com',
  };

  const mockFamily = {
    _id: familyId,
    name: 'Test Family',
    members: [new Types.ObjectId(userId)],
    children: [],
  };

  const mockExpenseModel = jest.fn(() => ({
    ...mockExpense,
    save: jest.fn().mockResolvedValue(mockExpense),
  }));

  Object.assign(mockExpenseModel, {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  });

  const mockUserModel = {
    findById: jest.fn(),
  };

  const mockFamilyModel = {
    findById: jest.fn(),
  };

  const mockChildModel = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        { provide: getModelToken(Expense.name), useValue: mockExpenseModel },
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: getModelToken(Family.name), useValue: mockFamilyModel },
        { provide: getModelToken(Child.name), useValue: mockChildModel },
      ],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
    expenseModel = module.get(getModelToken(Expense.name));
    userModel = module.get(getModelToken(User.name));
    familyModel = module.get(getModelToken(Family.name));
    childModel = module.get(getModelToken(Child.name));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return an expense by ID', async () => {
      expenseModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockExpense),
      });

      const result = await service.findOne(expenseId);
      expect(result).toEqual(mockExpense);
    });

    it('should throw BadRequestException for invalid ID', async () => {
      await expect(service.findOne('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if expense not found', async () => {
      expenseModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne(expenseId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByFamily', () => {
    it('should return expenses for a family', async () => {
      expenseModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockExpense]),
        }),
      });

      const result = await service.findByFamily(familyId);
      expect(result).toEqual([mockExpense]);
    });

    it('should throw BadRequestException for invalid family ID', async () => {
      await expect(service.findByFamily('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findByPaidBy', () => {
    it('should return expenses paid by a user', async () => {
      expenseModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockExpense]),
        }),
      });

      const result = await service.findByPaidBy(userId);
      expect(result).toEqual([mockExpense]);
    });

    it('should throw BadRequestException for invalid user ID', async () => {
      await expect(service.findByPaidBy('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('remove', () => {
    it('should remove an expense', async () => {
      expenseModel.findById.mockResolvedValue({
        ...mockExpense,
        paidBy: { toString: () => userId },
      });
      expenseModel.findByIdAndDelete.mockResolvedValue(mockExpense);

      await expect(service.remove(expenseId, userId)).resolves.toBeUndefined();
    });

    it('should throw BadRequestException for invalid expense ID', async () => {
      await expect(service.remove('invalid-id', userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if expense not found', async () => {
      expenseModel.findById.mockResolvedValue(null);

      await expect(service.remove(expenseId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user did not create the expense', async () => {
      const otherUserId = new Types.ObjectId().toString();
      expenseModel.findById.mockResolvedValue({
        ...mockExpense,
        paidBy: { toString: () => otherUserId },
      });

      await expect(service.remove(expenseId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
