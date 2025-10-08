// src/events/schemas/event.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { use } from 'passport';

export type ParticipantType = {
  user: Types.ObjectId;
  checkedIn: boolean;
  qrCode: string;
  userName?: string;
};

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

  @Prop({
    type: [
      {
        user: { type: Types.ObjectId, ref: 'User' },
        checkedIn: Boolean,
        qrCode: String,
        userName: String,
      },
    ],
  })
  participants!: ParticipantType[];
}

export const EventSchema = SchemaFactory.createForClass(Event);
