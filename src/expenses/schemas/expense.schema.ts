// src/expenses/schemas/expense.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Category } from 'src/categories/schema/category.schema';

@Schema()
export class Expense {
  @Prop({ required: true })
  description!: string;

  @Prop({ required: true })
  value!: number;

  @Prop({ required: true })
  date!: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  userId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category' }) // ⬅️ Campo alterado
  category!: Category;
}

export type ExpenseDocument = Expense & Document;
export const ExpenseSchema = SchemaFactory.createForClass(Expense);
