import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExpenseDocument = Expense & Document;

@Schema({ timestamps: true })
export class Expense {
  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ type: Types.ObjectId, ref: 'Family', required: true })
  family: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Child' }] })
  child?: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  paidBy: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  sharedWith: Types.ObjectId[];

  @Prop({
    enum: [
      'healthcare',
      'school',
      'activity',
      'clothing',
      'food',
      'transport',
      'entertainment',
      'other',
    ],
    default: 'other',
  })
  category: string;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
