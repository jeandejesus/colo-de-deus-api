import { forwardRef, Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [forwardRef(() => UsersModule), ConfigModule],
  providers: [EmailService],
  exports: [EmailService], // ✅ Exporte o serviço para ser usado em outros módulos
})
export class EmailModule {}
