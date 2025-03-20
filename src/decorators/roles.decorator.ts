import { SetMetadata } from '@nestjs/common';

// Le décorateur prend une liste de rôles
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
