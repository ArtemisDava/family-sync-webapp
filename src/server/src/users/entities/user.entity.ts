import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password?: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: Date, required: true })
  birthDate: Date;

  @Prop({ required: true })
  color: string;

  @Prop()
  phoneNumber?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Family' }] })
  families: Types.ObjectId[];

  @Prop({ default: 'parent', enum: ['parent', 'child', 'relative'] })
  role: string;

  @Prop({ default: false })
  isAdmin: boolean;

  @Prop()
  deletedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
