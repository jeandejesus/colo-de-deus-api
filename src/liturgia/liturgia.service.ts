/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Liturgia, LiturgiaDocument } from './schemas/liturgia.schema';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class LiturgiaService {
  private readonly logger = new Logger(LiturgiaService.name);
  private readonly URL = 'https://liturgia.cancaonova.com/pb/';
  private readonly REFLEXAO_URL = 'https://www.hablarcondios.org/pt/meditacaodiaria.aspx';

  constructor(@InjectModel(Liturgia.name) private liturgiaModel: Model<LiturgiaDocument>) {}

  // Atualiza a liturgia do dia
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    timeZone: 'America/Sao_Paulo',
  })
  async updateDailyReadings(): Promise<LiturgiaDocument> {
    try {
      const { data: html } = await axios.get(this.URL, { timeout: 30000 });
      const $ = cheerio.load(html);

      const getTextFromDiv = (id: string): string | null => {
        const div = $(`#${id}`);
        if (!div.length) return null;
        return div
          .find('p')
          .map((_, el) => $(el).text().trim())
          .get()
          .filter(Boolean)
          .join('\n');
      };

      const data = {
        primeira_leitura: getTextFromDiv('liturgia-1'),
        salmo: getTextFromDiv('liturgia-2'),
        segunda_leitura: getTextFromDiv('liturgia-3'),
        evangelho: getTextFromDiv('liturgia-4'),
        fonte: this.URL,
      };

      const today = new Date().toISOString().slice(0, 10);

      const updated = await this.liturgiaModel.findOneAndUpdate(
        { date: today },
        { ...data, date: today },
        { upsert: true, new: true },
      );

      this.logger.log('Liturgia do dia atualizada com sucesso');
      return updated;
    } catch (error) {
      this.logger.error('Erro ao atualizar liturgia diária', error);
      throw error;
    }
  }

  // Atualiza a reflexão diária
  @Cron(CronExpression.EVERY_DAY_AT_1AM, {
    timeZone: 'America/Sao_Paulo',
  })
  async updateDailyReflection(): Promise<LiturgiaDocument> {
    try {
      const { data: html } = await axios.get(this.REFLEXAO_URL, { timeout: 30000 });
      const $ = cheerio.load(html);

      const container = $('.contenedor');
      if (!container.length) throw new Error('Div .contenedor não encontrada');

      // Remove anúncios e scripts
      container.find('iframe, script, .ads, .google-ad').remove();

      const reflexaoHtml = container
        .find('p')
        .map((_, el) => $.html(el))
        .get()
        .join('\n');

      if (!reflexaoHtml) throw new Error('Não foi possível capturar a reflexão diária.');

      const today = new Date().toISOString().slice(0, 10);

      const updated = await this.liturgiaModel.findOneAndUpdate(
        { date: today },
        { reflexao: reflexaoHtml, date: today },
        { upsert: true, new: true },
      );

      this.logger.log('Reflexão do dia atualizada com sucesso');
      return updated;
    } catch (error) {
      this.logger.error('Erro ao atualizar reflexão diária', error);
      throw error;
    }
  }

  // Busca de hoje
  async getToday(): Promise<LiturgiaDocument> {
    const today = new Date().toISOString().slice(0, 10);
    const result = await this.liturgiaModel.findOne({ date: today }).exec();
    if (!result) throw new Error('Liturgia não encontrada para hoje');
    return result;
  }

  // Busca por data específica
  async getByDate(date: string): Promise<LiturgiaDocument> {
    const result = await this.liturgiaModel.findOne({ date }).exec();
    if (!result) throw new Error(`Liturgia não encontrada para a data: ${date}`);
    return result;
  }
}
