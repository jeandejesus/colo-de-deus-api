// src/events/schemas/event.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EventDocument = Event & Document;

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true })
  title!: string;

  @Prop()
  description!: string;

  @Prop({ required: true })
  startDate!: Date;

  @Prop({ required: true })
  endDate!: Date;

  @Prop()
  location!: string;

  @Prop()
  maxParticipants!: number;

  @Prop([
    {
      user: { type: String, required: true }, // depois pode ser ObjectId do User
      checkedIn: { type: Boolean, default: false },
      qrCode: { type: String, required: true },
    },
  ])
  participants!: any[];
}

export const EventSchema = SchemaFactory.createForClass(Event);
