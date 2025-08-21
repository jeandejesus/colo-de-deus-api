// src/incomes/dto/create-income.dto.ts

import { IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

export class CreateExpensesDto {
  @IsNotEmpty()
  description!: string;

  @IsNumber()
  @IsNotEmpty()
  value!: number;

  @IsDateString()
  @IsNotEmpty()
  date!: Date;
}
