import { IsNumber } from 'class-validator';

export class CreateBalanceDto {
  @IsNumber({}, { message: 'O dia da contribuição deve ser um número.' })
  value?: number;
}
