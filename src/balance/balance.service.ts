// src/balance/balance.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, HydratedDocument } from 'mongoose';
import { Balance } from './entities/balance.entity';

@Injectable()
export class BalanceService {
  constructor(
    @InjectModel(Balance.name) private balanceModel: Model<Balance>,
  ) {}

  async getBalance(): Promise<HydratedDocument<Balance>> {
    let balance = await this.balanceModel.findOne();
    if (!balance) {
      balance = new this.balanceModel({ value: 0 });
      await balance.save();
    }
    return balance;
  }

  async updateBalance(amount: number): Promise<HydratedDocument<Balance>> {
    const balance = await this.getBalance();
    balance.value += amount; // ⬅️ Adicione o '!' aqui
    return balance.save();
  }

  async setBalance(newValue: number): Promise<HydratedDocument<Balance>> {
    const balance = await this.getBalance();
    balance.value = newValue;
    return balance.save();
  }
}
