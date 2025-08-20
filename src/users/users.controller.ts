// src/users/users.controller.ts

import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport'; // Importe o AuthGuard

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt')) // Adicione o guard aqui
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
