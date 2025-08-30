// src/notifications/notifications.controller.ts

import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';
// import { Role } from '../auth/schemas/user.schema';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('subscribe')
  async subscribe(@Body() body: any, @Request() req) {
    await this.notificationsService.subscribe(req.user._id, body.subscription);
    return { success: true };
  }

  //@UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('send')
  async send(
    @Body() body: { userId: string; title: string; body: string; data: any },
  ) {
    await this.notificationsService.sendToUser(
      body.userId,
      body.title,
      body.body,
      body.data,
    );
    return { success: true, message: 'Notification sent successfully.' };
  }
}
