// src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtStrategy } from './jwt/jwt.strategy';
import { ConfigService, ConfigModule } from '@nestjs/config'; // Importe ConfigService e ConfigModule

@Module({
  imports: [
    UsersModule,
    PassportModule,
    // Use registerAsync para carregar o segredo de forma assíncrona
    JwtModule.registerAsync({
      imports: [ConfigModule], // Importe o ConfigModule aqui
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Use o serviço para obter a chave
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService], // Injete o serviço para que a fábrica possa usá-lo
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
