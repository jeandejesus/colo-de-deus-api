// src/logging/logging.service.ts
import { Injectable } from '@nestjs/common';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';

@Injectable()
export class LoggingService {
  constructor(
    @InjectPinoLogger(LoggingService.name)
    private readonly logger: PinoLogger, // ⬅ aqui
  ) {}

  log(message: string) {
    this.logger.info(message); // ✅ agora funciona
  }

  error(message: string, trace?: string) {
    this.logger.error({ trace }, message);
  }

  warn(message: string) {
    this.logger.warn(message);
  }
}
