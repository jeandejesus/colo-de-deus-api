/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as puppeteer from 'puppeteer';
import { Liturgia, LiturgiaDocument } from './schemas/liturgia.schema';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class LiturgiaService {
  private readonly logger = new Logger(LiturgiaService.name);
  private readonly URL = 'https://liturgia.cancaonova.com/pb/';

  constructor(@InjectModel(Liturgia.name) private liturgiaModel: Model<LiturgiaDocument>) {}

  @Cron(CronExpression.EVERY_MINUTE, {
    timeZone: 'America/Sao_Paulo',
  })
  async updateDailyReadings(): Promise<LiturgiaDocument> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(this.URL, { waitUntil: 'networkidle2', timeout: 30000 });

    const data = await page.evaluate(() => {
      const getTextFromDiv = (id: string) => {
        const div = document.getElementById(id);
        if (!div) return null;
        // Pega todos os <p> dentro da div e junta o texto
        return Array.from(div.querySelectorAll('p'))
          .map((p) => p.textContent?.trim())
          .filter((t) => t)
          .join('\n');
      };

      return {
        primeira_leitura: getTextFromDiv('liturgia-1'),
        salmo: getTextFromDiv('liturgia-2'),
        segunda_leitura: getTextFromDiv('liturgia-3'),
        evangelho: getTextFromDiv('liturgia-4'),
        fonte: window.location.href,
      };
    });

    await browser.close();

    const today = new Date().toISOString().slice(0, 10);

    const updated = await this.liturgiaModel.findOneAndUpdate(
      { date: today },
      { ...data, date: today },
      { upsert: true, new: true },
    );

    this.logger.log('Liturgia do dia atualizada com sucesso');
    return updated;
  }

  @Cron(CronExpression.EVERY_MINUTE, {
    timeZone: 'America/Sao_Paulo',
  })
  async updateDailyReflection(): Promise<LiturgiaDocument> {
    const REFLEXAO_URL = 'https://www.hablarcondios.org/pt/meditacaodiaria.aspx';
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(REFLEXAO_URL, { waitUntil: 'networkidle2', timeout: 30000 });

    // Espera explicitamente a div principal estar presente
    await page.waitForSelector('.contenedor', { timeout: 15000 });

    const reflexaoHtml = await page.evaluate(() => {
      const div = document.querySelector('.contenedor');
      if (!div) return null;

      // Remove scripts, iframes e possíveis anúncios
      div.querySelectorAll('iframe, script, .ads, .google-ad').forEach((el) => el.remove());

      // Mantém o HTML completo dos <p>
      return Array.from(div.querySelectorAll('p'))
        .map((p) => p.outerHTML)
        .join('\n');
    });

    await browser.close();

    if (!reflexaoHtml) {
      throw new Error('Não foi possível capturar a reflexão diária.');
    }

    console.log('Reflexão capturada:', reflexaoHtml.slice(0, 100)); // Log parcial para evitar excesso

    const today = new Date().toISOString().slice(0, 10);

    const updated = await this.liturgiaModel.findOneAndUpdate(
      { date: today },
      { reflexao: reflexaoHtml, date: today },
      { upsert: true, new: true },
    );

    this.logger.log('Reflexão do dia atualizada com sucesso');
    return updated;
  }

  async getToday(): Promise<LiturgiaDocument> {
    const today = new Date().toISOString().slice(0, 10);
    const result = await this.liturgiaModel.findOne({ date: today }).exec();
    if (!result) {
      throw new Error('Liturgia not found for today');
    }
    return result;
  }

  async getByDate(date: string): Promise<LiturgiaDocument> {
    const result = await this.liturgiaModel.findOne({ date }).exec();
    if (!result) {
      throw new Error(`Liturgia not found for the date: ${date}`);
    }
    return result;
  }
}
