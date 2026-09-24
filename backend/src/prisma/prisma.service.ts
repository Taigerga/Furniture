import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '../generated/prisma/client.js';
import { createDbAdapter } from './prisma.adapter.js';

/** Singleton PrismaClient (v7, via driver adapter MariaDB). Pengganti my-app/lib/db.ts.
 * Koneksi lazy agar server tetap bisa start dan mengembalikan error JSON rapi bila DB mati. */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(config: ConfigService) {
    super({ adapter: createDbAdapter(config.getOrThrow<string>('databaseUrl')) });
  }

  async onModuleDestroy() {
    await this.$disconnect().catch(() => undefined);
  }
}
