// src/scheduling/scheduling.module.ts

import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { BirthdayService } from './birthday/birthday.service';
import { UsersModule } from 'src/users/users.module';
import { MonthlyPaymentService } from './monthly-payment/monthly-payment.service';
import { RelusLifeService } from './relus-life/relus-life.service';

@Module({
  imports: [
    UsersModule, // já vem com UserModel exportado
    NotificationsModule,
  ],
  providers: [BirthdayService, MonthlyPaymentService, RelusLifeService],
})
export class SchedulingModule {}
