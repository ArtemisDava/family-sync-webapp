import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConnectionLogDocument = ConnectionLog & Document;

@Schema({ timestamps: true })
export class ConnectionLog {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  ipAddress: string;

  @Prop({ type: String, required: true })
  userAgent: string;

  @Prop({ type: Date, default: Date.now })
  connectedAt: Date;
}

export const ConnectionLogSchema = SchemaFactory.createForClass(ConnectionLog);
