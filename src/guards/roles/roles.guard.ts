import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!requiredRoles) {
      return true; // Pas de restriction de rôle
    }

    const user = request.user; // Rempli par JwtAuthGuard
    if (!user || !user.role) {
      throw new ForbiddenException('Rôle non défini');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Accès interdit. Rôle insuffisant');
    }

    return true;
  }
}