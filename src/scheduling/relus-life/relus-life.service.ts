import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { MonitoredCron } from 'src/common/decorators/monitored-cron.decorator';
import { NotificationsService } from 'src/notifications/notifications.service';
import { User, UserDocument } from 'src/users/schemas/user.schema';

@Injectable()
export class RelusLifeService {
  private readonly logger = new Logger(RelusLifeService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  @MonitoredCron(CronExpression.EVERY_DAY_AT_3PM, {
    timeZone: 'America/Sao_Paulo',
  })
  async handleMercyHourCron() {
    this.logger.log('Executando cron job de hora da misericórdia...');

    const usersToNotify = await this.userModel.find().exec();
    if (usersToNotify.length === 0) {
      this.logger.log('Nenhum usuário encontrado.');
      return;
    }
    const urlToOpen = 'http://instagram.com/colodedeus';
    await Promise.all(
      usersToNotify.map((user) =>
        this.notificationsService
          .sendToUser(
            user._id.toString(),
            'Hora do Terço da Misericórdia 🙏',
            `Olá, ${user.name}! Está na hora de rezar o Terço da Misericórdia, ja pega seu terço e Vamos juntos!`,
            { type: 'terco-da-misericordia', url: urlToOpen },
          )
          .catch((error) =>
            this.logger.error(
              `Falha ao enviar notificação para ${user.name}:`,
              error,
            ),
          ),
      ),
    );

    this.logger.log('Cron job de hora da misericórdia finalizado.');
  }

  @MonitoredCron(CronExpression.EVERY_30_SECONDS, {
    timeZone: 'America/Sao_Paulo',
  })
  async handleLectioCron() {
    this.logger.log('Executando cron job de hora da lectio...');

    const usersToNotify = await this.userModel.find().exec();
    if (usersToNotify.length === 0) {
      this.logger.log('Nenhum usuário encontrado.');
      return;
    }

    const urlToOpen = 'http://liturgia.cancaonova.com/pb/';

    return;
  }

  @MonitoredCron(CronExpression.EVERY_DAY_AT_6PM, {
    timeZone: 'America/Sao_Paulo',
  })
  async handleMaryHourCron() {
    this.logger.log('Executando cron job terço mariano...');

    const usersToNotify = await this.userModel.find().exec();
    if (usersToNotify.length === 0) {
      this.logger.log('Nenhum usuário encontrado.');
      return;
    }
    const urlToOpen = 'http://instagram.com/colodedeus';
    await Promise.all(
      usersToNotify.map((user) =>
        this.notificationsService
          .sendToUser(
            user._id.toString(),
            'Terço Mariano🙏',
            `Olá, ${user.name} já rezou seu terço hoje, se não, já pega seu terço e Vamos juntos!`,
            { type: 'terco-mariano', url: urlToOpen },
          )
          .catch((error) =>
            this.logger.error(
              `Falha ao enviar notificação para ${user.name}:`,
              error,
            ),
          ),
      ),
    );

    this.logger.log('Cron job de hora do terço mariano finalizado.');
  }
}
