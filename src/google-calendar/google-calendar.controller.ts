import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
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

  @Post('create')
  async createEvent(@Body() body: any) {
    // exemplo: body: { calendarId: 'primary', summary: 'Reunião', start: '2025-09-23T15:00:00-03:00', end: '2025-09-23T16:00:00-03:00' }
    const { calendarId, ...eventData } = body;

    const event = await this.calendarService.createEvent(eventData);

    // aqui você poderia salvar no banco também
    return {
      message: 'Evento criado com sucesso',
      ...event,
    };
  }

  @Put('update/:eventId')
  async updateEvent(@Param('eventId') eventId: string, @Body() body: any) {
    const event = await this.calendarService.updateEvent(eventId, body);

    // aqui você pode atualizar no banco também (ex: status: confirmed, summary atualizado, etc)
    return {
      message: 'Evento atualizado com sucesso',
      ...event,
    };
  }

  @Delete('/:eventId')
  async deleteEvent(@Param('eventId') eventId: string) {
    return this.calendarService.deleteEvent(eventId);
  }
}
