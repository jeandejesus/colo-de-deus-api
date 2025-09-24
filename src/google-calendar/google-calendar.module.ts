import { Module } from '@nestjs/common';
import { CalendarService } from './google-calendar.service';
import { CalendarController } from './google-calendar.controller';
import {
  GoogleCalendar,
  GoogleCalendarSchema,
} from './schemas/google-calendar.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GoogleCalendar.name, schema: GoogleCalendarSchema },
    ]),
  ],

  controllers: [CalendarController],
  providers: [CalendarService],
})
export class CalendarModule {}
