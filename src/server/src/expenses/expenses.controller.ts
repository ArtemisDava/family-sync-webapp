import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  create(
    @Body() createExpenseDto: CreateExpenseDto,
    @Query('userId') userId?: string, // Temporärt - senare från JWT
  ) {
    if (!userId) {
      throw new BadRequestException('userId  is required');
    }
    return this.expensesService.create(createExpenseDto, userId);
  }

  @Get('family/:familyId')
  findByFamily(@Param('familyId') familyId: string) {
    return this.expensesService.findByFamily(familyId);
  }

  @Get('child/:childId')
  findByChild(@Param('childId') childId: string) {
    return this.expensesService.findByChild(childId);
  }

  @Get('paid-by/:userId')
  findByPaidBy(@Param('userId') userId: string) {
    return this.expensesService.findByPaidBy(userId);
  }

  @Get('shared-with/:userId')
  findSharedWith(@Param('userId') userId: string) {
    return this.expensesService.findSharedWith(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expensesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @Query('userId') userId: string,
  ) {
    return this.expensesService.update(id, updateExpenseDto, userId);
  }

  //TODO: FIX "You can only delete expenses you created"
  @Delete(':id')
  remove(@Param('id') id: string, @Query('userId') userId: string) {
    return this.expensesService.remove(id, userId);
  }
}
