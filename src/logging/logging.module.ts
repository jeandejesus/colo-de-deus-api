import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { LoggingService } from './logging.service';

@Module({
  imports: [LoggerModule.forRoot()], // necessário
  providers: [LoggingService],
  exports: [LoggingService],
})
export class LoggingModule {}
