import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { NotificationsService } from 'src/notifications/notifications.service';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { Counter, Gauge } from 'prom-client';

// 🔹 Definição das métricas
const cronSuccessCounter = new Counter({
  name: 'cronjob_success_total',
  help: 'Número total de execuções bem-sucedidas de cron jobs',
  labelNames: ['job'],
});

const cronFailureCounter = new Counter({
  name: 'cronjob_failure_total',
  help: 'Número total de falhas em cron jobs',
  labelNames: ['job'],
});

const cronLastExecution = new Gauge({
  name: 'cronjob_last_execution_timestamp',
  help: 'Timestamp da última execução de cron jobs',
  labelNames: ['job'],
});

@Injectable()
export class RelusLifeService {
  private readonly logger = new Logger(RelusLifeService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS, {
    timeZone: 'America/Sao_Paulo',
  })
  async handleMercyHourCron() {
    const jobName = 'handleMercyHourCron';
    try {
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

      // 🔹 Atualiza métricas
      cronSuccessCounter.inc({ job: jobName });
      cronLastExecution.set({ job: jobName }, Math.floor(Date.now() / 1000));
    } catch (error) {
      cronFailureCounter.inc({ job: jobName });
      throw error;
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM, {
    timeZone: 'America/Sao_Paulo',
  })
  async handleLectioCron() {
    const jobName = 'handleLectioCron';
    try {
      this.logger.log('Executando cron job de hora da lectio...');

      const usersToNotify = await this.userModel.find().exec();
      if (usersToNotify.length === 0) {
        this.logger.log('Nenhum usuário encontrado.');
        return;
      }

      const urlToOpen = 'http://liturgia.cancaonova.com/pb/';
      await Promise.all(
        usersToNotify.map((user) =>
          this.notificationsService
            .sendToUser(
              user._id.toString(),
              'Já fez a lectio hoje ?🙏',
              `Olá, ${user.name}! bora de fazer a léctio?, Vamos juntos!`,
              { type: 'lectio', url: urlToOpen },
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

      // 🔹 Atualiza métricas
      cronSuccessCounter.inc({ job: jobName });
      cronLastExecution.set({ job: jobName }, Math.floor(Date.now() / 1000));
    } catch (error) {
      cronFailureCounter.inc({ job: jobName });
      throw error;
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES, {
    timeZone: 'America/Sao_Paulo',
  })
  async handleMaryHourCron() {
    const jobName = 'handleMaryHourCron';
    try {
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

      // 🔹 Atualiza métricas
      cronSuccessCounter.inc({ job: jobName });
      cronLastExecution.set({ job: jobName }, Math.floor(Date.now() / 1000));
    } catch (error) {
      cronFailureCounter.inc({ job: jobName });
      throw error;
    }
  }
}
