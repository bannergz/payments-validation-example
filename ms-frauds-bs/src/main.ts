import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';

// Importar y registrar codec Snappy de forma dinámica
await import('./commons/register-snappy.cjs');

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Enable request validation globally (class-validator)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // bind explicitly to 0.0.0.0 when running in containerized environments
  const port = process.env.SERVER_PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 App running on port ${port}`);
}
bootstrap();
