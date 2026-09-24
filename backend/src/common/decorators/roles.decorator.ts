import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export type AppRole = 'ADMIN' | 'WORKER';

/** @Roles('ADMIN') atau @Roles('ADMIN','WORKER') */
export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);
