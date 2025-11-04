import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EventDocument = Event & Document;

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop()
  endDate?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Family', required: true })
  family: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Child' })
  child?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({
    default: 'shared',
    enum: ['shared', 'private'],
  })
  visibility: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  sharedWith: Types.ObjectId[];

  @Prop({ default: false })
  isRecurring: boolean;

  @Prop()
  recurrencePattern?: string;

  @Prop()
  recurrenceEndDate?: Date;

  @Prop({
    enum: ['appointment', 'school', 'activity', 'birthday', 'other'],
    default: 'other',
  })
  category: string;

  @Prop()
  location?: string;

  @Prop({ type: [Number], default: [] })
  reminders: number[];

  @Prop()
  color?: string;

  @Prop({ default: false })
  isAllDay: boolean;

  @Prop({ type: [String], default: [] })
  notes: string[];
}

export const EventSchema = SchemaFactory.createForClass(Event);
