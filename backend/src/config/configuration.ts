export default () => ({
  port: parseInt(process.env.PORT ?? '4000', 10),
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwt: {
    secret: process.env.JWT_SECRET ?? '',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
  },
  corsOrigin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  storageProvider: process.env.STORAGE_PROVIDER ?? 'local',
});
