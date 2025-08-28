import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { NotificationsModule } from './notifications/notifications.module';
import { IncomesModule } from './incomes/incomes.module';
import { ExpensesModule } from './expenses/expenses.module';
import { BalanceModule } from './balance/balance.module';
import { CategoriesModule } from './categories/categories.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BirthdayService } from './scheduling/birthday/birthday.service';
import { SchedulingModule } from './scheduling/scheduling.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true, // <-- deixa disponível em toda a aplicação
    }),
    MongooseModule.forRoot(process.env.DATABASE_URL as string),
    UsersModule,
    AuthModule,
    NotificationsModule,
    IncomesModule,
    ExpensesModule,
    BalanceModule,
    CategoriesModule,
    SchedulingModule,
  ],
  controllers: [AppController],
  providers: [AppService, BirthdayService],
})
export class AppModule {}
