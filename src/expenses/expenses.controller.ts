// src/expenses/expenses.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  SetMetadata,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpensesDto } from './dto/create-expenses.dto';
import { UpdateExpensesDto } from './dto/update-expenses.dto';
import { UserRole } from 'src/users/schemas/user.schema';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @SetMetadata('roles', [UserRole.ADMIN, UserRole.FINANCEIRO])
  create(@Body() createExpenseDto: CreateExpensesDto) {
    return this.expensesService.create(createExpenseDto);
  }

  @Get()
  findAll(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.expensesService.findAll(startDate, endDate);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expensesService.findOne(id);
  }

  @SetMetadata('roles', [UserRole.ADMIN, UserRole.FINANCEIRO])
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpensesDto) {
    return this.expensesService.update(id, updateExpenseDto);
  }

  @SetMetadata('roles', [UserRole.ADMIN, UserRole.FINANCEIRO])
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expensesService.remove(id);
  }
}
