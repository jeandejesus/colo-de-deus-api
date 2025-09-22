import { MiddlewareConsumer, Module } from '@nestjs/common';
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
import { HealthModule } from './health/health.module';
import { ScheduleModule } from '@nestjs/schedule';
import { BirthdayService } from './scheduling/birthday/birthday.service';
import { SchedulingModule } from './scheduling/scheduling.module';
import { MonthlyPaymentService } from './scheduling/monthly-payment/monthly-payment.service';
import { EmailService } from './email/email.service';
import { LoggingModule } from './logging/logging.module';
import { MetricsModule } from './metrics/metrics.module';
import { MetricsMiddleware } from './metrics/metrics.middleware';
import { LoggerModule } from 'nestjs-pino';
import { CalendarModule } from './google-calendar/google-calendar.module';

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
    HealthModule,
    SchedulingModule,
    MetricsModule,
    LoggerModule.forRoot(), // necessário para criar o provider Logger
    LoggingModule,
    CalendarModule,
  ],
  controllers: [AppController],
  providers: [AppService, EmailService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MetricsMiddleware).forRoutes('*');
  }
}
