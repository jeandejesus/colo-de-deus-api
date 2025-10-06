// src/events/events.controller.ts

import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto/update-event.dto';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // Admin: criar evento
  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  // Listar todos eventos
  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  // Buscar evento
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  // Atualizar evento
  @Put(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  // Deletar evento
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  // Usuário se inscrever
  @Post(':eventId/subscribe/:userId')
  subscribe(
    @Param('eventId') eventId: string,
    @Param('userId') userId: string,
  ) {
    return this.eventsService.subscribe(eventId, userId);
  }

  // Admin faz check-in pelo QR Code
  @Post(':eventId/checkin/:qrCode')
  checkin(@Param('eventId') eventId: string, @Param('qrCode') qrCode: string) {
    return this.eventsService.checkin(eventId, qrCode);
  }

  @Get(':eventId/participants')
  async getEventParticipants(@Param('eventId') eventId: string) {
    return this.eventsService.getParticipants(eventId);
  }

  @Get(':eventId/registration/:userId')
  getUserEventQRCode(
    @Param('eventId') eventId: string,
    @Param('userId') userId: string,
  ) {
    return this.eventsService.getUserQRCode(eventId, userId);
  }

  // GET /users/:userId/registrations
  @Get('/users/:userId/registrations')
  getUserRegistrations(@Param('userId') userId: string) {
    return this.eventsService.getUserRegistrations(userId);
  }
}
