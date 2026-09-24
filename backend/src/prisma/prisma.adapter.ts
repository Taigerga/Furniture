import { PrismaMariaDb } from '@prisma/adapter-mariadb';

/** Bangun driver adapter MySQL dari satu DATABASE_URL (format mysql://user:pass@host:port/db). */
export function createDbAdapter(databaseUrl: string): PrismaMariaDb {
  const url = new URL(databaseUrl);
  if (!url.hostname) throw new Error('DATABASE_URL tidak valid (host kosong).');
  return new PrismaMariaDb({
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, '')),
    connectionLimit: 5,
  });
}
