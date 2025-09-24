/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { GoogleCalendar } from './schemas/google-calendar.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CalendarService {
  private calendar;
  calendarId = 'jean.atletico2010@gmail.com';

  constructor(
    @InjectModel(GoogleCalendar.name)
    private googleCalendarModel: Model<GoogleCalendar>,
  ) {
    if (!process.env.SERVICE_ACCOUNT_JSON) {
      throw new Error('Variável SERVICE_ACCOUNT_JSON não encontrada');
    }

    const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_JSON);

    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    this.calendar = google.calendar({ version: 'v3', auth });
  }

  // Converte string para ISO completo com fuso horário
  private formatDateTime(dateStr: string): string {
    const date = new Date(dateStr);
    const tzOffset = -date.getTimezoneOffset(); // minutos
    const sign = tzOffset >= 0 ? '+' : '-';
    const hours = String(Math.floor(Math.abs(tzOffset) / 60)).padStart(2, '0');
    const minutes = String(Math.abs(tzOffset) % 60).padStart(2, '0');
    const iso = date.toISOString().split('.')[0]; // remove milissegundos
    return `${iso}${sign}${hours}:${minutes}`;
  }

  async getEventsThisMonth() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    // Pega eventos do Google
    const res = await this.calendar.events.list({
      calendarId: this.calendarId.trim(),
      timeMin: today.toISOString(),
      timeMax: endOfMonth.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const googleEvents = res.data.items || [];

    // Pega eventos do MongoDB
    const dbEvents = await this.googleCalendarModel.find().exec();

    // Mescla os dois
    const mergedEvents = googleEvents.map((gEvent) => {
      const dbEvent = dbEvents.find((d) => d.googleEventId === gEvent.id);
      return {
        ...gEvent,
        status: dbEvent?.status ?? 'pendente', // valor padrão
        typeMission: dbEvent?.typeMission ?? '',
      };
    });

    return mergedEvents;
  }

  async createEvent(eventData: any) {
    const res = await this.calendar.events.insert({
      calendarId: this.calendarId,
      requestBody: {
        summary: eventData.summary,
        description: eventData.description,
        start: {
          dateTime: this.formatDateTime(eventData.start),
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: this.formatDateTime(eventData.end),
          timeZone: 'America/Sao_Paulo',
        },
        colorId: '2',
      },
    });

    const googleEvent = res.data;

    const eventToSave = {
      googleEventId: googleEvent.id,
      status: eventData.status,
      typeMission: eventData.typeMission,
    };

    return new this.googleCalendarModel(eventToSave).save();
  }

  async updateEvent(eventId: string, eventData: any) {
    const res = await this.calendar.events.update({
      calendarId: this.calendarId,
      eventId,
      requestBody: {
        summary: eventData.summary,
        description: eventData.description,
        start: {
          dateTime: this.formatDateTime(eventData.start),
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: this.formatDateTime(eventData.end),
          timeZone: 'America/Sao_Paulo',
        },
        colorId: '2',
      },
    });

    await this.googleCalendarModel.updateOne(
      { googleEventId: eventId },
      {
        $set: {
          status: eventData.status,
          typeMission: eventData.typeMission,
        },
      },
      { upsert: true },
    );

    return {
      googleEventId: res.data.id,
      status: eventData.status,
      typeMission: eventData.typeMission,
    };
  }

  async deleteEvent(eventId: string) {
    console.log('Deletando evento com ID:', eventId);
    try {
      await this.calendar.events.delete({
        calendarId: this.calendarId,
        eventId,
      });

      await this.googleCalendarModel
        .deleteOne({ googleEventId: eventId })
        .exec();

      return { success: true, message: 'Evento deletado com sucesso' };
    } catch (err) {
      throw new Error('Erro ao deletar evento');
    }
  }
}
