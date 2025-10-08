/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { GoogleCalendar } from './schemas/google-calendar.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CalendarService {
  private calendar;
  calendarId = process.env.CALENDAR_ID || '';

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
    const tzOffset = -date.getTimezoneOffset();
    const diffHours = Math.floor(tzOffset / 60);
    const diffMinutes = Math.abs(tzOffset % 60);
    const sign = tzOffset >= 0 ? '+' : '-';

    const pad = (n: number) => String(n).padStart(2, '0');
    const offset = `${sign}${pad(Math.abs(diffHours))}:${pad(diffMinutes)}`;

    return date.toISOString().replace('Z', offset);
  }

  async getEventsByMonth(month: number, year: number) {
    // month: 1-12 vindo do front (ex: Janeiro = 1)
    const startOfMonth = new Date(year, month - 1, 1);
    startOfMonth.setUTCHours(0, 0, 0, 0); // força início do mês em UTC

    const endOfMonth = new Date(year, month, 1);
    endOfMonth.setUTCHours(0, 0, 0, 0); // primeiro dia do próximo mês em UTC

    // 📌 Agora timeMin e timeMax não vão "voltar um dia" no UTC
    const res = await this.calendar.events.list({
      calendarId: this.calendarId.trim(),
      timeMin: startOfMonth.toISOString(),
      timeMax: endOfMonth.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const googleEvents = res.data.items || [];

    // Corrigir datas all-day (Google envia como "YYYY-MM-DD")
    const normalizeEventDates = (event: any) => {
      if (event.start?.date && !event.start.dateTime) {
        event.start.date = event.start.date; // já vem certo
      }
      if (event.end?.date && !event.end.dateTime) {
        event.end.date = event.end.date;
      }
      return event;
    };

    // Pega eventos do MongoDB
    const dbEvents = await this.googleCalendarModel.find().exec();

    // Mescla os dois
    const mergedEvents = googleEvents.map((gEvent) => {
      gEvent = normalizeEventDates(gEvent);

      const dbEvent = dbEvents.find((d) => d.googleEventId === gEvent.id);

      return {
        ...gEvent,
        statusMongo: dbEvent?.statusMongo ?? 'pendente',
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
        location: eventData.location,
        start: {
          dateTime: this.formatDateTime(eventData.start),
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: this.formatDateTime(eventData.end),
          timeZone: 'America/Sao_Paulo',
        },
        colorId: '5',
      },
    });

    const googleEvent = res.data;

    const eventToSave = {
      googleEventId: googleEvent.id,
      statusMongo: eventData.status,
      typeMission: eventData.typeMission,
      summary: eventData.summary,
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
        location: eventData.location,
        start: {
          dateTime: this.formatDateTime(eventData.start),
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: this.formatDateTime(eventData.end),
          timeZone: 'America/Sao_Paulo',
        },
        colorId: '5',
      },
    });

    await this.googleCalendarModel.updateOne(
      { googleEventId: eventId },
      {
        $set: {
          statusMongo: eventData.status,
          typeMission: eventData.typeMission,
          summary: eventData.summary,
        },
      },
      { upsert: true },
    );

    return {
      googleEventId: res.data.id,
      status: eventData.status,
      typeMission: eventData.typeMission,
      summary: eventData.summary,
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

  fixAllDayDate(dateStr: string): string {
    const d = new Date(dateStr);
    d.setHours(d.getHours() - 3); // ajusta para horário de Brasília
    return d.toISOString();
  }
}
