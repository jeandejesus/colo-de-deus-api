// src/scheduling/birthday.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { NotificationsService } from 'src/notifications/notifications.service';
import { Types } from 'mongoose';

@Injectable()
export class BirthdayService {
  private readonly logger = new Logger(BirthdayService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleBirthdayCron() {
    this.logger.log('Executando cron job de aniversário...');

    const today = new Date();
    const currentMonth = today.getMonth(); // 0-11
    const currentDay = today.getDate();

    // ➡️ Passo 1: Encontrar todos os usuários com aniversário hoje
    const usersWithBirthday = await this.userModel
      .find({
        $expr: {
          $and: [
            { $eq: [{ $dayOfMonth: '$birthDate' }, currentDay] },
            { $eq: [{ $month: '$birthDate' }, currentMonth + 1] }, // Mongoose usa mês base 1
          ],
        },
      })
      .exec();

    if (usersWithBirthday.length === 0) {
      this.logger.log('Nenhum aniversário hoje.');
      return;
    }

    this.logger.log(
      `Encontrados ${usersWithBirthday.length} aniversariante(s) hoje.`,
    );

    const birthdayUserIds = usersWithBirthday.map((user) =>
      user._id.toString(),
    );

    // ➡️ Passo 2: Encontrar todos os outros usuários
    const otherUsers = await this.userModel
      .find({
        _id: { $nin: birthdayUserIds.map((id) => new Types.ObjectId(id)) },
      })
      .exec();

    // ➡️ Passo 3: Enviar notificações
    await this.sendNotificationsToAniversariantes(usersWithBirthday);
    await this.sendNotificationsToOtherUsers(usersWithBirthday, otherUsers);

    this.logger.log('Cron job de aniversário finalizado.');
  }

  // ✅ Função para enviar notificações aos aniversariantes
  private async sendNotificationsToAniversariantes(users: UserDocument[]) {
    for (const user of users) {
      const payload = {
        userId: user._id.toString(),
        title: `Feliz Aniversário, ${user.name}! 🎉`,
        body: 'Que seu dia seja repleto de alegria e bênçãos!',
        data: { type: 'birthday' },
      };

      try {
        await this.notificationsService.sendToUser(
          payload.userId,
          payload.title,
          payload.body,
          payload.data,
        );
        this.logger.log(`Notificação de parabéns enviada para ${user.name}.`);
      } catch (error) {
        this.logger.error(`Falha ao enviar parabéns para ${user.name}:`, error);
      }
    }
  }

  // ✅ Função para enviar notificações aos outros usuários
  private async sendNotificationsToOtherUsers(
    aniversariantes: UserDocument[],
    otherUsers: UserDocument[],
  ) {
    for (const user of otherUsers) {
      const aniversariantesNames = aniversariantes
        .map((a) => a.name)
        .join(', ');

      const payload = {
        userId: user._id.toString(),
        title: `Aniversário Hoje! 🎉`,
        body: `É aniversário de ${aniversariantesNames} hoje!`,
        data: { type: 'birthday-alert' },
      };

      try {
        await this.notificationsService.sendToUser(
          payload.userId,
          payload.title,
          payload.body,
          payload.data,
        );
        this.logger.log(
          `Notificação de aniversário enviada para ${user.name}.`,
        );
      } catch (error) {
        this.logger.error(
          `Falha ao enviar alerta de aniversário para ${user.name}:`,
          error,
        );
      }
    }
  }
}
