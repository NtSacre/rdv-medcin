import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
 // Importer JwtAuthGuard
import { Reflector } from '@nestjs/core';
import { Role } from 'src/roles/role.entity'; // Si tu as une entité Role
import { JwtAuthGuard } from '../jwt-auth/jwt-auth.guard';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector, 
    private readonly jwtAuthGuard: JwtAuthGuard
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Vérification de l'authentification via JwtAuthGuard
    const isAuthenticated = await this.jwtAuthGuard.canActivate(context);
    if (!isAuthenticated) {
      return false; // L'utilisateur n'est pas authentifié
    }

    // Récupérer le rôle requis de la route
    const requiredRoles = this.reflector.get<Role[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true; // Si aucun rôle n'est spécifié, on permet l'accès
    }

    // Vérifier si l'utilisateur a un rôle valide
    const request = context.switchToHttp().getRequest();
    const user = request.user; // `user` est accessible depuis `request` grâce à JwtAuthGuard

    // Vérifier si l'utilisateur a un des rôles requis
    if (requiredRoles.some(role => role === user.role)) {
      return true; // L'utilisateur a un rôle valide
    }

    throw new ForbiddenException('Accès interdit. Rôle insuffisant');
  }
}
