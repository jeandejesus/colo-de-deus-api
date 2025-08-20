// src/notifications/notifications.controller.ts

import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('subscribe')
  async subscribe(@Body() body: any, @Request() req) {
    await this.notificationsService.subscribe(req.user._id, body.subscription);
    return { success: true };
  }
}
