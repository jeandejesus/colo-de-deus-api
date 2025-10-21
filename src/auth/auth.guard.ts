// src/auth/guards/auth.guard.ts

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';

@Injectable()
export class AuthGuard extends PassportAuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // 1. Verifique se a rota tem a flag @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 2. Se a rota for pública, retorne true imediatamente
    if (isPublic) {
      return true;
    }

    // 3. Caso contrário, continue com a autenticação padrão do JWT
    const result = super.canActivate(context);

    if (typeof result === 'boolean' && result === false) {
      throw new UnauthorizedException('Você não tem permissão para acessar esta rota.');
    }

    return result;
  }
}
