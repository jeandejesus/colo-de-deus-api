import { Module } from '@nestjs/common';
import { CalendarService } from './google-calendar.service';
import { CalendarController } from './google-calendar.controller';

@Module({
  controllers: [CalendarController],
  providers: [CalendarService],
})
export class CalendarModule {}
