// src/incomes/incomes.controller.ts

import { IncomesService } from './incomes.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  SetMetadata,
} from '@nestjs/common';
import { UserRole } from 'src/users/schemas/user.schema';

@Controller('incomes')
export class IncomesController {
  constructor(private readonly incomesService: IncomesService) {}

  @SetMetadata('roles', [UserRole.ADMIN, UserRole.FINANCEIRO])
  @Post()
  create(@Body() createIncomeDto: CreateIncomeDto) {
    return this.incomesService.create(createIncomeDto);
  }

  @Get()
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.incomesService.findAll(startDate, endDate);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.incomesService.findOne(id);
  }

  @SetMetadata('roles', [UserRole.ADMIN, UserRole.FINANCEIRO])
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIncomeDto: UpdateIncomeDto) {
    return this.incomesService.update(id, updateIncomeDto);
  }

  @SetMetadata('roles', [UserRole.ADMIN, UserRole.FINANCEIRO])
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.incomesService.remove(id);
  }
}
