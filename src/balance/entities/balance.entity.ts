// src/balance/entities/balance.entity.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BalanceDocument = HydratedDocument<Balance>;

@Schema()
export class Balance {
  @Prop({ required: true, default: 0 })
  value: number = 0;
}

export const BalanceSchema = SchemaFactory.createForClass(Balance);
