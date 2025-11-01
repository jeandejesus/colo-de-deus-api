// src/users/users.controller.ts

import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  SetMetadata,
  Post,
  Request,
  Query,
  BadRequestException,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UserRole } from './schemas/user.schema';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { EmailService } from 'src/email/email.service';
import { Public } from 'src/common/decorators/public.decorator';
// import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import mongoose from 'mongoose';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard) // ✅ Use your custom guard
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private emailService: EmailService,
  ) {}

  @Get()
  @SetMetadata('roles', [UserRole.ADMIN, UserRole.FINANCEIRO])
  findAll() {
    return this.usersService.findAll();
  }

  @Get('with-location')
  async findAllWithLocation() {
    return this.usersService.findAllWithLocation();
  }

  @Get('monthly-contribution-progress')
  async getMonthlyContributionProgress(@Query('start') start?: string, @Query('end') end?: string) {
    return this.usersService.getMonthlyContributionProgress(start, end);
  }

  @Get('paginate')
  findAllPaginate(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.usersService.findAllPaginate(page, limit);
  }

  @Get('location/near')
  @SetMetadata('roles', [UserRole.ADMIN, UserRole.AGENDA])
  async findNearAddress(@Request() req, @Query('address') address: string) {
    return this.usersService.findNearAddress(address);
  }

  @Patch(':id/role')
  updateRole(@Param('id') id: string, @Body() updateUserRoleDto: UpdateUserRoleDto) {
    return this.usersService.updateRole(id, updateUserRoleDto.role);
  }

  @Post('payment')
  @SetMetadata('roles', [UserRole.ADMIN, UserRole.FINANCEIRO])
  async addPayment(@Body('userId') userId: string, @Body('amount') amount: number) {
    const updatedUser = await this.usersService.addPayment(userId, amount);
    return { success: true, user: updatedUser };
  }

  @Get('payments-status')
  @SetMetadata('roles', [UserRole.ADMIN, UserRole.FINANCEIRO])
  async getUsersWithPaymentStatus() {
    return this.usersService.hasPaidThisMonth();
  }

  @Post('request')
  @Public() // ✅ This decorator now works
  async requestPasswordReset(@Body('email') email: string) {
    const token = await this.usersService.generatePasswordResetToken(email);
    const frontendUrl = process.env.FRONTEND_URL as string;
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    await this.emailService.sendPasswordResetEmail(email, resetUrl);

    return {
      message: 'Link de redefinição de senha enviado. Verifique seu e-mail.',
    };
  }

  @Post('reset')
  @Public()
  async resetPassword(@Body('token') token: string, @Body('password') newPassword: string) {
    await this.usersService.resetUserPassword(token, newPassword);

    return {
      message: 'Senha redefinida com sucesso.',
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch('me')
  updateUser(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(req.user._id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID inválido');
    }

    const deleted = await this.usersService.remove(id);
    if (!deleted) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return { message: 'Usuário removido com sucesso' };
  }
}
