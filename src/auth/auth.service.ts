/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/auth/auth.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import { UserDocument } from 'src/users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    const user = await this.usersService.create(registerUserDto);
    const { password, ...result } = user.toObject();
    return result;
  }

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.validateUser(
      loginUserDto.email,
      loginUserDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    // ➡️ 1. Inclua o 'role' no payload do token
    const payload = {
      email: user.email,
      sub: user._id,
      role: user.role, // Adicione o papel aqui
    };

    return {
      access_token: this.jwtService.sign(payload),
      // ➡️ 2. Opcional: Retorne o papel e o nome do usuário na resposta para o front-end
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
