// src/expenses/schemas/expense.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Category } from 'src/categories/schema/category.schema';

@Schema()
export class Expense {
  // Adicione a mensagem de erro ao validador 'required'
  @Prop({ required: [true, 'A descrição é obrigatória.'] })
  description!: string;

  // Adicione a mensagem de erro ao validador 'required'
  @Prop({ required: [true, 'O valor é obrigatório.'] })
  value!: number;

  // Adicione a mensagem de erro ao validador 'required'
  @Prop({ required: [true, 'A data é obrigatória.'] })
  date!: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  userId?: Types.ObjectId;

  // Adicione a mensagem de erro ao validador 'required' do campo de categoria
  @Prop({
    type: Types.ObjectId,
    ref: 'Category',
    required: [true, 'A categoria é obrigatória.'],
  })
  category!: Category;
}

export type ExpenseDocument = Expense & Document;
export const ExpenseSchema = SchemaFactory.createForClass(Expense);
