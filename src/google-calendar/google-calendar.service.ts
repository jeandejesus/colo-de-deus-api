import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class CalendarService {
  private calendar;

  constructor() {
    // Pega o JSON da Service Account da variável de ambiente
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

  async getEventsThisMonth() {
    const calendarId = 'jean.atletico2010@gmail.com'; // ou use um ID específico se necessário
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    const res = await this.calendar.events.list({
      calendarId: calendarId.trim(), // remove espaços ou quebras de linha
      timeMin: today.toISOString(),
      timeMax: endOfMonth.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    return res.data.items || [];
  }
}
