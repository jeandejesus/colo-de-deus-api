// src/scheduling/scheduling.service.ts
// (se você renomeou o arquivo, caso contrário, continue em birthday.service.ts)

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class MonthlyPaymentService {
  // ➡️ O nome do serviço foi alterado
  private readonly logger = new Logger(MonthlyPaymentService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ... (Sua função handleBirthdayCron continua aqui)

  // ✅ Nova função para a notificação de contribuição mensal
  // O cron job será executado todo dia, ao meio-dia
  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleMonthlyContributionCron() {
    this.logger.log('Executando cron job de contribuição mensal...');

    const today = new Date();
    const currentDay = today.getDate();

    // Encontre todos os usuários cujo monthlyContributionDay é hoje
    const usersToNotify = await this.userModel
      .find({
        monthlyContributionDay: currentDay,
      })
      .exec();

    if (usersToNotify.length === 0) {
      this.logger.log('Nenhuma contribuição agendada para hoje.');
      return;
    }

    this.logger.log(
      `Encontrados ${usersToNotify.length} contribuintes para notificar hoje.`,
    );

    for (const user of usersToNotify) {
      const payload = {
        userId: user._id.toString(),
        title: 'Lembrete de Contribuição Mensal 💰',
        body: `Olá, ${user.name}! Não se esqueça de sua contribuição mensal.`,
        data: { type: 'monthly-contribution-reminder' },
      };

      try {
        await this.notificationsService.sendToUser(
          payload.userId,
          payload.title,
          payload.body,
          payload.data,
        );
        this.logger.log(
          `Notificação de contribuição enviada para ${user.name}.`,
        );
      } catch (error) {
        this.logger.error(
          `Falha ao enviar notificação de contribuição para ${user.name}:`,
          error,
        );
      }
    }
    this.logger.log('Cron job de contribuição mensal finalizado.');
  }
}
