// src/incomes/incomes.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BalanceService } from '../balance/balance.service';
import { Income } from './schemas/income.schema';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
@Injectable()
export class IncomesService {
  constructor(
    @InjectModel(Income.name) private incomeModel: Model<Income>,
    private balanceService: BalanceService, // ⬅️ Injete o BalanceService
  ) {}

  async create(createIncomeDto: CreateIncomeDto): Promise<Income> {
    const createdIncome = new this.incomeModel(createIncomeDto);
    await createdIncome.save();

    await this.balanceService.updateBalance(createdIncome.value); // ⬅️ Atualiza o saldo

    return createdIncome;
  }

  async findAll(): Promise<Income[]> {
    return this.incomeModel.find().exec();
  }

  async findOne(id: string): Promise<Income> {
    const income = await this.incomeModel.findById(id).exec();
    if (!income) {
      throw new NotFoundException(`Income with ID "${id}" not found`);
    }
    return income;
  }

  async update(id: string, updateIncomeDto: UpdateIncomeDto): Promise<Income> {
    const existingIncome = await this.findOne(id);
    const oldValue = existingIncome.value;

    // Atualiza o documento no banco de dados
    const updatedIncome = await this.incomeModel
      .findByIdAndUpdate(id, updateIncomeDto, { new: true })
      .exec();

    if (!updatedIncome) {
      throw new NotFoundException(`Income with ID "${id}" not found`);
    }

    const newValue = updatedIncome.value;
    const difference = newValue - oldValue;

    await this.balanceService.updateBalance(difference);

    return updatedIncome;
  }

  async remove(id: string): Promise<any> {
    const income = await this.findOne(id);
    const removedIncome = await this.incomeModel.findByIdAndDelete(id).exec();

    await this.balanceService.updateBalance(-income.value); // ⬅️ Subtrai do saldo

    return removedIncome;
  }
}
