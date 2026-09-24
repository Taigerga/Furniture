import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, AppRole } from '../decorators/roles.decorator.js';

/**
 * Pengganti requireAdmin/requireWorker/requireOwnerOrAdmin.
 * Untuk owner-check tetap panggil assertOwnerOrAdmin() di service.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<AppRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;
    const req = context.switchToHttp().getRequest();
    const role = req.user?.role as AppRole | undefined;
    if (!role || !required.includes(role)) {
      throw new ForbiddenException('Tidak memiliki akses.');
    }
    return true;
  }
}

export function assertOwnerOrAdmin(
  createdById: string,
  user: { sub: string; role: string } | { id: string; role: string },
) {
  const uid = 'sub' in user ? user.sub : user.id;
  if (user.role !== 'ADMIN' && createdById !== uid) {
    throw new ForbiddenException('Anda hanya dapat mengelola data milik sendiri.');
  }
}

/**
 * Kunci DRAF milik pekerja dari tangan admin.
 * Pindahan 1:1 dari assertAdminCanModify di my-app/lib/actions/helpers.ts.
 */
export async function assertAdminCanModify(
  input: {
    createdById: string;
    approvalStatus: string;
    adminId: string;
    kind: 'edit' | 'delete';
  },
  findCreator: (id: string) => Promise<{ isActive: boolean } | null>,
): Promise<void> {
  if (input.createdById === input.adminId || input.approvalStatus !== 'DRAFT') return;
  if (input.kind === 'delete') {
    const creator = await findCreator(input.createdById);
    if (creator && !creator.isActive) return;
  }
  throw new ForbiddenException(
    'Draf milik pekerja hanya dapat dikelola pemiliknya. Minta ia yang mengubah/menghapus, atau tunggu sampai diajukan.',
  );
}
