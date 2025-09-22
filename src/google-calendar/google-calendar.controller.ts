import { Controller, Get, Query } from '@nestjs/common';
import { CalendarService } from './google-calendar.service';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  // GET /calendar/events?calendarId=ID_DA_AGENDA
  @Get('events')
  async getEvents() {
    const events = await this.calendarService.getEventsThisMonth();
    return events;
  }
}
