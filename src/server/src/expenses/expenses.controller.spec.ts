import { Test, TestingModule } from '@nestjs/testing';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { Types } from 'mongoose';

describe('ExpensesController', () => {
  let controller: ExpensesController;
  let service: jest.Mocked<Partial<ExpensesService>>;

  const expenseId = new Types.ObjectId().toString();
  const familyId = new Types.ObjectId().toString();
  const userId = new Types.ObjectId().toString();

  const mockExpense = {
    _id: expenseId,
    title: 'Test Expense',
    amount: 100,
    family: familyId,
    paidBy: userId,
    category: 'food',
    date: new Date(),
  };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findOne: jest.fn(),
      findByFamily: jest.fn(),
      findByChild: jest.fn(),
      findByPaidBy: jest.fn(),
      findSharedWith: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpensesController],
      providers: [{ provide: ExpensesService, useValue: service }],
    }).compile();

    controller = module.get<ExpensesController>(ExpensesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should return an expense by ID', async () => {
      service.findOne!.mockResolvedValue(mockExpense as any);

      const result = await controller.findOne(expenseId);

      expect(result).toEqual(mockExpense);
      expect(service.findOne).toHaveBeenCalledWith(expenseId);
    });
  });

  describe('findByFamily', () => {
    it('should return expenses for a family', async () => {
      service.findByFamily!.mockResolvedValue([mockExpense] as any);

      const result = await controller.findByFamily(familyId);

      expect(result).toEqual([mockExpense]);
      expect(service.findByFamily).toHaveBeenCalledWith(familyId);
    });
  });

  describe('findByPaidBy', () => {
    it('should return expenses paid by a user', async () => {
      service.findByPaidBy!.mockResolvedValue([mockExpense] as any);

      const result = await controller.findByPaidBy(userId);

      expect(result).toEqual([mockExpense]);
      expect(service.findByPaidBy).toHaveBeenCalledWith(userId);
    });
  });

  describe('remove', () => {
    it('should remove an expense', async () => {
      service.remove!.mockResolvedValue(undefined);

      await controller.remove(expenseId, userId);

      expect(service.remove).toHaveBeenCalledWith(expenseId, userId);
    });
  });
});
