// src/expenses/expenses.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BalanceService } from '../balance/balance.service';
import { Expense } from './schemas/expense.schema';
import { CreateExpensesDto } from './dto/create-expenses.dto';
import { UpdateExpensesDto } from './dto/update-expenses.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<Expense>,
    private balanceService: BalanceService, // ⬅️ Injete o BalanceService
  ) {}

  async create(createExpenseDto: CreateExpensesDto): Promise<Expense> {
    const createdExpense = new this.expenseModel(createExpenseDto);
    await createdExpense.save();

    await this.balanceService.updateBalance(-createdExpense.value); // ⬅️ Subtrai do saldo

    return createdExpense;
  }

  async findAll(): Promise<Expense[]> {
    return this.expenseModel.find().exec();
  }

  async findOne(id: string): Promise<Expense> {
    const expense = await this.expenseModel.findById(id).exec();
    if (!expense) {
      throw new NotFoundException(`Expense with ID "${id}" not found`);
    }
    return expense;
  }

  async update(
    id: string,
    updateExpenseDto: UpdateExpensesDto,
  ): Promise<Expense> {
    const existingExpense = await this.findOne(id);
    const oldValue = existingExpense.value;

    // Atualiza o documento no banco de dados
    const updatedExpense = await this.expenseModel
      .findByIdAndUpdate(id, updateExpenseDto, { new: true })
      .exec();

    if (!updatedExpense) {
      throw new NotFoundException(`Expense with ID "${id}" not found`);
    }

    const newValue = updatedExpense.value;
    const difference = newValue - oldValue;

    await this.balanceService.updateBalance(-difference); // ⬅️ Atualiza o saldo com a diferença negativa

    return updatedExpense;
  }

  async remove(id: string): Promise<any> {
    const expense = await this.findOne(id);
    const removedExpense = await this.expenseModel.findByIdAndDelete(id).exec();

    await this.balanceService.updateBalance(expense.value); // ⬅️ Adiciona de volta ao saldo

    return removedExpense;
  }
}
