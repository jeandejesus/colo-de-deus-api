// src/notifications/notifications.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as webpush from 'web-push';
import {
  PushSubscription,
  PushSubscriptionDocument,
} from './schema/push-subscription.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(PushSubscription.name)
    private pushSubscriptionModel: Model<PushSubscriptionDocument>,
  ) {
    // Configure as chaves VAPID aqui
    webpush.setVapidDetails(
      'mailto:seu-email@exemplo.com',
      'BODD-W0-GH3GOhbgqjNhPBSLQW6q5YohLi3Wq7dTCgyevsp5uQwri8SW9p0vt0ccL2WNpzimJ3oGX6JnrRWqoUM',
      'f4ept7-DMVYQGGHywFSFVEF9goZamaWfHXUTncryPTU',
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
