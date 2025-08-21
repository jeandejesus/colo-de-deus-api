// src/incomes/incomes.module.ts
import { Module } from '@nestjs/common';
import { IncomesService } from './incomes.service';
import { IncomesController } from './incomes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Income, IncomeSchema } from './schemas/income.schema';
import { BalanceModule } from 'src/balance/balance.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Income.name, schema: IncomeSchema }]),
    BalanceModule,
  ],
  controllers: [IncomesController],
  providers: [IncomesService],
})
export class IncomesModule {}
