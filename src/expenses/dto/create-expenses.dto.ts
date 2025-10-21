// src/incomes/dto/create-income.dto.ts

import { IsNotEmpty, IsNumber, IsDateString, IsString } from 'class-validator';

export class CreateExpensesDto {
  @IsNotEmpty({ message: 'A descrição não pode ser vazia.' })
  description!: string;

  @IsNumber({}, { message: 'O valor deve ser um número.' })
  @IsNotEmpty({ message: 'O valor não pode ser vazio.' })
  value!: number;

  @IsDateString({}, { message: 'A data deve ser uma string de data válida (ISO 8601).' })
  @IsNotEmpty({ message: 'A data não pode ser vazia.' })
  date!: Date;

  @IsNotEmpty({ message: 'A categoria não pode ser vazia.' })
  @IsString({ message: 'A categoria deve ser uma string.' })
  category!: string;
}
