import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { NotificationsService } from 'src/notifications/notifications.service';
import { User, UserDocument } from 'src/users/schemas/user.schema';

@Injectable()
export class RelusLifeService {
  private readonly logger = new Logger(RelusLifeService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3PM, {
    timeZone: 'America/Sao_Paulo',
  })
  async handleMercyHourCron() {
    this.logger.log('Executando cron job de hora da misericórdia...');

    const usersToNotify = await this.userModel.find().exec();
    if (usersToNotify.length === 0) {
      this.logger.log('Nenhum usuário encontrado.');
      return;
    }

    await Promise.all(
      usersToNotify.map((user) =>
        this.notificationsService
          .sendToUser(
            user._id.toString(),
            'Hora do Terço da Misericórdia 🙏',
            `Olá, ${user.name}! Está na hora de rezar o Terço da Misericórdia. Vamos juntos!`,
            { type: 'terco-da-misericordia' },
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

  @Cron(CronExpression.EVERY_DAY_AT_10AM, {
    timeZone: 'America/Sao_Paulo',
  })
  async handleLectioCron() {
    this.logger.log('Executando cron job de hora da lectio...');

    const usersToNotify = await this.userModel.find().exec();
    if (usersToNotify.length === 0) {
      this.logger.log('Nenhum usuário encontrado.');
      return;
    }

    await Promise.all(
      usersToNotify.map((user) =>
        this.notificationsService
          .sendToUser(
            user._id.toString(),
            'Já fez a lectio hoje ?🙏',
            `Olá, ${user.name}! bora de fazer a léctio?, Vamos juntos!`,
            { type: 'lectio' },
          )
          .catch((error) =>
            this.logger.error(
              `Falha ao enviar notificação para ${user.name}:`,
              error,
            ),
          ),
      ),
    );

    this.logger.log('Cron job de Lectio finalizado.');
  }
}
