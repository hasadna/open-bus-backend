import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { setupGracefulShutdown } from './utils/gracefulShutdown';
import packageJson from 'package.json';

const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT || 3001);
const DEV_MODE = process.env.NODE_ENV !== 'production';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: {
        level: process.env.LOG_LEVEL || (DEV_MODE ? 'debug' : 'info'),
        transport: DEV_MODE
          ? {
              options: {
                colorize: true,
                ignore: 'pid,hostname',
                singleLine: false,
                translateTime: 'SYS:standard',
              },
              target: 'pino-pretty',
            }
          : undefined,
      },
    }),
  );

  // Enable CORS
  app.enableCors({ origin: '*' });

  // Enable validation
  app.useGlobalPipes(new ValidationPipe());

  // Enable global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('Open Bus Backend API')
    .setDescription('API for reporting issues to GitHub')
    .setVersion(packageJson.version)
    .addTag('Complaints', 'Complaint submission to government')
    .addTag('Government Transportation', 'Government transportation data endpoints')
    .addTag('Health', 'Health check endpoints')
    .addTag('Issues', 'GitHub issue management')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      deepLinking: true,
      displayRequestDuration: true,
      docExpansion: 'list',
      filter: true,
      operationsSorter: 'alpha',
      tagsSorter: 'alpha',
      tryItOutEnabled: true,
    },
  });

  // Setup graceful shutdown
  setupGracefulShutdown(app.getHttpAdapter().getInstance());

  await app.listen(PORT, HOST);
}

bootstrap();
