// src/categories/schema/category.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

export enum CategoryType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

@Schema()
export class Category {
  @Prop({ required: true, unique: true }) // ⬅️ Adicione o decorador @Prop() aqui
  name!: string;

  @Prop({ required: true, enum: CategoryType }) // ⬅️ Adicione o decorador @Prop() e o enum aqui
  type!: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
