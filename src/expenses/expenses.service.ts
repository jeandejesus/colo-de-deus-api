// src/expenses/expenses.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Expense, ExpenseDocument } from './schemas/expense.schema';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
  ) {}

  async create(userId: Types.ObjectId, expenseData: any): Promise<Expense> {
    const newExpense = new this.expenseModel({ ...expenseData, userId });
    return newExpense.save();
  }

  async findAll(userId: Types.ObjectId): Promise<Expense[]> {
    return this.expenseModel.find({ userId }).exec();
  }

  async findOne(id: string, userId: Types.ObjectId): Promise<Expense | null> {
    return this.expenseModel.findOne({ _id: id, userId }).exec();
  }

  async update(
    id: string,
    userId: Types.ObjectId,
    updateData: any,
  ): Promise<Expense | null> {
    return this.expenseModel
      .findOneAndUpdate({ _id: id, userId }, updateData, { new: true })
      .exec();
  }

  async remove(id: string, userId: Types.ObjectId): Promise<any> {
    return this.expenseModel.deleteOne({ _id: id, userId }).exec();
  }
}
