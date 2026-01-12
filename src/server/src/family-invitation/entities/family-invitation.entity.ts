import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FamilyInvitationDocument = FamilyInvitation & Document;

@Schema({ timestamps: true })
export class FamilyInvitation {
  @Prop({ type: Types.ObjectId, ref: 'Family', required: true })
  familyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  invitedUser: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  invitedByUser: Types.ObjectId;

  @Prop({ required: true })
  status: 'pending' | 'accepted' | 'rejected' | 'expired';

  @Prop({ required: true, default: () => new Date() })
  createdAt: Date;

  @Prop()
  respondedAt?: Date;
}

export const FamilyInvitationSchema =
  SchemaFactory.createForClass(FamilyInvitation);
