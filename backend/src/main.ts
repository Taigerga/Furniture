import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const origins = config.get<string[]>('corsOrigin') ?? ['http://localhost:3000'];
  app.enableCors({ origin: origins, credentials: true });

  const swagger = new DocumentBuilder()
    .setTitle('Furniture API')
    .setDescription('REST API Next.js frontend -> NestJS backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const doc = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup('api-docs', app, doc);

  const port = config.get<number>('port') ?? 4000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${port} (docs: /api-docs)`);
}
await bootstrap();
