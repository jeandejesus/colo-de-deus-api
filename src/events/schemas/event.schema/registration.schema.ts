import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Tipo para o Document do Mongoose
export type RegistrationDocument = Registration & Document;

@Schema({ timestamps: true })
export class Registration {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
  event!: Types.ObjectId;

  @Prop()
  qrCode!: string;
}

// Criar schema para injeção no módulo
export const RegistrationSchema = SchemaFactory.createForClass(Registration);
