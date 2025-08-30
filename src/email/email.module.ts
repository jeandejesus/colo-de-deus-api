import { Module } from '@nestjs/common';
import { EmailService } from './email.service';

@Module({
  providers: [EmailService],
  exports: [EmailService], // ✅ Exporte o serviço para ser usado em outros módulos
})
export class EmailModule {}
