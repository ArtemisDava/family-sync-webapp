import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChildDocument = Child & Document;

@Schema({ timestamps: true })
export class Child {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  birthDate: Date;

  @Prop()
  color?: string;

  @Prop({ type: Types.ObjectId, ref: 'Family', required: true })
  family: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  guardians: Types.ObjectId[];

  @Prop()
  avatar?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const ChildSchema = SchemaFactory.createForClass(Child);
