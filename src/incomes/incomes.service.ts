// src/incomes/incomes.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Income, IncomeDocument } from './schemas/income.schema';

@Injectable()
export class IncomesService {
  constructor(
    @InjectModel(Income.name) private incomeModel: Model<IncomeDocument>,
  ) {}

  async create(userId: Types.ObjectId, incomeData: any): Promise<Income> {
    const newIncome = new this.incomeModel({ ...incomeData, userId });
    return newIncome.save();
  }

  async findAll(userId: Types.ObjectId): Promise<Income[]> {
    return this.incomeModel.find({ userId }).exec();
  }

  async findOne(id: string, userId: Types.ObjectId): Promise<Income | null> {
    return this.incomeModel.findOne({ _id: id, userId }).exec();
  }

  async update(
    id: string,
    userId: Types.ObjectId,
    updateData: any,
  ): Promise<Income | null> {
    return this.incomeModel
      .findOneAndUpdate({ _id: id, userId }, updateData, { new: true })
      .exec();
  }

  async remove(id: string, userId: Types.ObjectId): Promise<any> {
    return this.incomeModel.deleteOne({ _id: id, userId }).exec();
  }
}
