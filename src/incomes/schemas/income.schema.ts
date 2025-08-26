// src/incomes/schemas/income.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Category } from 'src/categories/schema/category.schema';

@Schema()
export class Income {
  @Prop({ required: true })
  description!: string;

  @Prop({ required: true })
  value!: number;

  @Prop({ required: true })
  date!: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  userId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  category!: Category;
}

export type IncomeDocument = Income & Document;
export const IncomeSchema = SchemaFactory.createForClass(Income);
