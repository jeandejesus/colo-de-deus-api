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
} from '@nestjs/common';
// ✅ REMOVE: import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UserRole } from './schemas/user.schema';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { EmailService } from 'src/email/email.service';
import { Public } from 'src/common/decorators/public.decorator';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('users')
@UseGuards(AuthGuard, RolesGuard) // ✅ Use your custom guard
@SetMetadata('roles', [UserRole.ADMIN])
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private emailService: EmailService,
  ) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id/role')
  updateRole(
    @Param('id') id: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.usersService.updateRole(id, updateUserRoleDto.role);
  }

  // ✅ NOVO: Endpoint para registrar um pagamento
  @Post('payment')
  async addPayment(
    @Body('userId') userId: string,
    @Body('amount') amount: number,
  ) {
    const updatedUser = await this.usersService.addPayment(userId, amount);
    return { success: true, user: updatedUser };
  }

  @Get('payments-status')
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
  async resetPassword(
    @Body('token') token: string,
    @Body('password') newPassword: string,
  ) {
    await this.usersService.resetUserPassword(token, newPassword);

    return {
      message: 'Senha redefinida com sucesso.',
    };
  }
}
