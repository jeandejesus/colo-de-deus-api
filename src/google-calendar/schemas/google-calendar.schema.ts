// src/expenses/schemas/expense.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class GoogleCalendar {
  @Prop()
  googleEventId!: string;

  @Prop({ required: [true, 'O status é obrigatório.'] })
  status!: string;

  @Prop({ required: [true, 'O tipo de missão é obrigatório.'] })
  typeMission!: string;
}

export type GoogleCalendarDocument = GoogleCalendar & Document;
export const GoogleCalendarSchema =
  SchemaFactory.createForClass(GoogleCalendar);
