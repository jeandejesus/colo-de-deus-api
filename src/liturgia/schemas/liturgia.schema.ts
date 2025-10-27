import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LiturgiaDocument = Liturgia & Document;

@Schema({ timestamps: true })
export class Liturgia {
  @Prop({ required: true, unique: true })
  date!: string; // YYYY-MM-DD

  @Prop()
  primeira_leitura!: string;

  @Prop()
  salmo!: string;

  @Prop()
  segunda_leitura!: string;

  @Prop()
  evangelho!: string;
  @Prop()
  reflexao!: string;
}

export const LiturgiaSchema = SchemaFactory.createForClass(Liturgia);
