// src/auth/guards/roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles) {
      return true; // Se a rota não exige um papel, o acesso é liberado.
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // O usuário é anexado à requisição pelo JWT Strategy

    if (!user || !user.role || !requiredRoles.includes(user.role)) {
      throw new UnauthorizedException(
        'Você não tem permissão para acessar esta funcionalidade.',
      );
    }

    return true;
  }
}
