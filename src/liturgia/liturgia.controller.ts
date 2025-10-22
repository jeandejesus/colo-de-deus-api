import { Controller, Get, Param } from '@nestjs/common';
import { LiturgiaService } from './liturgia.service';

@Controller('liturgia')
export class LiturgiaController {
  constructor(private readonly liturgiaService: LiturgiaService) {}

  @Get('today')
  async getToday() {
    return this.liturgiaService.getToday();
  }

  @Get(':date')
  async getByDate(@Param('date') date: string) {
    return this.liturgiaService.getByDate(date);
  }
}
