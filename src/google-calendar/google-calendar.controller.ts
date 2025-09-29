import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CalendarService } from './google-calendar.service';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  // GET /calendar/events?calendarId=ID_DA_AGENDA
  @Get('events')
  async getEventsByMonth(
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const parsedMonth = parseInt(month, 10);
    const parsedYear = parseInt(year, 10);

    if (isNaN(parsedMonth) || isNaN(parsedYear)) {
      throw new Error('Month e Year devem ser números');
    }

    return this.calendarService.getEventsByMonth(parsedMonth, parsedYear);
  }

  @Post('create')
  async createEvent(@Body() body: any) {
    const { ...eventData } = body;

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
