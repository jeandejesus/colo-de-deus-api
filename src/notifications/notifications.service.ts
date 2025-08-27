// src/notifications/notifications.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as webpush from 'web-push';
import { ConfigService } from '@nestjs/config'; // Importe o ConfigService
import {
  PushSubscription,
  PushSubscriptionDocument,
} from './schema/push-subscription.schema';

@Injectable()
export class NotificationsService {
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
    const newSubscription = new this.pushSubscriptionModel({
      userId,
      subscription,
    });
    await newSubscription.save();
  }
}
