// src/scheduling/scheduling.module.ts

import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { BirthdayService } from './birthday/birthday.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    UsersModule, // já vem com UserModel exportado
    NotificationsModule,
  ],
  providers: [BirthdayService],
})
export class SchedulingModule {}
