// src/notifications/schemas/push-subscription.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class PushSubscription {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId!: string; // Adicione o '!'

  @Prop({ type: Object, required: true })
  subscription!: object; // Adicione o '!'
}

export type PushSubscriptionDocument = PushSubscription & Document;
export const PushSubscriptionSchema = SchemaFactory.createForClass(PushSubscription);
