import { Body, Controller, Get, Patch } from '@nestjs/common';
import { BalanceService } from './balance.service';

@Controller('balance')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get()
  findOne() {
    return this.balanceService.getBalance();
  }

  @Patch()
  update(@Body() body: { value: number }) {
    return this.balanceService.setBalance(body.value);
  }
}
