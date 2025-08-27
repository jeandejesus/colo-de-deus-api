// src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport'; // Importe o PassportModule
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtStrategy } from './jwt/jwt.strategy'; // Importe a nossa estratégia

@Module({
  imports: [
    UsersModule,
    PassportModule, // Adicione o PassportModule
    JwtModule.register({
      secret: process.env.JWT_SECRET as string,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // Adicione a JwtStrategy
  exports: [AuthService], // Exporte o AuthService para que possa ser usado por outros módulos
})
export class AuthModule {}
