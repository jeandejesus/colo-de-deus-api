import { Body, Controller, Get, Patch, SetMetadata } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { UserRole } from 'src/users/schemas/user.schema';

@Controller('balance')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get()
  findOne() {
    return this.balanceService.getBalance();
  }

  @Patch()
  @SetMetadata('roles', [UserRole.ADMIN, UserRole.FINANCEIRO])
  update(@Body() body: { value: number }) {
    return this.balanceService.setBalance(body.value);
  }
}
