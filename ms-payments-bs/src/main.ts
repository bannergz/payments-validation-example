import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { GraphQLExceptionFilter } from './filters/graphql-exception.filter.js';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// Importar y registrar codec Snappy de forma dinámica
await import('./commons/register-snappy.cjs');

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Apply global exception filter for GraphQL validation errors
  app.useGlobalFilters(new GraphQLExceptionFilter());

  // Enable request validation globally (class-validator)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger/OpenAPI setup
  const config = new DocumentBuilder()
    .setTitle('Payments Service API')
    .setDescription('API documentation for Payments Service')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    // Fastify: serve swagger-ui-express via fastify-express under the hood
    swaggerOptions: { persistAuthorization: true },
  });

  // bind explicitly to 0.0.0.0 when running in containerized environments
  const port = process.env.SERVER_PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 App running on port ${port}`);
  console.log(`📚 Swagger UI available at /docs`);
}
bootstrap();
