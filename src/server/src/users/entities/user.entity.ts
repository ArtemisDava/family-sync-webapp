import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

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

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);
    next();
  } catch (err) {
    next(err);
  }
});
