/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/notifications/notifications.service.ts

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as webpush from 'web-push';
import { ConfigService } from '@nestjs/config'; // Importe o ConfigService
import {
  PushSubscription,
  PushSubscriptionDocument,
} from './schema/push-subscription.schema';

@Injectable()
export class NotificationsService {
  subscriptionModel: any;
  constructor(
    @InjectModel(PushSubscription.name)
    private pushSubscriptionModel: Model<PushSubscriptionDocument>,
    private configService: ConfigService,
  ) {
    webpush.setVapidDetails(
      'mailto:comunicacaocwb41@gmail.com',
      this.configService.get<string>('VAPID_PUBLIC_KEY'),
      this.configService.get<string>('VAPID_PRIVATE_KEY'),
    );
  }

  async subscribe(userId: string, subscription: object): Promise<void> {
    await new this.pushSubscriptionModel({
      userId: new Types.ObjectId(userId),
      subscription,
    }).save();
  }

  async sendToUser(userId: string, title: string, body: string, data: any) {
    const subscriptionRecord = await this.pushSubscriptionModel.find({
      userId: new Types.ObjectId(userId),
    });

    if (!subscriptionRecord) {
      throw new InternalServerErrorException(
        'User has no active subscription.',
      );
    }

    const payload = JSON.stringify({ title, body, data });

    try {
      for (const element of subscriptionRecord) {
        await webpush.sendNotification(element.subscription, payload);
        console.error('notificações enviada');
      }
    } catch (error: unknown) {
      console.error('Falha ao enviar notificação:', error);

      if (
        typeof error === 'object' &&
        error !== null &&
        'statusCode' in error &&
        (error as { statusCode: number }).statusCode === 410
      ) {
        await this.pushSubscriptionModel.deleteOne({
          userId: new Types.ObjectId(userId),
        });
      }

      throw new InternalServerErrorException('Falha ao enviar notificação.');
    }
  }

  async unsubscribe(userId: string): Promise<void> {
    await this.pushSubscriptionModel.deleteOne({
      userId: new Types.ObjectId(userId),
    });
  }

  async getNotificationStatus(userId: string): Promise<any> {
    const subscriptionStatus = await this.pushSubscriptionModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    return subscriptionStatus ? { subscribed: true } : { subscribed: false };
  }
}
