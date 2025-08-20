// src/incomes/incomes.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IncomesService } from './incomes.service';

@UseGuards(AuthGuard('jwt'))
@Controller('incomes')
export class IncomesController {
  constructor(private readonly incomesService: IncomesService) {}

  @Post()
  @HttpCode(201)
  create(@Body() body: any, @Request() req) {
    return this.incomesService.create(req.user._id, body);
  }

  @Get()
  findAll(@Request() req) {
    return this.incomesService.findAll(req.user._id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.incomesService.findOne(id, req.user._id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any, @Request() req) {
    return this.incomesService.update(id, req.user._id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string, @Request() req) {
    return this.incomesService.remove(id, req.user._id);
  }
}
