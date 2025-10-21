// src/scheduling/scheduling.service.ts
// (se você renomeou o arquivo, caso contrário, continue em birthday.service.ts)

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { NotificationsService } from 'src/notifications/notifications.service';
import dayjs from 'dayjs';

@Injectable()
export class MonthlyPaymentService {
  private readonly logger = new Logger(MonthlyPaymentService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_NOON, {
    timeZone: 'America/Sao_Paulo', // fuso horário
  })
  async handleMonthlyContributionCron() {
    this.logger.log('Executando cron job de contribuição mensal...');

    const today = dayjs();
    const currentDay = today.date();

    const startOfMonth = today.startOf('month').toDate();
    const endOfMonth = today.endOf('month').toDate();

    const usersToNotify = await this.userModel
      .find({
        monthlyContributionDay: { $lt: currentDay }, // já passou do dia de contribuição
        $nor: [
          {
            payments: {
              $elemMatch: {
                date: { $gte: startOfMonth, $lte: endOfMonth }, // já pagou no mês atual
              },
            },
          },
        ],
      })
      .exec();

    console.log(usersToNotify);

    if (usersToNotify.length === 0) {
      this.logger.log('Nenhuma contribuição agendada para hoje.');
      return;
    }

    this.logger.log(`Encontrados ${usersToNotify.length} contribuintes para notificar hoje.`);

    for (const user of usersToNotify) {
      const payload = {
        userId: user._id.toString(),
        title: 'Lembrete de Contribuição Mensal 💰',
        body: `Olá, ${user.name}! Não se esqueça de sua contribuição mensal.`,
        data: { type: 'monthly-contribution-reminder', url: 'http://colodedeuscwb.com.br/pix' },
      };

      try {
        await this.notificationsService.sendToUser(
          payload.userId,
          payload.title,
          payload.body,
          payload.data,
        );
        this.logger.log(`Notificação de contribuição enviada para ${user.name}.`);
      } catch (error) {
        this.logger.error(`Falha ao enviar notificação de contribuição para ${user.name}:`, error);
      }
    }
    this.logger.log('Cron job de contribuição mensal finalizado.');
  }
}
